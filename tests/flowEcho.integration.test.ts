import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clueFlagForId } from '../src/content/clues.ts';
import { endings, presentEnding } from '../src/content/endings.ts';
import { content } from '../src/content/index.ts';
import { clockPuzzleContent, safePuzzleContent } from '../src/content/puzzles.ts';
import { quests } from '../src/content/quests.ts';
import {
  DialogueSystem,
  type ConversationEndEvent,
} from '../src/game/dialogue/DialogueSystem.ts';
import { InspectionSystem } from '../src/game/inspection/InspectionSystem.ts';
import { ClockPuzzle } from '../src/game/puzzles/ClockPuzzle.ts';
import { SafePuzzle } from '../src/game/puzzles/SafePuzzle.ts';
import { resolveEnding } from '../src/game/story/endingResolver.ts';
import { resolveActiveStepId } from '../src/game/story/questProgress.ts';
import type { StoryFlagValue } from '../src/shared/types/content.ts';
import type { DialogueView } from '../src/shared/types/dialogue.ts';
import type { SaveData, NPCState, Vec3Tuple } from '../src/shared/types/save.ts';

const ECHO_SUPPORT_FLAGS = [
  'clue.captains_log',
  'clue.crew_names',
  'clue.insurance_policy',
  'story.heard_recording',
  'story.housekeeper_testimony',
  'story.arthur_confessed',
] as const;

// SaveManager 的 Node 入口仍含无扩展名导入，测试文件不能通过它加载。
// 这里保持与 createNewSave 相同的持久化结构，实际写入/恢复语义由下面的
// JSON 往返和运行时校验覆盖。
const SAVE_SCHEMA_VERSION = 1;

const EXPECTED_TASK_CHAIN = [
  'step_housekeeper',
  'step_arthur',
  'step_doctor',
  'step_coverup',
  'step_medical_truth',
  'step_recording',
  'step_corroborate',
  'step_evidence',
  'step_confront',
  'step_midnight',
] as const;

interface FlowFixture {
  save: SaveData;
  dialogue: DialogueSystem;
  inspection: InspectionSystem;
  clock: ClockPuzzle;
  safe: SafePuzzle;
  setFlag: (key: string, value: StoryFlagValue) => void;
  discoverClue: (clueId: string) => boolean;
}

interface EchoFlowResult {
  prepared: SaveData;
  completed: SaveData;
  taskChain: readonly string[];
}

let cachedEchoFlow: EchoFlowResult | null = null;

function createFlow(initialSave: SaveData): FlowFixture {
  const save = cloneSave(initialSave);
  const clueTitles = new Map(content.clues.map((clue) => [clue.id, clue.title]));
  const setFlag = (key: string, value: StoryFlagValue): void => {
    save.storyFlags[key] = value;
  };

  const discoverClueInternal = (clueId: string): string | null => {
    if (save.discoveredClueIds.includes(clueId)) {
      return null;
    }
    save.discoveredClueIds.push(clueId);
    setFlag(clueFlagForId(clueId), true);
    return clueTitles.get(clueId) ?? clueId;
  };

  const completePuzzle = (puzzleId: string): void => {
    if (!save.completedPuzzleIds.includes(puzzleId)) {
      save.completedPuzzleIds.push(puzzleId);
    }
  };

  const handleConversationEnd = (event: ConversationEndEvent): void => {
    if (!event.completed) {
      return;
    }
    // 复刻 GameBootstrap 的出场推进：B1/B2 结束后才开放下一名 NPC。
    if (
      event.npcId === 'npc_housekeeper' &&
      save.storyFlags['story.met_housekeeper'] === true
    ) {
      setFlag('story.arthur_called', true);
    }
    if (
      event.npcId === 'npc_arthur' &&
      save.storyFlags['story.met_arthur'] === true
    ) {
      setFlag('story.arthur_talked', true);
      setFlag('story.met_doctor', true);
    }
  };

  const dialogue = new DialogueSystem({
    dialogues: content.dialogues,
    npcNames: new Map(content.npcs.map((npc) => [npc.id, npc.name])),
    host: {
      getFlags: () => save.storyFlags,
      getActiveTaskId: () => resolveActiveStepId(save.storyFlags, quests),
      setFlag,
      discoverClue: (clueId) => {
        discoverClueInternal(clueId);
      },
      recordChoice: (nodeId, choiceId) => {
        save.choices[nodeId] = choiceId;
      },
      onChange: () => {},
      onConversationEnd: handleConversationEnd,
    },
  });

  const inspection = new InspectionSystem({
    inspectables: content.inspectables,
    host: {
      getFlags: () => save.storyFlags,
      setFlag,
      discoverClue: (clueId) => discoverClueInternal(clueId) !== null,
      getClueTitle: (clueId) => clueTitles.get(clueId) ?? null,
      onChange: () => {},
    },
  });

  const puzzleHost = {
    getFlags: () => save.storyFlags,
    setFlag,
    discoverClue: discoverClueInternal,
    completePuzzle,
  };

  return {
    save,
    dialogue,
    inspection,
    clock: new ClockPuzzle(clockPuzzleContent, puzzleHost),
    safe: new SafePuzzle(safePuzzleContent, puzzleHost),
    setFlag,
    discoverClue: (clueId) => discoverClueInternal(clueId) !== null,
  };
}

function enterNewGameHall(): FlowFixture {
  const fixture = createFlow(createFreshSave());
  // 对应 GameBootstrap.applyStoryProgress('villa_hall')：进入门厅后得到退信。
  fixture.setFlag('story.arrived', true);
  fixture.setFlag('story.has_letter', true);
  fixture.discoverClue('clue_evelyn_letter');
  return fixture;
}

function currentTask(fixture: FlowFixture): string | null {
  return resolveActiveStepId(fixture.save.storyFlags, quests);
}

function assertTask(
  fixture: FlowFixture,
  expected: string,
  taskChain: string[],
): void {
  const actual = currentTask(fixture);
  assert.equal(actual, expected, `任务应处于 ${expected}`);
  taskChain.push(expected);
}

function openDialogue(
  fixture: FlowFixture,
  npcId: string,
  spotId: string,
): DialogueView {
  assert.equal(fixture.dialogue.active, false, '上一段对话应已关闭');
  assert.equal(
    fixture.dialogue.openForNpc(npcId, spotId),
    true,
    `${npcId}@${spotId} 无法进入对话`,
  );
  const view = fixture.dialogue.view();
  assert.ok(view);
  return view;
}

function showChoices(system: DialogueSystem): DialogueView {
  let view = system.view();
  assert.ok(view, '对话应仍在进行');
  let advances = 0;
  while (view.canContinue) {
    assert.ok(advances < 30, '对话台词推进疑似未终止');
    system.advance();
    advances += 1;
    view = system.view();
    assert.ok(view);
  }
  return view;
}

function choose(system: DialogueSystem, choiceId: string): void {
  const view = showChoices(system);
  assert.ok(
    view.choices.some((choice) => choice.id === choiceId),
    `${view.nodeId} 未提供选项 ${choiceId}`,
  );
  assert.equal(system.choose(choiceId), true, `选择 ${choiceId} 失败`);
}

function inspect(fixture: FlowFixture, inspectableId: string): void {
  assert.equal(
    fixture.inspection.open(inspectableId),
    true,
    `无法检视 ${inspectableId}`,
  );
  assert.ok(fixture.inspection.view());
  fixture.inspection.close();
}

function cloneSave(save: SaveData): SaveData {
  return structuredClone(save);
}

function runEchoFlow(): EchoFlowResult {
  const fixture = enterNewGameHall();
  const taskChain: string[] = [];

  assertTask(fixture, 'step_housekeeper', taskChain);
  openDialogue(fixture, 'npc_housekeeper', 'NPC_housekeeper_front_door');
  choose(fixture.dialogue, 'warm');
  choose(fixture.dialogue, 'leave');
  assertTask(fixture, 'step_arthur', taskChain);

  openDialogue(fixture, 'npc_arthur', 'NPC_arthur_parlor_fireplace');
  choose(fixture.dialogue, 'ask_evelyn');
  choose(fixture.dialogue, 'ask_why_cliff');
  choose(fixture.dialogue, 'ask_study');
  choose(fixture.dialogue, 'leave');
  assert.equal(fixture.save.storyFlags['clue.arthur_scratch'], true);
  assertTask(fixture, 'step_doctor', taskChain);

  openDialogue(fixture, 'npc_doctor', 'NPC_doctor_front_door_b4');
  choose(fixture.dialogue, 'ask_evelyn');
  choose(fixture.dialogue, 'ask_time');
  choose(fixture.dialogue, 'back');
  choose(fixture.dialogue, 'back');
  assert.equal(fixture.save.storyFlags['story.doctor_time_conflict'], true);
  assertTask(fixture, 'step_coverup', taskChain);

  openDialogue(fixture, 'npc_housekeeper', 'NPC_housekeeper_dining_door');
  choose(fixture.dialogue, 'ask_evelyn');
  choose(fixture.dialogue, 'ask_night');
  choose(fixture.dialogue, 'press');
  choose(fixture.dialogue, 'ask_alive');
  choose(fixture.dialogue, 'leave');
  assert.equal(fixture.save.storyFlags['story.knows_coverup'], true);

  openDialogue(fixture, 'npc_housekeeper', 'NPC_housekeeper_dining_door');
  choose(fixture.dialogue, 'ask_evelyn');
  choose(fixture.dialogue, 'ask_room');
  choose(fixture.dialogue, 'back');
  choose(fixture.dialogue, 'back');
  choose(fixture.dialogue, 'leave');
  assert.equal(fixture.save.storyFlags['story.housekeeper_key'], true);
  assertTask(fixture, 'step_medical_truth', taskChain);

  inspect(fixture, 'INT_prop_study_desk_drawer');
  inspect(fixture, 'INT_prop_medicine_cabinet');
  assert.equal(fixture.save.storyFlags['clue.medical_record'], true);
  assert.equal(fixture.save.storyFlags['clue.bathroom_trace'], true);

  openDialogue(fixture, 'npc_doctor', 'NPC_doctor_dining_door');
  choose(fixture.dialogue, 'ask_evelyn');
  choose(fixture.dialogue, 'ask_towel');
  choose(fixture.dialogue, 'press');
  choose(fixture.dialogue, 'end');
  assert.equal(fixture.save.storyFlags['story.doctor_confessed'], true);
  assertTask(fixture, 'step_recording', taskChain);

  inspect(fixture, 'INT_prop_wardrobe');
  inspect(fixture, 'INT_prop_vanity_drawer');
  inspect(fixture, 'INT_prop_phonograph');
  assert.equal(fixture.save.storyFlags['story.heard_recording'], true);
  assertTask(fixture, 'step_corroborate', taskChain);

  inspect(fixture, 'INT_prop_mantel_clock');
  inspect(fixture, 'INT_prop_tide_table');
  assert.equal(fixture.clock.act('clock.open-door').solved, false);
  assert.equal(fixture.clock.act('clock.hang-pendulum').solved, false);
  assert.equal(fixture.clock.act('clock.wind').solved, false);
  const clockView = fixture.clock.act('clock.set-2347');
  assert.equal(clockView.solved, true);
  assert.deepEqual(clockView.newClueTitles, ['船长日志', '四名船员的名字']);

  inspect(fixture, 'INT_prop_storage_key_ring');
  inspect(fixture, 'INT_prop_ship_painting_back');
  inspect(fixture, 'INT_prop_newspaper_stack');
  assert.equal(fixture.safe.open().canTry, true);
  const safeView = fixture.safe.submit('0314');
  assert.equal(safeView.solved, true);
  assert.deepEqual(safeView.newClueTitles, ['航运账本', '保险赔付单']);
  assertTask(fixture, 'step_evidence', taskChain);

  inspect(fixture, 'INT_prop_study_desk_drawer');
  assert.equal(fixture.save.storyFlags['story.case_ready'], true);
  assertTask(fixture, 'step_confront', taskChain);

  openDialogue(fixture, 'npc_housekeeper', 'NPC_housekeeper_corridor_mouth');
  choose(fixture.dialogue, 'need_testimony');
  choose(fixture.dialogue, 'end');
  assert.equal(fixture.save.storyFlags['story.housekeeper_testimony'], true);

  openDialogue(fixture, 'npc_arthur', 'NPC_arthur_study_desk');
  choose(fixture.dialogue, 'show_log');
  choose(fixture.dialogue, 'press');
  choose(fixture.dialogue, 'go_hall');
  assert.equal(fixture.save.storyFlags['story.arthur_confessed'], true);
  assert.equal(fixture.save.storyFlags['story.midnight'], true);
  assertTask(fixture, 'step_midnight', taskChain);

  const prepared = cloneSave(fixture.save);
  const b10 = createFlow(cloneSave(prepared));
  const opening = openDialogue(
    b10,
    'npc_arthur',
    'NPC_arthur_signing_table',
  );
  assert.equal(opening.nodeId, 'npc_arthur_midnight_01');
  assert.equal(opening.line?.text, '到点了。笔在这儿。');
  choose(b10.dialogue, 'refuse');
  choose(b10.dialogue, 'refuse_quietly');
  choose(b10.dialogue, 'end');
  assert.equal(b10.dialogue.active, false);
  assert.equal(b10.save.storyFlags['choice.midnight'], 'refuse');
  assert.equal(b10.save.choices['npc_arthur_midnight_01'], 'refuse');
  assert.equal(b10.save.choices['npc_arthur_refuse_weak'], 'end');

  const ending = resolveEnding(b10.save.storyFlags, endings);
  assert.equal(ending?.id, 'ending_echo');
  assert.deepEqual(taskChain, EXPECTED_TASK_CHAIN);

  return { prepared, completed: cloneSave(b10.save), taskChain };
}

function getEchoFlow(): EchoFlowResult {
  if (!cachedEchoFlow) {
    cachedEchoFlow = runEchoFlow();
  }
  return cachedEchoFlow;
}

function driveB10Sign(prepared: SaveData): SaveData {
  const fixture = createFlow(cloneSave(prepared));
  const opening = openDialogue(
    fixture,
    'npc_arthur',
    'NPC_arthur_signing_table',
  );
  assert.equal(opening.nodeId, 'npc_arthur_midnight_01');
  choose(fixture.dialogue, 'sign');
  assert.equal(fixture.dialogue.active, false);
  assert.equal(fixture.save.storyFlags['choice.midnight'], 'sign');
  return fixture.save;
}

test('从接近新游戏的初始状态完整跑通 ending_echo，并通过 SaveData 恢复', () => {
  const fresh = createFreshSave();
  assert.deepEqual(fresh.storyFlags, {});
  assert.equal(resolveActiveStepId(fresh.storyFlags, quests), 'step_arrive');

  const flow = getEchoFlow();
  const ending = resolveEnding(flow.completed.storyFlags, endings);
  assert.equal(ending?.id, 'ending_echo');

  for (const flag of ECHO_SUPPORT_FLAGS) {
    assert.equal(flow.completed.storyFlags[flag], true, `${flag} 未取得`);
  }
  for (const clueId of [
    'clue_captains_log',
    'clue_crew_names',
    'clue_insurance_policy',
  ]) {
    assert.ok(
      flow.completed.discoveredClueIds.includes(clueId),
      `缺少线索 ${clueId}`,
    );
  }
  assert.ok(flow.completed.completedPuzzleIds.includes('puzzle_clock'));
  assert.ok(flow.completed.completedPuzzleIds.includes('puzzle_safe'));

  const view = ending ? presentEnding(ending.id, flow.completed.storyFlags) : null;
  assert.ok(view);
  assert.equal(view.title, '让她说话');
  assert.equal(view.subtitle, '你让她说完了。');
  assert.ok(view.paragraphs.some((paragraph) => paragraph.includes('托马斯·布伦南')));
  assert.ok(view.paragraphs.some((paragraph) => paragraph.includes('塞缪尔·克罗斯')));

  const restoredSave = parseSaveJson(flow.completed);
  assert.equal(restoredSave.schemaVersion, SAVE_SCHEMA_VERSION);
  assert.deepEqual(restoredSave.storyFlags, flow.completed.storyFlags);
  assert.deepEqual(restoredSave.discoveredClueIds, flow.completed.discoveredClueIds);
  assert.deepEqual(restoredSave.completedPuzzleIds, flow.completed.completedPuzzleIds);
  assert.deepEqual(restoredSave.choices, flow.completed.choices);

  const restored = createFlow(restoredSave);
  assert.equal(currentTask(restored), null);
  assert.equal(
    resolveEnding(restored.save.storyFlags, endings)?.id,
    'ending_echo',
  );
});

test('拒签后缺少任一隐藏结局条件都会回落到 ending_refused', () => {
  const completed = getEchoFlow().completed;

  for (const missingFlag of ECHO_SUPPORT_FLAGS) {
    const variant = cloneSave(completed);
    variant.storyFlags[missingFlag] = false;
    const ending = resolveEnding(variant.storyFlags, endings);
    assert.equal(
      ending?.id,
      'ending_refused',
      `缺少 ${missingFlag} 时不应进入 ending_echo`,
    );
    assert.equal(
      ending ? presentEnding(ending.id, variant.storyFlags)?.subtitle : null,
      '你拒绝了，但没有人听见。',
    );
  }
});

test('隐藏结局条件齐全时，B10 签署仍进入 ending_signed', () => {
  const signed = driveB10Sign(getEchoFlow().prepared);
  const ending = resolveEnding(signed.storyFlags, endings);
  assert.equal(ending?.id, 'ending_signed');
  assert.equal(
    ending ? presentEnding(ending.id, signed.storyFlags)?.subtitle : null,
    '你继承了体面。',
  );
});

function parseSaveJson(save: SaveData): SaveData {
  const parsed: unknown = JSON.parse(JSON.stringify(save));
  assert.ok(isSaveData(parsed), '序列化后的 SaveData 未通过结构校验');
  return parsed;
}

function createFreshSave(): SaveData {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    updatedAt: 0,
    currentSceneId: 'villa_entry',
    player: {
      position: [0, 1.7, 4],
      rotation: [0, 0, 0],
    },
    storyFlags: {},
    discoveredClueIds: [],
    completedPuzzleIds: [],
    completedQuestIds: [],
    npcStates: {},
    choices: {},
  };
}

function isSaveData(value: unknown): value is SaveData {
  if (!isRecord(value) || !isRecord(value.player)) {
    return false;
  }
  return (
    value.schemaVersion === SAVE_SCHEMA_VERSION &&
    isFiniteNumber(value.updatedAt) &&
    typeof value.currentSceneId === 'string' &&
    isVec3(value.player.position) &&
    isVec3(value.player.rotation) &&
    isStoryFlags(value.storyFlags) &&
    isStringArray(value.discoveredClueIds) &&
    isStringArray(value.completedPuzzleIds) &&
    isStringArray(value.completedQuestIds) &&
    isNpcStates(value.npcStates) &&
    isChoices(value.choices)
  );
}

function isNpcStates(value: unknown): value is Record<string, NPCState> {
  return isRecord(value) && Object.values(value).every(isNpcState);
}

function isNpcState(value: unknown): value is NPCState {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.npcId === 'string' &&
    typeof value.mood === 'string' &&
    isFiniteNumber(value.relationship) &&
    (value.currentDialogueNode === null ||
      typeof value.currentDialogueNode === 'string') &&
    isStringArray(value.unlockedDialogueIds) &&
    isStoryFlags(value.flags)
  );
}

function isStoryFlags(value: unknown): value is Record<string, StoryFlagValue> {
  return isRecord(value) && Object.values(value).every(isStoryFlagValue);
}

function isStoryFlagValue(value: unknown): value is StoryFlagValue {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function isChoices(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((entry) => typeof entry === 'string')
  );
}

function isVec3(value: unknown): value is Vec3Tuple {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(isFiniteNumber)
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
