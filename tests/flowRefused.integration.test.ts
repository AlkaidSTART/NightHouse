import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clueFlagForId, clues } from '../src/content/clues.ts';
import { content } from '../src/content/index.ts';
import { presentEnding } from '../src/content/endings.ts';
import { clockPuzzleContent, safePuzzleContent } from '../src/content/puzzles.ts';
import { quests } from '../src/content/quests.ts';
import {
  DialogueSystem,
  type ConversationEndEvent,
} from '../src/game/dialogue/DialogueSystem.ts';
import { InspectionSystem } from '../src/game/inspection/InspectionSystem.ts';
import { ClockPuzzle } from '../src/game/puzzles/ClockPuzzle.ts';
import type { PuzzleHost } from '../src/game/puzzles/PuzzleHost.ts';
import { SafePuzzle } from '../src/game/puzzles/SafePuzzle.ts';
import { resolveEnding } from '../src/game/story/endingResolver.ts';
import { resolveActiveStepId } from '../src/game/story/questProgress.ts';
import type { StoryFlagValue } from '../src/shared/types/content.ts';
import type { DialogueView } from '../src/shared/types/dialogue.ts';
import type { SaveData } from '../src/shared/types/save.ts';

interface FlowState {
  currentSceneId: string;
  flags: Record<string, StoryFlagValue>;
  discoveredClueIds: string[];
  completedPuzzleIds: string[];
  completedQuestIds: string[];
  choices: Record<string, string>;
}

interface Runtime {
  state: FlowState;
  dialogue: DialogueSystem;
  inspection: InspectionSystem;
  clock: ClockPuzzle;
  safe: SafePuzzle;
  setFlag: (key: string, value: StoryFlagValue) => void;
  discoverClue: (clueId: string) => void;
}

type RefusalScenario = 'weak' | 'strong' | 'quiet-with-evidence';

const SAVE_SCHEMA_VERSION = 1;
const WEAK_PARAGRAPHS = [
  '你把笔放下。',
  '亚瑟看了你一会儿，然后笑了。不是嘲讽，是疲惫。',
  '「可以。」他说，「遗嘱会按父亲的意愿处理。您明早搭第一班马车走。」',
  '你走出门厅的时候，钟敲了十二下。不是十三下。',
  '你什么也没能证明。雨还在下。桥要到中午才通。',
  '一年后，你在外地的报纸上看到阿什克罗夫特家的消息：生意恢复了，宅子重新粉刷过。',
  '没有人再提伊芙琳。',
] as const;
const STRONG_PARAGRAPHS = [
  '你把笔放下。',
  '亚瑟看了你很久。他没有问为什么。他把遗嘱折好，放回桌上，说：「你会在天亮之前改变主意的。」',
  '你把账本、赔付单、诊疗记录一件一件放在桌上。格雷医生站起来，又坐下。霍尔太太在门口说：「那天晚上，我看见了。」然后她哭了。',
  '亚瑟没有否认。他看着门厅桌上的账本，说：「她是我妹妹。」然后他转身走上楼梯，回到二楼的阴影里，没有再下来。',
  '天亮后，你骑马去镇上。桥还没修好，你从浅滩过去，裤脚湿到膝盖。',
  '保险商、警察、报纸。事情比你想象的慢，也比你想象的彻底。',
  '阿什克罗夫特家失去了宅子和股份。海事孤儿院得到了遗产。四名船员的名字在报纸上出现了一次，然后被别的消息盖过去。',
  '伊芙琳的名字没有出现。报纸只写「阿什克罗夫特家长女，一年前失踪」。',
  '霍尔太太在宅子被变卖那天离开。她提着一只旧箱子，在台阶上对你点了点头，没有说谢谢，也没有说再见。',
  '亚瑟没有受审。他在开庭前离开了灰港。有人说他去了南方，有人说他上了船。',
  '你得到了你想要的真话。没有人因为真话过得更好。',
] as const;
const CLUE_TITLES = new Map(clues.map((clue) => [clue.id, clue.title]));

function createInitialState(): FlowState {
  return {
    currentSceneId: 'villa_entry',
    flags: {},
    discoveredClueIds: [],
    completedPuzzleIds: [],
    completedQuestIds: [],
    choices: {},
  };
}

function createRuntime(state: FlowState): Runtime {
  const setFlag = (key: string, value: StoryFlagValue): void => {
    state.flags = { ...state.flags, [key]: value };
  };
  const discoverClue = (clueId: string): void => {
    if (!state.discoveredClueIds.includes(clueId)) {
      state.discoveredClueIds = [...state.discoveredClueIds, clueId];
    }
    setFlag(clueFlagForId(clueId), true);
  };
  const recordChoice = (nodeId: string, choiceId: string): void => {
    state.choices = { ...state.choices, [nodeId]: choiceId };
  };
  const completeConversation = (event: ConversationEndEvent): void => {
    if (!event.completed) {
      return;
    }
    if (event.npcId === 'npc_housekeeper') {
      if (state.flags['story.met_housekeeper'] === true) {
        setFlag('story.arthur_called', true);
      }
      return;
    }
    if (event.npcId === 'npc_arthur' && state.flags['story.met_arthur'] === true) {
      setFlag('story.arthur_talked', true);
      if (state.flags['story.met_doctor'] !== true) {
        setFlag('story.met_doctor', true);
      }
    }
  };

  const puzzleHost: PuzzleHost = {
    getFlags: () => state.flags,
    setFlag,
    discoverClue: (clueId) => {
      if (state.discoveredClueIds.includes(clueId)) {
        return null;
      }
      discoverClue(clueId);
      return CLUE_TITLES.get(clueId) ?? clueId;
    },
    completePuzzle: (puzzleId) => {
      if (!state.completedPuzzleIds.includes(puzzleId)) {
        state.completedPuzzleIds = [...state.completedPuzzleIds, puzzleId];
      }
    },
  };

  const dialogue = new DialogueSystem({
    dialogues: content.dialogues,
    npcNames: new Map(content.npcs.map((npc) => [npc.id, npc.name])),
    host: {
      getFlags: () => state.flags,
      getActiveTaskId: () => resolveActiveStepId(state.flags, quests),
      setFlag,
      discoverClue,
      recordChoice,
      onChange: () => {},
      onConversationEnd: completeConversation,
    },
  });
  const inspection = new InspectionSystem({
    inspectables: content.inspectables,
    host: {
      getFlags: () => state.flags,
      setFlag,
      discoverClue: (clueId) => {
        if (state.discoveredClueIds.includes(clueId)) {
          return false;
        }
        discoverClue(clueId);
        return true;
      },
      getClueTitle: (clueId) => CLUE_TITLES.get(clueId) ?? null,
      onChange: () => {},
    },
  });
  return {
    state,
    dialogue,
    inspection,
    clock: new ClockPuzzle(clockPuzzleContent, puzzleHost),
    safe: new SafePuzzle(safePuzzleContent, puzzleHost),
    setFlag,
    discoverClue,
  };
}

function activeTaskId(state: FlowState): string | null {
  return resolveActiveStepId(state.flags, quests);
}

function startNearlyNewGame(): Runtime {
  const runtime = createRuntime(createInitialState());
  runtime.setFlag('story.arrived', true);
  runtime.setFlag('story.has_letter', true);
  runtime.discoverClue('clue_evelyn_letter');
  assert.equal(activeTaskId(runtime.state), 'step_housekeeper');
  return runtime;
}

function showChoices(runtime: Runtime): DialogueView {
  let view = runtime.dialogue.view();
  assert.ok(view, '对话应在选项阶段保持打开');
  let advances = 0;
  while (view.canContinue) {
    assert.ok(advances < 30, '对话台词推进疑似未终止');
    runtime.dialogue.advance();
    advances += 1;
    view = runtime.dialogue.view();
    assert.ok(view, '推进台词后对话不应意外关闭');
  }
  return view;
}

function openNpc(runtime: Runtime, npcId: string, spotId: string): DialogueView {
  assert.equal(
    runtime.dialogue.openForNpc(npcId, spotId),
    true,
    `${npcId} 未在 ${spotId} 打开对话`,
  );
  return showChoices(runtime);
}

function choose(runtime: Runtime, choiceId: string): void {
  const view = showChoices(runtime);
  assert.ok(
    view.choices.some((choice) => choice.id === choiceId),
    `当前选项不含 ${choiceId}：${view.choices.map((choice) => choice.id).join(', ')}`,
  );
  assert.equal(runtime.dialogue.choose(choiceId), true, `选择 ${choiceId} 失败`);
}

function inspect(runtime: Runtime, id: string): void {
  assert.equal(runtime.inspection.open(id), true, `检视物 ${id} 未打开`);
  runtime.inspection.close();
}

function reachConfrontation(): Runtime {
  const runtime = startNearlyNewGame();

  // B1：霍尔太太完成接待，宿主据此放出亚瑟。
  openNpc(runtime, 'npc_housekeeper', 'NPC_housekeeper_front_door');
  choose(runtime, 'warm');
  choose(runtime, 'leave');
  assert.equal(runtime.dialogue.active, false);
  assert.equal(activeTaskId(runtime.state), 'step_arthur');

  // B2：与亚瑟交谈，完成后格雷医生到场。
  openNpc(runtime, 'npc_arthur', 'NPC_arthur_parlor_fireplace');
  choose(runtime, 'ask_evelyn');
  choose(runtime, 'accept');
  assert.equal(activeTaskId(runtime.state), 'step_doctor');
  assert.equal(runtime.state.flags['story.met_doctor'], true);

  // B3：追问出诊时间，锁定医生证词中的矛盾。
  openNpc(runtime, 'npc_doctor', 'NPC_doctor_front_door_b4');
  choose(runtime, 'ask_evelyn');
  choose(runtime, 'ask_time');
  choose(runtime, 'back');
  choose(runtime, 'back');
  assert.equal(activeTaskId(runtime.state), 'step_coverup');
  assert.equal(runtime.state.flags['story.doctor_time_conflict'], true);

  // B5：先拿到二楼钥匙，再听霍尔太太说出搬运经过。
  openNpc(runtime, 'npc_housekeeper', 'NPC_housekeeper_dining_door');
  choose(runtime, 'ask_evelyn');
  choose(runtime, 'ask_room');
  choose(runtime, 'back');
  choose(runtime, 'ask_night');
  choose(runtime, 'press');
  choose(runtime, 'ask_alive');
  choose(runtime, 'leave');
  assert.equal(runtime.state.flags['story.housekeeper_key'], true);
  assert.equal(runtime.state.flags['story.knows_coverup'], true);
  assert.ok(runtime.state.discoveredClueIds.includes('clue_hall_testimony'));
  assert.equal(activeTaskId(runtime.state), 'step_medical_truth');

  // 医疗真相：真实检视拿到诊疗记录与浴室痕迹，再让格雷承认现场。
  inspect(runtime, 'INT_prop_study_desk_drawer');
  inspect(runtime, 'INT_prop_medicine_cabinet');
  assert.equal(runtime.state.flags['clue.medical_record'], true);
  assert.equal(runtime.state.flags['clue.bathroom_trace'], true);
  openNpc(runtime, 'npc_doctor', 'NPC_doctor_front_door_b4');
  choose(runtime, 'ask_evelyn');
  choose(runtime, 'ask_towel');
  choose(runtime, 'press');
  choose(runtime, 'end');
  assert.equal(runtime.state.flags['story.doctor_confessed'], true);
  assert.equal(activeTaskId(runtime.state), 'step_recording');

  // 录音：从梳妆台取得蜡筒，在书房真实播放。
  inspect(runtime, 'INT_prop_vanity_drawer');
  assert.equal(runtime.state.flags['item.cylinder'], true);
  inspect(runtime, 'INT_prop_phonograph');
  assert.equal(runtime.state.flags['story.heard_recording'], true);
  assert.equal(activeTaskId(runtime.state), 'step_corroborate');
  return runtime;
}

function reachMidnight(runtime: Runtime, evidencePath: 'clock' | 'safe'): void {
  if (evidencePath === 'clock') {
    inspect(runtime, 'INT_prop_mantel_clock');
    inspect(runtime, 'INT_prop_tide_table');
    inspect(runtime, 'INT_prop_wardrobe');
    assert.equal(runtime.clock.open().actions[0]?.id, 'clock.open-door');
    runtime.clock.act('clock.open-door');
    runtime.clock.act('clock.hang-pendulum');
    runtime.clock.act('clock.wind');
    assert.equal(runtime.clock.act('clock.set-2347').solved, true);
    assert.equal(runtime.state.flags['story.clock_repaired'], true);
    assert.equal(runtime.state.flags['clue.shipping_ledger'], undefined);
    assert.equal(runtime.state.flags['clue.insurance_policy'], undefined);
  } else {
    inspect(runtime, 'INT_prop_ship_painting');
    assert.equal(runtime.safe.open().canTry, true);
    assert.equal(runtime.safe.submit('0314').solved, true);
    assert.equal(runtime.state.flags['story.safe_opened'], true);
    assert.equal(runtime.state.flags['clue.shipping_ledger'], true);
    assert.equal(runtime.state.flags['clue.insurance_policy'], true);
  }

  assert.equal(activeTaskId(runtime.state), 'step_evidence');
  inspect(runtime, 'INT_prop_study_desk_drawer');
  assert.equal(runtime.state.flags['story.case_ready'], true);
  assert.equal(activeTaskId(runtime.state), 'step_confront');

  openNpc(runtime, 'npc_arthur', 'NPC_arthur_study_desk');
  choose(runtime, evidencePath === 'safe' ? 'show_policy' : 'show_log');
  choose(runtime, 'press');
  choose(runtime, 'go_hall');
  assert.equal(runtime.state.flags['story.arthur_confessed'], true);
  assert.equal(runtime.state.flags['story.midnight'], true);
  assert.equal(activeTaskId(runtime.state), 'step_midnight');
}

function refuseAtMidnight(runtime: Runtime, quiet: boolean): void {
  const view = openNpc(runtime, 'npc_arthur', 'NPC_arthur_signing_table');
  assert.equal(view.nodeId, 'npc_arthur_midnight_01');
  choose(runtime, 'refuse');

  const refusal = showChoices(runtime);
  assert.equal(refusal.nodeId, 'npc_arthur_refuse_01');
  assert.ok(refusal.choices.some((choice) => choice.id === 'refuse_quietly'));
  if (quiet) {
    choose(runtime, 'refuse_quietly');
    assert.equal(showChoices(runtime).nodeId, 'npc_arthur_refuse_weak');
  } else {
    assert.ok(refusal.choices.some((choice) => choice.id === 'present_evidence'));
    choose(runtime, 'present_evidence');
    assert.equal(showChoices(runtime).nodeId, 'npc_arthur_refuse_strong');
  }

  choose(runtime, 'end');
  assert.equal(runtime.dialogue.active, false);
  assert.equal(runtime.state.flags['choice.midnight'], 'refuse');
  assert.equal(runtime.state.choices['npc_arthur_midnight_01'], 'refuse');
  assert.equal(activeTaskId(runtime.state), null);
}

function assertEnding(state: FlowState, expected: 'weak' | 'strong'): void {
  const ending = resolveEnding(state.flags, content.endings);
  assert.ok(ending);
  assert.equal(ending.id, 'ending_refused');
  const view = presentEnding(ending.id, state.flags);
  assert.ok(view);
  assert.equal(view.title, '拒绝签字');
  if (expected === 'strong') {
    assert.equal(view.subtitle, '你得到了真话。');
    assert.deepEqual(view.paragraphs, STRONG_PARAGRAPHS);
  } else {
    assert.equal(view.subtitle, '你拒绝了，但没有人听见。');
    assert.deepEqual(view.paragraphs, WEAK_PARAGRAPHS);
    assert.ok(view.paragraphs.includes('你走出门厅的时候，钟敲了十二下。不是十三下。'));
  }
}

function toSaveData(state: FlowState): SaveData {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    updatedAt: Date.now(),
    currentSceneId: state.currentSceneId,
    player: {
      position: [0, 1.7, 4],
      rotation: [0, 0, 0],
    },
    storyFlags: { ...state.flags },
    discoveredClueIds: [...state.discoveredClueIds],
    completedPuzzleIds: [...state.completedPuzzleIds],
    completedQuestIds: [...state.completedQuestIds],
    npcStates: {},
    choices: { ...state.choices },
  };
}

function restoreRuntime(save: SaveData): Runtime {
  return createRuntime({
    currentSceneId: save.currentSceneId,
    flags: { ...save.storyFlags },
    discoveredClueIds: [...save.discoveredClueIds],
    completedPuzzleIds: [...save.completedPuzzleIds],
    completedQuestIds: [...save.completedQuestIds],
    choices: { ...save.choices },
  });
}

function roundTripAndRestore(runtime: Runtime): Runtime {
  const raw: unknown = JSON.parse(JSON.stringify(toSaveData(runtime.state)));
  assert.ok(isSaveData(raw), '序列化后的 SaveData 未通过结构校验');
  return restoreRuntime(raw);
}

function isSaveData(value: unknown): value is SaveData {
  if (!isRecord(value) || !isRecord(value.player)) {
    return false;
  }
  return (
    value.schemaVersion === SAVE_SCHEMA_VERSION &&
    typeof value.updatedAt === 'number' &&
    Number.isFinite(value.updatedAt) &&
    typeof value.currentSceneId === 'string' &&
    isVec3(value.player.position) &&
    isVec3(value.player.rotation) &&
    isFlagRecord(value.storyFlags) &&
    isStringArray(value.discoveredClueIds) &&
    isStringArray(value.completedPuzzleIds) &&
    isStringArray(value.completedQuestIds) &&
    isRecord(value.npcStates) &&
    isChoiceRecord(value.choices)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isVec3(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((item) => typeof item === 'number' && Number.isFinite(item))
  );
}

function isStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isStoryFlagValue(value: unknown): value is StoryFlagValue {
  return (
    typeof value === 'boolean' ||
    typeof value === 'string' ||
    (typeof value === 'number' && Number.isFinite(value))
  );
}

function isFlagRecord(value: unknown): value is Record<string, StoryFlagValue> {
  return isRecord(value) && Object.values(value).every(isStoryFlagValue);
}

function isChoiceRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string');
}

function runScenario(scenario: RefusalScenario): void {
  const evidencePath = scenario === 'weak' ? 'clock' : 'safe';
  const runtime = reachConfrontation();
  reachMidnight(runtime, evidencePath);
  refuseAtMidnight(runtime, scenario !== 'strong');
  assertEnding(runtime.state, scenario === 'strong' ? 'strong' : 'weak');

  const restored = roundTripAndRestore(runtime);
  assert.equal(restored.state.flags['choice.midnight'], 'refuse');
  assert.equal(restored.state.choices['npc_arthur_midnight_01'], 'refuse');
  assert.equal(activeTaskId(restored.state), null);
  assertEnding(restored.state, scenario === 'strong' ? 'strong' : 'weak');

  if (scenario === 'weak') {
    assert.equal(restored.state.flags['story.evidence_presented'], undefined);
    assert.equal(restored.state.flags['clue.shipping_ledger'], undefined);
    assert.equal(restored.state.flags['clue.insurance_policy'], undefined);
    assert.equal(restored.state.flags['clue.captains_log'], true);
    return;
  }
  assert.equal(restored.state.flags['clue.shipping_ledger'], true);
  assert.equal(restored.state.flags['clue.insurance_policy'], true);
  if (scenario === 'strong') {
    assert.equal(restored.state.flags['story.evidence_presented'], true);
  } else {
    assert.equal(restored.state.flags['story.evidence_presented'], undefined);
  }
}

test('ending_refused 从新游戏完整跑通 weak、strong 与持有证据但安静拒签', () => {
  runScenario('weak');
  runScenario('strong');
  runScenario('quiet-with-evidence');
});
