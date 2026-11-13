import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer, type ViteDevServer } from 'vite';
import { clueFlagForId } from '../src/content/clues.ts';
import { endings, presentEnding } from '../src/content/endings.ts';
import { content } from '../src/content/index.ts';
import { inspectables } from '../src/content/inspectables.ts';
import { safePuzzleContent } from '../src/content/puzzles.ts';
import { quests } from '../src/content/quests.ts';
import {
  DialogueSystem,
  type DialogueHost,
} from '../src/game/dialogue/DialogueSystem.ts';
import { InspectionSystem } from '../src/game/inspection/InspectionSystem.ts';
import { SafePuzzle } from '../src/game/puzzles/SafePuzzle.ts';
import { resolveEnding } from '../src/game/story/endingResolver.ts';
import { resolveActiveStepId } from '../src/game/story/questProgress.ts';
import type { StoryState } from '../src/stores/storyStore.ts';
import type { StoryFlagValue } from '../src/shared/types/content.ts';
import type { DialogueView } from '../src/shared/types/dialogue.ts';
import type { SaveData, Vec3Tuple } from '../src/shared/types/save.ts';

const SIGNED_EVIDENCE_FLAGS = [
  'clue.medical_record',
  'clue.bathroom_trace',
  'clue.shipping_ledger',
  'clue.insurance_policy',
  'clue.captains_log',
] as const;

const PLAYER_POSE: { position: Vec3Tuple; rotation: Vec3Tuple } = {
  position: [0, 1.7, 4],
  rotation: [0, 0, 0],
};

interface StoryStorePort {
  getState(): StoryState;
}

interface FlowHarness {
  store: StoryStorePort;
  dialogue: DialogueSystem;
  inspection: InspectionSystem;
  safePuzzle: SafePuzzle;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStoryStorePort(value: unknown): value is StoryStorePort {
  if (!(typeof value === 'function' || isRecord(value))) {
    return false;
  }
  const candidate = value as { getState?: unknown };
  return typeof candidate.getState === 'function';
}

/**
 * 直接 import storyStore 会触发产品代码中的无扩展名相对导入，Node ESM 无法解析。
 * 用 Vite SSR 仅负责加载真实模块；测试仍调用真实 store，不复制其状态逻辑。
 */
async function loadStoryStore(vite: ViteDevServer): Promise<StoryStorePort> {
  const module: unknown = await vite.ssrLoadModule('/src/stores/storyStore.ts');
  assert.ok(isRecord(module));
  const candidate = module['useStoryStore'];
  assert.ok(isStoryStorePort(candidate));
  return candidate;
}

function assertActiveStep(store: StoryStorePort, expected: string | null): void {
  const state = store.getState();
  const derived = resolveActiveStepId(state.storyFlags, quests);
  assert.equal(derived, expected);
  assert.equal(state.activeTaskId, derived);
}

/**
 * 线索写入必须与 GameBootstrap 的宿主适配保持一致：线索 ID 数组和
 * `clue.<短名>` 剧情标记同时落盘。
 */
function discoverClue(store: StoryStorePort, clueId: string): string | null {
  const state = store.getState();
  if (state.discoveredClueIds.includes(clueId)) {
    return null;
  }
  const clue = content.clues.find((candidate) => candidate.id === clueId);
  assert.ok(clue, `未知线索 ID：${clueId}`);
  state.discoverClue(clueId);
  state.setStoryFlag(clueFlagForId(clueId), true);
  return clue.title;
}

function createFlowHarness(store: StoryStorePort): FlowHarness {
  const dialogueHost: DialogueHost = {
    getFlags: () => store.getState().storyFlags,
    getActiveTaskId: () => store.getState().activeTaskId,
    setFlag: (key, value) => {
      store.getState().setStoryFlag(key, value);
    },
    discoverClue: (clueId) => {
      discoverClue(store, clueId);
    },
    recordChoice: (nodeId, choiceId) => {
      store.getState().recordChoice(nodeId, choiceId);
    },
    onChange: () => {},
    // 与 GameBootstrap.handleConversationEnd 的出场推进保持一致。
    onConversationEnd: (event) => {
      if (!event.completed) {
        return;
      }
      const state = store.getState();
      if (event.npcId === 'npc_housekeeper') {
        if (state.storyFlags['story.met_housekeeper'] === true) {
          state.setStoryFlag('story.arthur_called', true);
        }
        return;
      }
      if (event.npcId === 'npc_arthur') {
        if (state.storyFlags['story.met_arthur'] !== true) {
          return;
        }
        state.setStoryFlag('story.arthur_talked', true);
        state.setStoryFlag('story.met_doctor', true);
      }
    },
  };

  const dialogue = new DialogueSystem({
    dialogues: content.dialogues,
    npcNames: new Map(content.npcs.map((npc) => [npc.id, npc.name])),
    host: dialogueHost,
  });

  const inspection = new InspectionSystem({
    inspectables,
    host: {
      getFlags: () => store.getState().storyFlags,
      setFlag: (key, value) => {
        store.getState().setStoryFlag(key, value);
      },
      discoverClue: (clueId) => discoverClue(store, clueId) !== null,
      getClueTitle: (clueId) =>
        content.clues.find((clue) => clue.id === clueId)?.title ?? null,
      onChange: () => {},
    },
  });

  const safePuzzle = new SafePuzzle(safePuzzleContent, {
    getFlags: () => store.getState().storyFlags,
    setFlag: (key, value) => {
      store.getState().setStoryFlag(key, value);
    },
    discoverClue: (clueId) => discoverClue(store, clueId),
    completePuzzle: (puzzleId) => {
      store.getState().completePuzzle(puzzleId);
    },
  });

  return { store, dialogue, inspection, safePuzzle };
}

function currentView(system: DialogueSystem): DialogueView {
  const view = system.view();
  assert.ok(view, '对话应处于打开状态');
  return view;
}

function reachChoices(system: DialogueSystem): DialogueView {
  let view = currentView(system);
  let advances = 0;
  while (view.canContinue) {
    assert.ok(advances < 40, `对话 ${view.nodeId} 的台词推进疑似未终止`);
    system.advance();
    advances += 1;
    view = currentView(system);
  }
  return view;
}

function openNpc(
  system: DialogueSystem,
  npcId: string,
  spotId: string,
  expectedNodeId: string,
): void {
  assert.equal(system.openForNpc(npcId, spotId), true);
  assert.equal(currentView(system).nodeId, expectedNodeId);
}

function choose(
  system: DialogueSystem,
  choiceId: string,
  expectedNextNodeId: string | null,
): void {
  const view = reachChoices(system);
  assert.ok(
    view.choices.some((choice) => choice.id === choiceId),
    `${view.nodeId} 缺少选项 ${choiceId}；实际选项：${view.choices
      .map((choice) => choice.id)
      .join(', ')}`,
  );
  assert.equal(system.choose(choiceId), true);
  if (expectedNextNodeId === null) {
    assert.equal(system.active, false);
  } else {
    assert.equal(currentView(system).nodeId, expectedNextNodeId);
  }
}

function inspect(
  system: InspectionSystem,
  inspectableId: string,
  expectedText: string,
): void {
  assert.equal(system.open(inspectableId), true);
  const view = system.view();
  assert.ok(view);
  const allText = view.sections
    .flatMap((section) => [section.heading ?? '', ...section.paragraphs])
    .join('\n');
  assert.ok(
    allText.includes(expectedText),
    `${inspectableId} 未进入预期文本变体`,
  );
  system.close();
}

function restoreSaveFromJson(save: SaveData): SaveData {
  const parsed: unknown = JSON.parse(JSON.stringify(save));
  assert.ok(isRecord(parsed), 'SaveData JSON 不应解析为非对象');
  // JSON.parse 返回 any；先与强类型 SaveData 做完整结构/值比对，再收窄。
  assert.deepEqual(parsed, save);
  return parsed as unknown as SaveData;
}

async function withStoryStore(
  run: (store: StoryStorePort) => void,
): Promise<void> {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });
  try {
    run(await loadStoryStore(vite));
  } finally {
    await vite.close();
  }
}

test('ending_signed：从新游戏状态走通真实 B1-B10 流程并恢复存档', async () => {
  await withStoryStore((store) => {
    store.getState().resetStory();
    assertActiveStep(store, 'step_arrive');
    assert.deepEqual(store.getState().storyFlags, {});

    // GameBootstrap 进入门厅时写入的首次抵达状态；后续全部由真实系统推进。
    const arrival = store.getState();
    arrival.setStoryFlag('story.arrived', true);
    arrival.setStoryFlag('story.has_letter', true);
    arrival.discoverClue('clue_evelyn_letter');
    arrival.setStoryFlag(clueFlagForId('clue_evelyn_letter'), true);
    assertActiveStep(store, 'step_housekeeper');

    const { dialogue, inspection, safePuzzle } = createFlowHarness(store);

    // B1：霍尔太太接门。
    openNpc(
      dialogue,
      'npc_housekeeper',
      'NPC_housekeeper_front_door',
      'npc_housekeeper_intro',
    );
    choose(dialogue, 'warm', 'npc_housekeeper_warm');
    choose(dialogue, 'leave', null);
    assert.equal(store.getState().storyFlags['story.met_housekeeper'], true);
    assert.equal(store.getState().storyFlags['story.arthur_called'], true);
    assertActiveStep(store, 'step_arthur');

    // B2：亚瑟交代伊芙琳之死；结束对话推进晚宴与医生出场。
    openNpc(
      dialogue,
      'npc_arthur',
      'NPC_arthur_parlor_fireplace',
      'npc_arthur_intro',
    );
    choose(dialogue, 'ask_evelyn', 'npc_arthur_evelyn_01');
    choose(dialogue, 'accept', null);
    assert.equal(store.getState().storyFlags['story.met_arthur'], true);
    assert.equal(store.getState().storyFlags['story.arthur_talked'], true);
    assert.equal(store.getState().storyFlags['story.met_doctor'], true);
    assertActiveStep(store, 'step_doctor');

    // B3：向格雷追问到场时间，完成首个时间冲突。
    openNpc(
      dialogue,
      'npc_doctor',
      'NPC_doctor_front_door_b4',
      'npc_doctor_intro',
    );
    choose(dialogue, 'ask_evelyn', 'npc_doctor_evelyn_01');
    choose(dialogue, 'ask_time', 'npc_doctor_time_01');
    choose(dialogue, 'back', 'npc_doctor_evelyn_01');
    choose(dialogue, 'back', null);
    assert.equal(store.getState().storyFlags['story.doctor_time_conflict'], true);
    assertActiveStep(store, 'step_coverup');

    // B5：问出搬运经过，再单独回到她面前取得房间钥匙。
    openNpc(
      dialogue,
      'npc_housekeeper',
      'NPC_housekeeper_dining_door',
      'npc_housekeeper_b5_01',
    );
    choose(dialogue, 'ask_evelyn', 'npc_housekeeper_evelyn_b5');
    choose(dialogue, 'ask_night', 'npc_housekeeper_night_01');
    choose(dialogue, 'press', 'npc_housekeeper_night_02');
    choose(dialogue, 'ask_why_silent', 'npc_housekeeper_night_03');
    choose(dialogue, 'leave', null);
    assert.equal(store.getState().storyFlags['story.knows_coverup'], true);
    assert.equal(store.getState().storyFlags['story.housekeeper_key'], undefined);
    assertActiveStep(store, 'step_coverup');

    openNpc(
      dialogue,
      'npc_housekeeper',
      'NPC_housekeeper_dining_door',
      'npc_housekeeper_b5_01',
    );
    choose(dialogue, 'ask_evelyn', 'npc_housekeeper_evelyn_b5');
    choose(dialogue, 'ask_room', 'npc_housekeeper_room_01');
    choose(dialogue, 'back', 'npc_housekeeper_evelyn_b5');
    choose(dialogue, 'back', 'npc_housekeeper_b5_01');
    choose(dialogue, 'leave', null);
    assert.equal(store.getState().storyFlags['story.evelyn_room_open'], true);
    assert.equal(store.getState().storyFlags['story.housekeeper_key'], true);
    assertActiveStep(store, 'step_medical_truth');

    // 医务真相：诊疗副本 + 浴室痕迹，再让格雷承认死亡现场。
    inspect(inspection, 'INT_prop_study_desk_drawer', '诊疗副本');
    inspect(inspection, 'INT_prop_medicine_cabinet', '镇静剂');
    assert.equal(store.getState().storyFlags['clue.medical_record'], true);
    assert.equal(store.getState().storyFlags['clue.bathroom_trace'], true);

    openNpc(
      dialogue,
      'npc_doctor',
      'NPC_doctor_dining_door',
      'npc_doctor_b5_01',
    );
    choose(dialogue, 'ask_evelyn', 'npc_doctor_evelyn_b5');
    choose(dialogue, 'ask_towel', 'npc_doctor_challenge_01');
    choose(dialogue, 'press', 'npc_doctor_challenge_02');
    choose(dialogue, 'end', null);
    assert.equal(store.getState().storyFlags['story.doctor_confessed'], true);
    assertActiveStep(store, 'step_recording');

    // 录音：从卧室取得蜡筒，带回书房留声机播放。
    inspect(inspection, 'INT_prop_vanity_drawer', '蜡筒');
    inspect(inspection, 'INT_prop_phonograph', '珀耳塞福涅号不是沉在风暴里');
    assert.equal(store.getState().storyFlags['item.cylinder'], true);
    assert.equal(store.getState().storyFlags['story.heard_recording'], true);
    assertActiveStep(store, 'step_corroborate');

    // 第二份书证：油画与旧报纸提供日期，保险箱密码 0314。
    inspect(inspection, 'INT_prop_ship_painting', 'PERSEPHONE');
    inspect(inspection, 'INT_prop_newspaper_stack', '1896 年 3 月 16 日');
    const safeReady = safePuzzle.open();
    assert.equal(safeReady.canTry, true);
    const safeSolved = safePuzzle.submit('0314');
    assert.equal(safeSolved.solved, true);
    assert.equal(store.getState().storyFlags['story.safe_opened'], true);
    assert.equal(store.getState().storyFlags['clue.shipping_ledger'], true);
    assert.equal(store.getState().storyFlags['clue.insurance_policy'], true);
    assertActiveStep(store, 'step_evidence');

    // 整理书证，进入 B9 对质。
    inspect(inspection, 'INT_prop_study_desk_drawer', '证据已经足够逼亚瑟把话说完');
    assert.equal(store.getState().storyFlags['story.case_ready'], true);
    assertActiveStep(store, 'step_confront');

    openNpc(
      dialogue,
      'npc_arthur',
      'NPC_arthur_study_desk',
      'npc_arthur_confront_01',
    );
    choose(dialogue, 'show_policy', 'npc_arthur_confront_policy');
    choose(dialogue, 'press', 'npc_arthur_confront_break');
    choose(dialogue, 'go_hall', null);
    assert.equal(store.getState().storyFlags['story.arthur_confessed'], true);
    assert.equal(store.getState().storyFlags['story.midnight'], true);
    assertActiveStep(store, 'step_midnight');

    // B10：玩家在签字桌边选择签署。
    openNpc(
      dialogue,
      'npc_arthur',
      'NPC_arthur_signing_table',
      'npc_arthur_midnight_01',
    );
    const midnightChoices = reachChoices(dialogue);
    assert.ok(midnightChoices.choices.some((choice) => choice.id === 'sign'));
    choose(dialogue, 'sign', null);
    assert.equal(store.getState().storyFlags['choice.midnight'], 'sign');
    assert.equal(store.getState().choices['npc_arthur_midnight_01'], 'sign');
    assertActiveStep(store, null);

    const finalFlags: Record<string, StoryFlagValue> = {
      ...store.getState().storyFlags,
    };
    const ending = resolveEnding(finalFlags, endings);
    assert.ok(ending);
    assert.equal(ending.id, 'ending_signed');
    assert.equal(ending.title, '继承体面');

    const evidenceView = presentEnding(ending.id, finalFlags);
    assert.ok(evidenceView);
    assert.equal(evidenceView.subtitle, '你继承了体面。');
    assert.equal(evidenceView.paragraphs.length, 8);
    assert.equal(
      evidenceView.paragraphs.at(-1),
      '你把那些纸留在了书房。它们会一直在那儿。',
    );

    const cleanFlags: Record<string, StoryFlagValue> = { ...finalFlags };
    for (const evidenceFlag of SIGNED_EVIDENCE_FLAGS) {
      delete cleanFlags[evidenceFlag];
    }
    assert.equal(resolveEnding(cleanFlags, endings)?.id, 'ending_signed');
    const cleanView = presentEnding('ending_signed', cleanFlags);
    assert.ok(cleanView);
    assert.equal(cleanView.paragraphs.length, 7);
    assert.equal(
      cleanView.paragraphs.some((line) => line.includes('留在书房')),
      false,
    );

    const save = store.getState().toSaveData(PLAYER_POSE);
    assert.equal(save.storyFlags['choice.midnight'], 'sign');
    assert.equal(save.choices['npc_arthur_midnight_01'], 'sign');
    assert.ok(save.discoveredClueIds.includes('clue_insurance_policy'));
    assert.ok(save.completedPuzzleIds.includes('puzzle_safe'));

    const restoredSave = restoreSaveFromJson(save);
    store.getState().loadFromSave(restoredSave);
    const restoredFlags = store.getState().storyFlags;
    assert.equal(restoredFlags['choice.midnight'], 'sign');
    assert.equal(store.getState().choices['npc_arthur_midnight_01'], 'sign');
    assert.equal(resolveEnding(restoredFlags, endings)?.id, 'ending_signed');
    const restoredEnding = presentEnding('ending_signed', restoredFlags);
    assert.ok(restoredEnding);
    assert.equal(restoredEnding.subtitle, '你继承了体面。');
    assert.equal(
      restoredEnding.paragraphs.at(-1),
      '你把那些纸留在了书房。它们会一直在那儿。',
    );
  });
});
