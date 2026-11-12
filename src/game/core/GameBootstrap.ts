import * as pc from 'playcanvas';
import { clueFlagForId } from '../../content/clues';
import { content } from '../../content';
import { clockPuzzleContent, safePuzzleContent } from '../../content/puzzles';
import { villaGreybox } from '../../content/scenes/villaGreybox';
import { useStoryStore } from '../../stores/storyStore';
import type { PuzzleView } from '../../shared/types/puzzle';
import type { SaveData, Vec3Tuple } from '../../shared/types/save';
import type { SceneNpcSpot, SceneRegion, SceneSpawn } from '../../shared/types/scene';
import { createCollisionWorld, PLAYER_RADIUS, type CollisionWorld } from '../collision/CollisionWorld.ts';
import { buildClueJournalView } from '../clues/clueJournal.ts';
import {
  DialogueSystem,
  type ConversationEndEvent,
} from '../dialogue/DialogueSystem';
import { InspectionSystem } from '../inspection/InspectionSystem';
import { InteractionSystem } from '../interaction/InteractionSystem';
import { PlayerController } from '../player/PlayerController';
import { PlayerHands } from '../player/PlayerHands';
import { ClockPuzzle } from '../puzzles/ClockPuzzle';
import type { PuzzleHost } from '../puzzles/PuzzleHost';
import { SafePuzzle } from '../puzzles/SafePuzzle';
import { createNewSave, type SaveManager } from '../save/SaveManager';
import { DEFAULT_SETTINGS } from '../save/defaults';
import { DoorSystem } from '../scene/DoorSystem.ts';
import { DOOR_THICKNESS } from '../scene/sceneGeometry.ts';
import { NightSky, NIGHT_CLEAR_COLOR } from '../scene/NightSky';
import { SceneManager } from '../scene/SceneManager';
import type { GameEventBus } from './GameEvents';

const AUTOSAVE_INTERVAL_MS = 5000;
const EYE_HEIGHT = 1.7;
const INTERACTION_DISTANCE = 3;
const DOOR_INTERACTION_MIN_RADIUS = 0.6;
const CLOCK_INTERACTABLE_ID = 'INT_prop_longcase_clock';
const SAFE_INTERACTABLE_ID = 'INT_prop_safe';
/** 小地图位置刷新间隔（秒）。不必每帧都推给 React。 */
const POSE_EMIT_INTERVAL = 0.05;

/**
 * 灰盒走查用：开发构建下以 `?unlock=all` 打开页面时忽略门的剧情解锁条件。
 * 线索与谜题系统尚未实现，没有它就无法走进上锁的区域。生产构建中不生效。
 */
function isUnlockAllRequested(): boolean {
  return (
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get('unlock') === 'all'
  );
}

export interface GameBootstrapOptions {
  canvas: HTMLCanvasElement;
  events: GameEventBus;
  saveManager: SaveManager;
  resume: boolean;
}

export class GameBootstrap {
  static async create(options: GameBootstrapOptions): Promise<GameBootstrap> {
    const settings = await options.saveManager
      .loadSettings()
      .catch(() => DEFAULT_SETTINGS);
    const loaded = options.resume
      ? await options.saveManager.loadSave().catch(() => null)
      : null;

    const initialSave = loaded ?? createNewSave();
    const collision = createCollisionWorld(villaGreybox);
    const spawn = villaGreybox.spawns[0];
    if (!spawn) {
      throw new Error('场景缺少出生点。');
    }
    // 新游戏从出生点开始；旧存档的位置如果已不可站立（例如布局变更后落在墙里），也回到出生点。
    if (!loaded || !isSavedPositionValid(initialSave, collision)) {
      placeAtSpawn(initialSave, spawn);
    }
    useStoryStore.getState().loadFromSave(initialSave);

    return new GameBootstrap(
      options,
      initialSave,
      settings.mouseSensitivity,
      collision,
    );
  }

  private readonly app: pc.Application;
  private readonly canvas: HTMLCanvasElement;
  private readonly events: GameEventBus;
  private readonly saveManager: SaveManager;
  private readonly save: SaveData;
  private readonly sceneManager: SceneManager;
  private readonly nightSky: NightSky;
  private readonly player: PlayerController;
  private readonly hands: PlayerHands;
  private readonly doors: DoorSystem;
  private readonly interaction: InteractionSystem;
  private readonly dialogue: DialogueSystem;
  private readonly inspection: InspectionSystem;
  private readonly clockPuzzle: ClockPuzzle;
  private readonly safePuzzle: SafePuzzle;
  private readonly clueTitles: ReadonlyMap<string, string>;
  private readonly regionNames: ReadonlyMap<string, string>;
  private readonly npcNames: ReadonlyMap<string, string>;
  private readonly unsubscribeStory: () => void;
  private readonly playerPosition = new pc.Vec3();
  private readonly sceneId: string;
  private readonly regions: readonly SceneRegion[];
  private currentRegionId: string | null = null;
  private lastPrompt: string | null = null;
  private poseEmitElapsed = 0;
  private autosaveTimer: number | null = null;
  private started = false;
  private hasEntered = false;
  private dialogueOpen = false;
  private inspectionOpen = false;
  private journalOpen = false;
  private activePuzzle: 'clock' | 'safe' | null = null;
  private destroyed = false;

  private constructor(
    options: GameBootstrapOptions,
    save: SaveData,
    sensitivity: number,
    collision: CollisionWorld,
  ) {
    this.canvas = options.canvas;
    this.events = options.events;
    this.saveManager = options.saveManager;
    this.save = save;
    this.regions = villaGreybox.regions;
    this.interaction = new InteractionSystem(
      INTERACTION_DISTANCE,
      (origin, direction, maxDistance) =>
        collision.raycast(
          origin.x,
          origin.y,
          origin.z,
          direction.x,
          direction.y,
          direction.z,
          maxDistance,
        ),
    );
    this.clueTitles = new Map(content.clues.map((clue) => [clue.id, clue.title]));
    this.regionNames = new Map(
      villaGreybox.regions.map((region) => [region.id, region.name]),
    );
    this.npcNames = new Map(content.npcs.map((npc) => [npc.id, npc.name]));

    this.dialogue = new DialogueSystem({
      dialogues: content.dialogues,
      npcNames: this.npcNames,
      host: {
        getFlags: () => useStoryStore.getState().storyFlags,
        setFlag: (key, value) =>
          useStoryStore.getState().setStoryFlag(key, value),
        discoverClue: (clueId) => {
          const store = useStoryStore.getState();
          store.discoverClue(clueId);
          store.setStoryFlag(clueFlagForId(clueId), true);
        },
        recordChoice: (nodeId, choiceId) =>
          useStoryStore.getState().recordChoice(nodeId, choiceId),
        onChange: (view) => {
          this.events.emit('dialogue.changed', { view });
          if (view === null) {
            this.finishDialogue();
          }
        },
        onConversationEnd: (event) => this.handleConversationEnd(event),
      },
    });

    this.inspection = new InspectionSystem({
      inspectables: content.inspectables,
      host: {
        getFlags: () => useStoryStore.getState().storyFlags,
        setFlag: (key, value) =>
          useStoryStore.getState().setStoryFlag(key, value),
        discoverClue: (clueId) => {
          const store = useStoryStore.getState();
          if (store.discoveredClueIds.includes(clueId)) {
            return false;
          }
          store.discoverClue(clueId);
          store.setStoryFlag(clueFlagForId(clueId), true);
          return true;
        },
        getClueTitle: (clueId) => this.clueTitles.get(clueId) ?? null,
        onChange: (view) => {
          this.events.emit('inspection.changed', { view });
          if (view === null) {
            this.finishInspection();
          }
        },
      },
    });

    const puzzleHost: PuzzleHost = {
      getFlags: () => useStoryStore.getState().storyFlags,
      setFlag: (key, value) =>
        useStoryStore.getState().setStoryFlag(key, value),
      discoverClue: (clueId) => {
        const store = useStoryStore.getState();
        if (store.discoveredClueIds.includes(clueId)) {
          return null;
        }
        store.discoverClue(clueId);
        store.setStoryFlag(clueFlagForId(clueId), true);
        return this.clueTitles.get(clueId) ?? clueId;
      },
      completePuzzle: (puzzleId) =>
        useStoryStore.getState().completePuzzle(puzzleId),
    };
    this.clockPuzzle = new ClockPuzzle(clockPuzzleContent, puzzleHost);
    this.safePuzzle = new SafePuzzle(safePuzzleContent, puzzleHost);

    const app = new pc.Application(options.canvas, {
      mouse: new pc.Mouse(options.canvas),
      keyboard: new pc.Keyboard(window),
      touch: new pc.TouchDevice(options.canvas),
    });
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio, 2);
    app.scene.ambientLight = new pc.Color(0.1, 0.105, 0.125);
    this.app = app;

    this.sceneManager = new SceneManager(app);
    const scene = this.sceneManager.build(villaGreybox);
    this.sceneManager.applyStoryFlags(useStoryStore.getState().storyFlags);
    // 剧情标记变化后重新选择 NPC 站位；同一角色始终只显示一个人。
    this.unsubscribeStory = useStoryStore.subscribe((state) => {
      this.sceneManager.applyStoryFlags(state.storyFlags);
    });
    if (villaGreybox.modelUrl) {
      void this.sceneManager.loadModel(villaGreybox.modelUrl).catch((error: unknown) => {
        console.warn('场景 GLB 加载失败，继续使用灰盒几何：', error);
      });
    }
    if (villaGreybox.characterModelUrls) {
      void this.sceneManager
        .loadCharacterModels(villaGreybox.characterModelUrls)
        .catch((error: unknown) => {
          console.warn('NPC 角色模型加载失败，继续使用占位方盒：', error);
        });
    }
    this.sceneId = scene.sceneId;
    this.doors = new DoorSystem({
      doors: villaGreybox.doors,
      collision,
      getFlags: () => useStoryStore.getState().storyFlags,
      unlockAll: isUnlockAllRequested(),
      onChange: (doorId, open) => this.sceneManager.setDoorOpen(doorId, open),
    });

    const playerRoot = new pc.Entity('player');
    // 相机效果层：步伐摇晃和冲击震动只写这一层，相机本体保持基准姿态。
    const cameraOffset = new pc.Entity('player_camera_offset');
    const camera = new pc.Entity('player_camera');
    camera.addComponent('camera', {
      clearColor: NIGHT_CLEAR_COLOR,
      fov: 70,
      nearClip: 0.1,
      farClip: 160,
    });
    playerRoot.addChild(cameraOffset);
    cameraOffset.addChild(camera);
    app.root.addChild(playerRoot);
    this.nightSky = new NightSky(app, camera);

    const [x, y, z] = save.player.position;
    playerRoot.setPosition(x, y, z);

    this.player = new PlayerController({
      app,
      canvas: options.canvas,
      root: playerRoot,
      offset: cameraOffset,
      camera,
      sensitivity,
      rotation: save.player.rotation,
      collision,
      eyeHeight: EYE_HEIGHT,
    });
    this.hands = new PlayerHands(app, playerRoot);

    for (const handle of scene.doors) {
      const doorId = handle.door.id;
      this.interaction.register({
        id: doorId,
        entity: handle.anchor,
        // 宽门（双开门、铁门）的可对准范围随门宽放大。
        radius: Math.max(DOOR_INTERACTION_MIN_RADIUS, handle.door.width * 0.5),
        occlusionSlack: DOOR_THICKNESS / 2 + 0.02,
        getPrompt: () => this.doors.getPrompt(doorId),
        canInteract: () => true,
        interact: (context) => {
          const result = this.doors.use(
            doorId,
            context.playerPosition.x,
            context.playerPosition.z,
          );
          if (result.kind === 'locked' || result.kind === 'blocked') {
            this.events.emit('interaction.activated', {
              id: doorId,
              message: result.message,
            });
          }
        },
      });
    }

    for (const descriptor of scene.interactables) {
      const npcId = descriptor.npcId;
      if (descriptor.kind === 'npc' && npcId) {
        this.interaction.register({
          id: descriptor.id,
          entity: descriptor.entity,
          radius: descriptor.radius,
          getPrompt: () => descriptor.prompt,
          canInteract: () => this.sceneManager.isNpcSpotActive(descriptor.id),
          interact: () => this.openDialogue(npcId, descriptor.id),
        });
        continue;
      }

      this.interaction.register({
        id: descriptor.id,
        entity: descriptor.entity,
        radius: descriptor.radius,
        getPrompt: () => descriptor.prompt,
        canInteract: () => true,
        interact: () => {
          if (descriptor.id === CLOCK_INTERACTABLE_ID) {
            this.beginClockPuzzle();
            return;
          }
          if (descriptor.id === SAFE_INTERACTABLE_ID) {
            this.beginSafePuzzle();
            return;
          }
          if (this.inspection.has(descriptor.id)) {
            this.beginInspection(descriptor.id);
            return;
          }
          this.events.emit('interaction.activated', {
            id: descriptor.id,
            message: descriptor.message,
          });
        },
      });
    }

    app.on('update', this.handleUpdate);
  }

  start(): void {
    if (this.started || this.destroyed) {
      return;
    }
    this.started = true;

    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    document.addEventListener('pointerlockerror', this.handlePointerLockError);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    this.autosaveTimer = window.setInterval(() => {
      void this.persist();
    }, AUTOSAVE_INTERVAL_MS);

    this.player.setPaused(true);
    this.app.start();
    this.events.emit('game.ready', { sceneId: this.sceneId });
  }

  resume(): void {
    if (this.destroyed) {
      return;
    }
    this.player.requestPointerLock();
  }

  setSensitivity(sensitivity: number): void {
    this.player.setSensitivity(sensitivity);
  }

  advanceDialogue(): void {
    this.dialogue.advance();
  }

  chooseDialogue(choiceId: string): void {
    this.dialogue.choose(choiceId);
  }

  closeDialogue(): void {
    this.dialogue.close();
  }

  closeInspection(): void {
    this.inspection.close();
  }

  closeClueJournal(): void {
    if (!this.journalOpen) {
      return;
    }
    this.journalOpen = false;
    this.events.emit('clues.changed', { view: null });
    this.player.requestPointerLock();
  }

  closePuzzle(): void {
    if (!this.activePuzzle) {
      return;
    }
    this.activePuzzle = null;
    this.events.emit('puzzle.changed', { view: null });
    this.player.requestPointerLock();
  }

  actPuzzle(actionId: string): void {
    if (this.activePuzzle !== 'clock') {
      return;
    }
    this.events.emit('puzzle.changed', {
      view: this.clockPuzzle.act(actionId),
    });
  }

  submitPuzzleCode(code: string): void {
    if (this.activePuzzle !== 'safe') {
      return;
    }
    this.events.emit('puzzle.changed', {
      view: this.safePuzzle.submit(code),
    });
  }

  private beginClockPuzzle(): void {
    if (this.clockPuzzle.isSolved()) {
      this.beginInspection(CLOCK_INTERACTABLE_ID);
      return;
    }
    this.openPuzzle('clock', this.clockPuzzle.open());
  }

  private beginSafePuzzle(): void {
    if (this.safePuzzle.isSolved()) {
      this.beginInspection(SAFE_INTERACTABLE_ID);
      return;
    }
    this.openPuzzle('safe', this.safePuzzle.open());
  }

  private openPuzzle(kind: 'clock' | 'safe', view: PuzzleView): void {
    if (
      this.dialogueOpen ||
      this.inspectionOpen ||
      this.journalOpen ||
      this.activePuzzle
    ) {
      return;
    }

    this.activePuzzle = kind;
    this.player.setPaused(true);
    this.lastPrompt = null;
    this.events.emit('interaction.prompt', { text: null });
    this.events.emit('puzzle.changed', { view });
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  }

  private openClueJournal(): void {
    if (
      this.dialogueOpen ||
      this.inspectionOpen ||
      this.journalOpen ||
      this.activePuzzle
    ) {
      return;
    }

    this.journalOpen = true;
    this.player.setPaused(true);
    this.lastPrompt = null;
    this.events.emit('interaction.prompt', { text: null });
    this.emitClueJournal();
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  }

  private emitClueJournal(): void {
    const store = useStoryStore.getState();
    this.events.emit('clues.changed', {
      view: buildClueJournalView({
        clues: content.clues,
        discoveredClueIds: store.discoveredClueIds,
        regionNames: this.regionNames,
        npcNames: this.npcNames,
      }),
    });
  }

  private beginInspection(id: string): void {
    if (
      this.dialogueOpen ||
      this.journalOpen ||
      this.activePuzzle ||
      this.inspection.active
    ) {
      return;
    }

    this.inspectionOpen = true;
    this.player.setPaused(true);
    this.lastPrompt = null;
    this.events.emit('interaction.prompt', { text: null });
    if (!this.inspection.open(id)) {
      this.inspectionOpen = false;
      this.player.requestPointerLock();
      return;
    }
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  }

  private finishInspection(): void {
    if (!this.inspectionOpen) {
      return;
    }
    this.inspectionOpen = false;
    this.player.requestPointerLock();
  }

  private openDialogue(npcId: SceneNpcSpot['npcId'], spotId: string): void {
    if (
      this.dialogue.active ||
      this.inspectionOpen ||
      this.journalOpen ||
      this.activePuzzle
    ) {
      return;
    }
    if (!this.dialogue.openForNpc(npcId, spotId)) {
      this.events.emit('interaction.activated', {
        id: spotId,
        message: '现在还不是说话的时候。',
      });
      return;
    }

    this.dialogueOpen = true;
    this.sceneManager.setNpcTalking(npcId);
    this.player.setPaused(true);
    this.lastPrompt = null;
    this.events.emit('interaction.prompt', { text: null });
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  }

  private finishDialogue(): void {
    if (!this.dialogueOpen) {
      return;
    }
    this.dialogueOpen = false;
    this.sceneManager.setNpcTalking(null);
    this.player.requestPointerLock();
  }

  /**
   * 一段对话结束（或玩家中途关掉）后推进出场阶段。
   * 这里只在玩家真正谈过之后点亮下一个角色的出场条件，
   * 选项里的 `met_*` 仍只表示「已见面」，不再兼作换位开关。
   */
  private handleConversationEnd(event: ConversationEndEvent): void {
    if (!event.completed) {
      return;
    }
    const store = useStoryStore.getState();

    if (event.npcId === 'npc_housekeeper') {
      store.setStoryFlag('story.arthur_called', true);
      return;
    }

    if (event.npcId === 'npc_arthur') {
      store.setStoryFlag('story.arthur_talked', true);
      if (store.storyFlags['story.met_doctor'] !== true) {
        store.setStoryFlag('story.met_doctor', true);
        this.events.emit('interaction.activated', {
          id: 'story.doctor_arrived',
          message: '格雷医生到了。他在门厅跺掉靴子上的泥。',
        });
      }
    }
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }

    if (this.started) {
      void this.persist();
    }

    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }

    this.destroyed = true;
    if (this.autosaveTimer !== null) {
      window.clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }

    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    document.removeEventListener('pointerlockerror', this.handlePointerLockError);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);

    this.unsubscribeStory();
    this.player.dispose();
    this.hands.dispose();
    this.interaction.clear();
    this.nightSky.destroy();
    this.sceneManager.destroy();
    this.app.destroy();
  }

  private readonly handleUpdate = (dt: number): void => {
    if (this.destroyed) {
      return;
    }

    this.player.update(dt);
    this.hands.update(dt);
    this.sceneManager.update(dt);
    // 门在 UI 打开时也继续合上，但不能把站在门边的玩家夹住。
    const [feetX, , feetZ] = this.player.getFeetPosition();
    this.doors.update(dt, feetX, feetZ);

    if (
      this.dialogueOpen ||
      this.inspectionOpen ||
      this.journalOpen ||
      this.activePuzzle
    ) {
      return;
    }

    this.playerPosition.copy(this.player.camera.getPosition());
    const prompt = this.interaction.update(this.player.camera, this.playerPosition);
    if (prompt !== this.lastPrompt) {
      this.lastPrompt = prompt;
      this.events.emit('interaction.prompt', { text: prompt });
    }

    this.updateRegion();
    this.emitPlayerPose(dt);
  };

  private emitPlayerPose(dt: number): void {
    this.poseEmitElapsed += dt;
    if (this.poseEmitElapsed < POSE_EMIT_INTERVAL) {
      return;
    }
    this.poseEmitElapsed = 0;
    this.events.emit('player.position', {
      position: this.player.getFeetPosition(),
      rotation: this.player.getRotation(),
    });
  }

  private updateRegion(): void {
    const [x, y, z] = this.player.getFeetPosition();
    const region = findRegion(this.regions, x, y, z);
    // 门洞等不属于任何区域的缝隙里保持上一个区域，避免提示闪烁。
    if (!region || region.id === this.currentRegionId) {
      return;
    }
    this.currentRegionId = region.id;
    this.events.emit('region.changed', {
      regionId: region.id,
      name: region.name,
    });
    this.applyStoryProgress(region.id);
  }

  private applyStoryProgress(regionId: string): void {
    const store = useStoryStore.getState();
    const flags = store.storyFlags;

    if (regionId === 'villa_hall' && flags['story.arrived'] !== true) {
      store.setStoryFlag('story.arrived', true);
      store.setStoryFlag('story.has_letter', true);
      store.discoverClue('clue_evelyn_letter');
      store.setStoryFlag(clueFlagForId('clue_evelyn_letter'), true);
      this.events.emit('interaction.activated', {
        id: 'story.arrived',
        message: '门厅的座钟停在十一点五十五分。你口袋里的那封信忽然有了重量。',
      });
    }

    // 防卡关兜底：玩家跳过霍尔太太直接走进客厅时，亚瑟照常出场。
    if (regionId === 'villa_parlor' && flags['story.arthur_called'] !== true) {
      store.setStoryFlag('story.arthur_called', true);
    }
  }

  private readonly handlePointerLockChange = (): void => {
    if (this.destroyed) {
      return;
    }

    const paused = document.pointerLockElement !== this.canvas;
    if (
      this.dialogueOpen ||
      this.inspectionOpen ||
      this.journalOpen ||
      this.activePuzzle
    ) {
      this.player.setPaused(true);
      return;
    }
    if (!paused) {
      this.hasEntered = true;
    }
    this.player.setPaused(paused);
    this.events.emit('pause.changed', { paused });

    if (paused) {
      this.lastPrompt = null;
      this.events.emit('interaction.prompt', { text: null });
      void this.persist();
    }
  };

  private readonly handlePointerLockError = (): void => {
    if (this.destroyed) {
      return;
    }
    this.events.emit('pause.changed', { paused: true });
    this.events.emit('game.error', {
      message: '无法锁定鼠标，请点击继续游戏后重试。',
    });
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (this.activePuzzle) {
      if (!event.repeat && event.code === 'Escape') {
        event.preventDefault();
        this.closePuzzle();
      }
      return;
    }
    if (this.journalOpen) {
      if (
        !event.repeat &&
        (event.code === 'Escape' || event.code === 'KeyJ')
      ) {
        event.preventDefault();
        this.closeClueJournal();
      }
      return;
    }
    if (this.inspection.active) {
      if (
        !event.repeat &&
        (event.code === 'Escape' || event.code === 'KeyE')
      ) {
        event.preventDefault();
        this.closeInspection();
      }
      return;
    }
    if (this.dialogue.active) {
      this.handleDialogueKey(event);
      return;
    }
    if (event.repeat) {
      return;
    }
    if (event.code === 'KeyJ') {
      if (document.pointerLockElement !== this.canvas) {
        return;
      }
      event.preventDefault();
      this.openClueJournal();
      return;
    }
    if (event.code !== 'KeyE') {
      return;
    }
    if (document.pointerLockElement !== this.canvas) {
      return;
    }
    if (this.interaction.interact()) {
      this.hands.triggerInteract();
    }
  };

  private handleDialogueKey(event: KeyboardEvent): void {
    if (event.repeat) {
      return;
    }

    if (event.code === 'Escape') {
      event.preventDefault();
      this.dialogue.close();
      return;
    }

    const view = this.dialogue.view();
    if (!view) {
      return;
    }

    if (
      event.code === 'KeyE' ||
      event.code === 'Enter' ||
      event.code === 'Space'
    ) {
      event.preventDefault();
      if (view.canContinue) {
        this.dialogue.advance();
      } else if (view.choices.length === 1) {
        const only = view.choices[0];
        if (only) {
          this.dialogue.choose(only.id);
        }
      }
      return;
    }

    const digit = /^Digit([1-9])$/.exec(event.code);
    if (!digit) {
      return;
    }
    const index = Number(digit[1]) - 1;
    const choice = view.canContinue ? undefined : view.choices[index];
    if (choice) {
      event.preventDefault();
      this.dialogue.choose(choice.id);
    }
  }

  private readonly handleResize = (): void => {
    this.app.resizeCanvas();
  };

  private readonly handleBeforeUnload = (): void => {
    void this.persist();
  };

  private async persist(): Promise<void> {
    if (this.destroyed || !this.hasEntered) {
      return;
    }

    this.save.currentSceneId = this.sceneId;
    this.save.player.position = this.player.getPosition();
    this.save.player.rotation = this.player.getRotation();

    const story = useStoryStore.getState();
    this.save.storyFlags = { ...story.storyFlags };
    this.save.discoveredClueIds = [...story.discoveredClueIds];
    this.save.completedPuzzleIds = [...story.completedPuzzleIds];
    this.save.completedQuestIds = [...story.completedQuestIds];
    this.save.npcStates = { ...story.npcStates };
    this.save.choices = { ...story.choices };

    try {
      await this.saveManager.writeSave(this.save);
    } catch (error) {
      this.events.emit('game.error', { message: '本地存档写入失败。' });
      console.error('保存进度失败', error);
    }
  }
}

function findRegion(
  regions: readonly SceneRegion[],
  x: number,
  y: number,
  z: number,
): SceneRegion | null {
  for (const region of regions) {
    for (const volume of region.volumes) {
      if (
        x >= volume.min[0] &&
        x <= volume.max[0] &&
        y >= volume.min[1] &&
        y < volume.max[1] &&
        z >= volume.min[2] &&
        z <= volume.max[2]
      ) {
        return region;
      }
    }
  }
  return null;
}

function isSavedPositionValid(
  save: SaveData,
  collision: CollisionWorld,
): boolean {
  const [x, eyeY, z] = save.player.position;
  const feetY = eyeY - EYE_HEIGHT;
  const ground = collision.groundHeight(x, z, feetY);
  return (
    ground !== null &&
    Math.abs(ground - feetY) < 0.05 &&
    collision.isStandable(x, z, feetY, PLAYER_RADIUS)
  );
}

function placeAtSpawn(save: SaveData, spawn: SceneSpawn): void {
  const position: Vec3Tuple = [
    spawn.position[0],
    spawn.position[1] + EYE_HEIGHT,
    spawn.position[2],
  ];
  save.player.position = position;
  save.player.rotation = [spawn.yaw, 0, 0];
}
