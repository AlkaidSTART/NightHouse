import * as pc from 'playcanvas';
import { useStoryStore } from '../../stores/storyStore';
import type { SaveData } from '../../shared/types/save';
import { InteractionSystem } from '../interaction/InteractionSystem';
import { PlayerController } from '../player/PlayerController';
import { createNewSave, type SaveManager } from '../save/SaveManager';
import { DEFAULT_SETTINGS } from '../save/defaults';
import { SceneManager } from '../scene/SceneManager';
import type { GameEventBus } from './GameEvents';

const AUTOSAVE_INTERVAL_MS = 5000;

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
    useStoryStore.getState().loadFromSave(initialSave);

    return new GameBootstrap(
      options,
      initialSave,
      settings.mouseSensitivity,
    );
  }

  private readonly app: pc.Application;
  private readonly canvas: HTMLCanvasElement;
  private readonly events: GameEventBus;
  private readonly saveManager: SaveManager;
  private readonly save: SaveData;
  private readonly sceneManager: SceneManager;
  private readonly player: PlayerController;
  private readonly interaction = new InteractionSystem(3);
  private readonly playerPosition = new pc.Vec3();
  private readonly sceneId: string;
  private lastPrompt: string | null = null;
  private autosaveTimer: number | null = null;
  private started = false;
  private hasEntered = false;
  private destroyed = false;

  private constructor(
    options: GameBootstrapOptions,
    save: SaveData,
    sensitivity: number,
  ) {
    this.canvas = options.canvas;
    this.events = options.events;
    this.saveManager = options.saveManager;
    this.save = save;

    const app = new pc.Application(options.canvas, {
      mouse: new pc.Mouse(options.canvas),
      keyboard: new pc.Keyboard(window),
      touch: new pc.TouchDevice(options.canvas),
    });
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio, 2);
    app.scene.ambientLight = new pc.Color(0.07, 0.075, 0.09);
    this.app = app;

    this.sceneManager = new SceneManager(app);
    const scene = this.sceneManager.buildGreybox();
    this.sceneId = scene.sceneId;

    const playerRoot = new pc.Entity('player');
    const camera = new pc.Entity('player_camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.015, 0.017, 0.02),
      fov: 70,
      nearClip: 0.1,
      farClip: 120,
    });
    playerRoot.addChild(camera);
    app.root.addChild(playerRoot);

    const [x, y, z] = save.player.position;
    playerRoot.setPosition(x, y, z);

    this.player = new PlayerController({
      app,
      canvas: options.canvas,
      root: playerRoot,
      camera,
      sensitivity,
      rotation: save.player.rotation,
      bounds: {
        minX: -6.3,
        maxX: 6.3,
        minZ: -5.3,
        maxZ: 5.3,
      },
    });

    for (const descriptor of scene.interactables) {
      this.interaction.register({
        id: descriptor.id,
        entity: descriptor.entity,
        radius: descriptor.radius,
        getPrompt: () => descriptor.prompt,
        canInteract: () => true,
        interact: () => {
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

    this.player.dispose();
    this.interaction.clear();
    this.sceneManager.destroy();
    this.app.destroy();
  }

  private readonly handleUpdate = (dt: number): void => {
    if (this.destroyed) {
      return;
    }

    this.player.update(dt);

    this.playerPosition.copy(this.player.camera.getPosition());
    const prompt = this.interaction.update(this.player.camera, this.playerPosition);
    if (prompt !== this.lastPrompt) {
      this.lastPrompt = prompt;
      this.events.emit('interaction.prompt', { text: prompt });
    }
  };

  private readonly handlePointerLockChange = (): void => {
    if (this.destroyed) {
      return;
    }

    const paused = document.pointerLockElement !== this.canvas;
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
    this.events.emit('game.error', {
      message: '无法锁定鼠标，请再次点击开始探索。',
    });
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat || event.code !== 'KeyE') {
      return;
    }
    if (document.pointerLockElement !== this.canvas) {
      return;
    }
    this.interaction.interact();
  };

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

    try {
      await this.saveManager.writeSave(this.save);
    } catch (error) {
      this.events.emit('game.error', { message: '本地存档写入失败。' });
      console.error('保存进度失败', error);
    }
  }
}
