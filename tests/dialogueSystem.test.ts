import assert from 'node:assert/strict';
import { test } from 'node:test';
import { content } from '../src/content/index.ts';
import {
  DialogueSystem,
  resolveDialogueText,
  type ConversationEndEvent,
  type DialogueHost,
} from '../src/game/dialogue/DialogueSystem.ts';
import { resolveDialogueEntry } from '../src/game/dialogue/dialogueEntries.ts';
import type { StoryFlagValue } from '../src/shared/types/content.ts';
import type { DialogueView } from '../src/shared/types/dialogue.ts';

interface Fixture {
  system: DialogueSystem;
  flags: Record<string, StoryFlagValue>;
  discoveries: string[];
  choices: Array<[string, string]>;
  views: Array<DialogueView | null>;
  conversationEnds: ConversationEndEvent[];
}

function createFixture(
  initialFlags: Record<string, StoryFlagValue> = {},
  initialTaskId: string | null = null,
): Fixture & { setActiveTask: (taskId: string | null) => void } {
  const flags: Record<string, StoryFlagValue> = { ...initialFlags };
  let activeTaskId = initialTaskId;
  const discoveries: string[] = [];
  const choices: Array<[string, string]> = [];
  const views: Array<DialogueView | null> = [];
  const conversationEnds: ConversationEndEvent[] = [];
  const host: DialogueHost = {
    getFlags: () => flags,
    getActiveTaskId: () => activeTaskId,
    setFlag: (key, value) => {
      flags[key] = value;
    },
    discoverClue: (clueId) => {
      discoveries.push(clueId);
    },
    recordChoice: (nodeId, choiceId) => {
      choices.push([nodeId, choiceId]);
    },
    onChange: (view) => {
      views.push(view);
    },
    onConversationEnd: (event) => {
      conversationEnds.push(event);
    },
  };
  const system = new DialogueSystem({
    dialogues: content.dialogues,
    npcNames: new Map(content.npcs.map((npc) => [npc.id, npc.name])),
    host,
  });
  const setActiveTask = (taskId: string | null) => {
    activeTaskId = taskId;
  };
  return { system, flags, discoveries, choices, views, conversationEnds, setActiveTask };
}

function currentView(system: DialogueSystem): DialogueView {
  const view = system.view();
  assert.ok(view);
  return view;
}

function showChoices(system: DialogueSystem): DialogueView {
  let view = currentView(system);
  while (view.canContinue) {
    system.advance();
    view = currentView(system);
  }
  return view;
}

function resolveEntry(
  activeTaskId: string,
  npcId: string,
  spotId: string,
  flags: Record<string, StoryFlagValue>,
) {
  return resolveDialogueEntry({ activeTaskId, npcId, spotId, flags });
}

test('入口按剧情步骤与站位切换', () => {
  assert.equal(
    resolveEntry(
      'step_midnight',
      'npc_arthur',
      'NPC_arthur_signing_table',
      { 'story.midnight': true },
    )?.nodeId,
    'npc_arthur_midnight_01',
  );
  assert.equal(
    resolveEntry(
      'step_confront',
      'npc_arthur',
      'NPC_arthur_study_desk',
      { 'story.knows_coverup': true },
    )?.nodeId,
    'npc_arthur_confront_01',
  );
  assert.equal(
    resolveEntry(
      'step_doctor',
      'npc_arthur',
      'NPC_arthur_dining_head',
      { 'story.met_arthur': true },
    )?.nodeId,
    'npc_arthur_dinner_01',
  );
  assert.equal(
    resolveEntry(
      'step_arthur',
      'npc_arthur',
      'NPC_arthur_parlor_fireplace',
      {},
    )?.nodeId,
    'npc_arthur_intro',
  );
  assert.equal(
    resolveEntry(
      'step_coverup',
      'npc_arthur',
      'NPC_arthur_study_desk',
      {},
    )?.nodeId,
    'npc_arthur_b5_study_01',
  );
  assert.equal(
    resolveEntry(
      'step_midnight',
      'npc_doctor',
      'NPC_doctor_stair_foot',
      { 'story.midnight': true },
    )?.nodeId,
    'npc_doctor_midnight_01',
  );
  assert.equal(
    resolveEntry(
      'step_doctor',
      'npc_doctor',
      'NPC_doctor_front_door_b4',
      {},
    )?.nodeId,
    'npc_doctor_intro',
  );
  assert.equal(
    resolveEntry('step_arrive', 'npc_unknown', 'NPC', {}),
    null,
  );
});

test('重复交谈时跳过入口台词，直接进入话题选项', () => {
  assert.equal(
    resolveEntry(
      'step_housekeeper',
      'npc_housekeeper',
      'NPC_housekeeper_front_door',
      {},
    )?.skipOpeningLines,
    false,
  );
  assert.equal(
    resolveEntry(
      'step_housekeeper',
      'npc_housekeeper',
      'NPC_housekeeper_front_door',
      { 'story.met_housekeeper': true },
    )?.skipOpeningLines,
    true,
  );
  assert.equal(
    resolveEntry(
      'step_arthur',
      'npc_arthur',
      'NPC_arthur_parlor_fireplace',
      { 'story.met_arthur': true },
    )?.skipOpeningLines,
    true,
  );
  assert.equal(
    resolveEntry(
      'step_doctor',
      'npc_doctor',
      'NPC_doctor_front_door_b4',
      { 'story.doctor_talked': true },
    )?.skipOpeningLines,
    true,
  );

  const { system } = createFixture(
    {
      'story.arrived': true,
      'story.met_housekeeper': true,
      'player.honorific': 'miss',
    },
    'step_housekeeper',
  );
  assert.equal(
    system.openForNpc('npc_housekeeper', 'NPC_housekeeper_front_door'),
    true,
  );
  const view = currentView(system);
  assert.equal(view.nodeId, 'npc_housekeeper_intro');
  assert.equal(view.canContinue, true);
  assert.equal(view.line?.text, '……还有什么需要我做的吗，小姐？');
  assert.equal(view.choices.length, 0);
  system.advance();
  assert.ok(currentView(system).choices.length > 0);
});

test('入口条件不满足时无法开启对话', () => {
  const { system } = createFixture();
  assert.equal(system.open('npc_arthur_intro'), false);
  assert.equal(system.active, false);
});

test('称谓占位符按开场选择替换', () => {
  assert.equal(
    resolveDialogueText('晚上好，{honorific}。', { 'player.honorific': 'miss' }),
    '晚上好，小姐。',
  );
  assert.equal(
    resolveDialogueText('晚上好，{honorific}。', { 'player.honorific': 'sir' }),
    '晚上好，先生。',
  );
});

test('逐句推进后显示选项，选项效果写入标记并跳转', () => {
  const { system, flags, choices } = createFixture({
    'story.arrived': true,
    'player.honorific': 'miss',
  });

  assert.equal(system.open('npc_arthur_intro'), true);
  let view = currentView(system);
  assert.equal(view.line?.speaker, 'npc');
  assert.equal(view.line?.name, '亚瑟·阿什克罗夫特');
  assert.equal(view.canContinue, true);
  assert.deepEqual(view.choices, []);

  view = showChoices(system);
  assert.equal(view.canContinue, false);
  assert.ok(view.choices.some((choice) => choice.id === 'ask_evelyn'));

  const ask = view.choices.find((choice) => choice.id === 'ask_evelyn');
  assert.ok(ask);
  assert.equal(system.choose(ask.id), true);
  assert.equal(flags['story.met_arthur'], true);
  assert.deepEqual(choices, [['npc_arthur_intro', 'ask_evelyn']]);
  assert.equal(currentView(system).nodeId, 'npc_arthur_evelyn_01');
});

test('选项按剧情标记过滤，线索选项在获得线索后出现', () => {
  const before = createFixture(
    {
      'story.arrived': true,
      'story.met_housekeeper': true,
      'player.honorific': 'sir',
    },
    'step_coverup',
  );
  assert.equal(before.system.open('npc_housekeeper_b5_01'), true);
  let view = showChoices(before.system);
  assert.equal(
    view.choices.some((choice) => choice.id === 'ask_burned_pages'),
    false,
  );

  const after = createFixture(
    {
      'story.arrived': true,
      'story.met_housekeeper': true,
      'player.honorific': 'sir',
      'clue.burned_pages': true,
    },
    'step_coverup',
  );
  assert.equal(after.system.open('npc_housekeeper_b5_01'), true);
  view = showChoices(after.system);
  assert.ok(view.choices.some((choice) => choice.id === 'ask_burned_pages'));
});

test('同场台词用【姓名】前缀切换说话人', () => {
  const { system } = createFixture({
    'story.met_arthur': true,
    'player.honorific': 'sir',
  });
  assert.equal(system.open('npc_arthur_dinner_01'), true);
  let view = showChoices(system);
  const ask = view.choices.find((choice) => choice.id === 'ask_seat');
  assert.ok(ask);
  assert.equal(system.choose(ask.id), true);

  view = currentView(system);
  assert.equal(view.line?.name, '亚瑟·阿什克罗夫特');
  system.advance();
  view = currentView(system);
  assert.equal(view.line?.name, '格雷医生');
  assert.equal(view.line?.text, '活人总得靠点仪式感才能睡得着。对吧，亚瑟？');
});

test('线索效果通过 discoverClue 上报，结束选项关闭会话', () => {
  const { system, discoveries, views } = createFixture({
    'story.met_arthur': true,
    'player.honorific': 'sir',
  });
  assert.equal(system.open('npc_arthur_dinner_01'), true);
  let view = showChoices(system);
  const ask = view.choices.find((choice) => choice.id === 'ask_seat');
  assert.ok(ask);
  system.choose(ask.id);

  view = showChoices(system);
  const back = view.choices.find((choice) => choice.id === 'back');
  assert.ok(back);
  assert.equal(system.choose(back.id), true);
  assert.deepEqual(discoveries, ['clue_dinner_seating']);

  view = showChoices(system);
  const leave = view.choices.find((choice) => choice.id === 'leave');
  assert.ok(leave);
  assert.equal(system.choose(leave.id), true);
  assert.equal(system.active, false);
  assert.equal(views.at(-1), null);
});

test('返回已看过的节点时直接进入选项阶段，不重播台词', () => {
  const { system } = createFixture({
    'story.arrived': true,
    'player.honorific': 'sir',
  });
  assert.equal(system.open('npc_arthur_intro'), true);

  let view = showChoices(system);
  const askEvelyn = view.choices.find((choice) => choice.id === 'ask_evelyn');
  assert.ok(askEvelyn);
  system.choose(askEvelyn.id);

  view = showChoices(system);
  const askWhy = view.choices.find((choice) => choice.id === 'ask_why_cliff');
  assert.ok(askWhy);
  system.choose(askWhy.id);

  view = showChoices(system);
  const back = view.choices.find((choice) => choice.id === 'back');
  assert.ok(back);
  assert.equal(system.choose(back.id), true);

  view = currentView(system);
  assert.equal(view.nodeId, 'npc_arthur_evelyn_01');
  assert.equal(view.canContinue, false);
  assert.ok(view.choices.some((choice) => choice.id === 'ask_why_cliff'));
});

test('霍尔太太的夜间证词链可以推进到掩盖真相', () => {
  const { system, flags } = createFixture(
    {
      'story.arrived': true,
      'story.met_housekeeper': true,
      'story.housekeeper_warm': true,
      'player.honorific': 'miss',
    },
    'step_coverup',
  );
  assert.equal(system.open('npc_housekeeper_b5_01'), true);

  let view = showChoices(system);
  const askEvelyn = view.choices.find((choice) => choice.id === 'ask_evelyn');
  assert.ok(askEvelyn);
  system.choose(askEvelyn.id);

  view = showChoices(system);
  const askNight = view.choices.find((choice) => choice.id === 'ask_night');
  assert.ok(askNight);
  system.choose(askNight.id);

  view = showChoices(system);
  const press = view.choices.find((choice) => choice.id === 'press');
  assert.ok(press);
  system.choose(press.id);

  view = showChoices(system);
  const askAlive = view.choices.find((choice) => choice.id === 'ask_alive');
  assert.ok(askAlive);
  system.choose(askAlive.id);

  view = showChoices(system);
  const leave = view.choices.find((choice) => choice.id === 'leave');
  assert.ok(leave);
  system.choose(leave.id);
  assert.equal(flags['story.knows_coverup'], true);
  assert.equal(system.active, false);
});

test('会话结束上报：只打开就关闭不算谈完', () => {
  const { system, conversationEnds } = createFixture({ 'story.arrived': true });
  assert.equal(system.open('npc_arthur_intro'), true);
  system.close();
  assert.deepEqual(conversationEnds, [
    { npcId: 'npc_arthur', nodeId: 'npc_arthur_intro', completed: false },
  ]);
});

test('会话结束上报：推进台词后算谈完', () => {
  const { system, conversationEnds } = createFixture({ 'story.arrived': true });
  assert.equal(system.open('npc_arthur_intro'), true);
  system.advance();
  system.close();
  assert.deepEqual(conversationEnds, [
    { npcId: 'npc_arthur', nodeId: 'npc_arthur_intro', completed: true },
  ]);
});

test('会话结束上报：选择结束选项时只上报一次', () => {
  const { system, conversationEnds } = createFixture({ 'story.arrived': true });
  assert.equal(system.open('npc_arthur_intro'), true);
  const view = showChoices(system);
  const leave = view.choices.find((choice) => choice.id === 'leave');
  assert.ok(leave);
  assert.equal(system.choose(leave.id), true);
  assert.deepEqual(conversationEnds, [
    { npcId: 'npc_arthur', nodeId: 'npc_arthur_intro', completed: true },
  ]);
});

test('话题选项按全局任务进度过滤，未标记的返回/离开选项保留', () => {
  const { system } = createFixture(
    { 'story.arrived': true, 'player.honorific': 'sir' },
    'step_arthur',
  );
  assert.equal(system.open('npc_arthur_intro'), true);
  const view = showChoices(system);
  const ids = view.choices.map((choice) => choice.id);
  assert.ok(ids.includes('ask_evelyn'));
  assert.ok(ids.includes('ask_house'));
  assert.ok(ids.includes('leave'));

  // 不属于当前情节的入口节点整段不可进入（例如餐厅阶段的霍尔太太）。
  const housekeeper = createFixture(
    { 'story.arrived': true, 'player.honorific': 'sir' },
    'step_doctor',
  );
  assert.equal(housekeeper.system.open('npc_housekeeper_intro'), false);
  assert.equal(housekeeper.system.active, false);

  // 霍尔太太在调查阶段重新出现相关话题。
  const coverup = createFixture(
    {
      'story.arrived': true,
      'story.met_housekeeper': true,
      'story.has_letter': true,
      'player.honorific': 'sir',
    },
    'step_coverup',
  );
  assert.equal(coverup.system.open('npc_housekeeper_b5_01'), true);
  const coverupIds = showChoices(coverup.system).choices.map((c) => c.id);
  assert.ok(coverupIds.includes('ask_evelyn'));
  assert.ok(coverupIds.includes('show_letter'));
  assert.ok(coverupIds.includes('leave'));
  assert.equal(coverupIds.includes('warm'), false);
});

test('情节分段：同一 NPC 只显示当前阶段的话题', () => {
  const meeting = createFixture(
    {
      'story.arrived': true,
      'story.has_letter': true,
      'player.honorific': 'sir',
    },
    'step_housekeeper',
  );
  assert.equal(meeting.system.open('npc_housekeeper_intro'), true);
  const meetingIds = showChoices(meeting.system).choices.map((c) => c.id);
  assert.ok(meetingIds.includes('warm'));
  assert.ok(meetingIds.includes('ask_evelyn'));
  // 抵达阶段允许出示信，但只进入抵达期信件分支，不开放夜间证词。
  assert.ok(meetingIds.includes('show_letter'));
  assert.equal(meetingIds.includes('ask_night'), false);

  const coverup = createFixture(
    {
      'story.arrived': true,
      'story.met_housekeeper': true,
      'story.has_letter': true,
      'player.honorific': 'sir',
    },
    'step_coverup',
  );
  assert.equal(coverup.system.open('npc_housekeeper_b5_01'), true);
  const coverupIds = showChoices(coverup.system).choices.map((c) => c.id);
  assert.ok(coverupIds.includes('show_letter'));
  assert.ok(coverupIds.includes('ask_evelyn'));
  assert.equal(coverupIds.includes('confront'), false);
});

test('任务全部完成（无当前任务）时不过滤话题选项', () => {
  const { system } = createFixture(
    { 'story.arrived': true, 'player.honorific': 'sir' },
    null,
  );
  assert.equal(system.open('npc_arthur_intro'), true);
  const ids = showChoices(system).choices.map((choice) => choice.id);
  assert.ok(ids.includes('ask_evelyn'));
  assert.ok(ids.includes('ask_will'));
  assert.ok(ids.includes('ask_house'));
});

test('B1 霍尔太太不会提前说出夜间证词或交出房间钥匙', () => {
  const { system } = createFixture(
    {
      'story.arrived': true,
      'story.has_letter': true,
      'player.honorific': 'sir',
    },
    'step_housekeeper',
  );
  assert.equal(
    system.openForNpc('npc_housekeeper', 'NPC_housekeeper_front_door'),
    true,
  );
  let view = showChoices(system);
  const ids = view.choices.map((choice) => choice.id);
  assert.ok(ids.includes('warm'));
  assert.ok(ids.includes('ask_evelyn'));
  // 抵达时可以出示信，但信件分支不能变成夜间证词或房间钥匙的捷径。
  assert.ok(ids.includes('show_letter'));
  assert.equal(ids.includes('ask_night'), false);
  assert.equal(ids.includes('ask_room'), false);
  assert.equal(ids.includes('confront'), false);

  const warm = view.choices.find((choice) => choice.id === 'warm');
  assert.ok(warm);
  system.choose(warm.id);
  view = showChoices(system);
  const askEvelyn = view.choices.find((choice) => choice.id === 'ask_evelyn');
  assert.ok(askEvelyn);
  system.choose(askEvelyn.id);

  view = showChoices(system);
  const evelynIds = view.choices.map((choice) => choice.id);
  assert.deepEqual(evelynIds, ['back']);

  // 直接打开后期证词节点也会被节拍拦截。
  const blocked = createFixture(
    { 'story.housekeeper_warm': true, 'player.honorific': 'sir' },
    'step_housekeeper',
  );
  assert.equal(blocked.system.open('npc_housekeeper_night_01'), false);
});

test('B1 霍尔太太交代午夜前不许上楼的规则', () => {
  const { system } = createFixture(
    { 'story.arrived': true, 'player.honorific': 'sir' },
    'step_housekeeper',
  );
  assert.equal(
    system.openForNpc('npc_housekeeper', 'NPC_housekeeper_front_door'),
    true,
  );
  const texts: string[] = [];
  let view = currentView(system);
  while (view.canContinue) {
    if (view.line) {
      texts.push(view.line.text);
    }
    system.advance();
    view = currentView(system);
  }
  assert.ok(texts.some((text) => text.includes('午夜之前，请别上楼')));
});

test('B1 冷淡后的改口进入温和分支，不重播开场台词', () => {
  const { system, flags } = createFixture(
    { 'story.arrived': true, 'player.honorific': 'sir' },
    'step_housekeeper',
  );
  assert.equal(
    system.openForNpc('npc_housekeeper', 'NPC_housekeeper_front_door'),
    true,
  );
  let view = showChoices(system);
  const cold = view.choices.find((choice) => choice.id === 'cold');
  assert.ok(cold);
  system.choose(cold.id);
  assert.equal(flags['story.housekeeper_cold'], true);

  view = showChoices(system);
  const warmUp = view.choices.find((choice) => choice.id === 'warm_up');
  assert.ok(warmUp);
  system.choose(warmUp.id);
  assert.equal(currentView(system).nodeId, 'npc_housekeeper_warm');
  assert.equal(flags['story.housekeeper_warm'], true);
});

test('B1 霍尔太太只谈人，不提前把话题引向房间与钥匙', () => {
  const { system } = createFixture(
    { 'story.arrived': true, 'player.honorific': 'sir' },
    'step_housekeeper',
  );
  assert.equal(
    system.openForNpc('npc_housekeeper', 'NPC_housekeeper_front_door'),
    true,
  );
  const view = showChoices(system);
  const askEvelyn = view.choices.find((choice) => choice.id === 'ask_evelyn');
  assert.ok(askEvelyn);
  assert.equal(askEvelyn.text.includes('房间'), false);
  assert.equal(askEvelyn.text.includes('钥匙'), false);
});

test('B5 霍尔太太先谈人，房间与钥匙作为后续追问', () => {
  const { system, flags } = createFixture(
    {
      'story.arrived': true,
      'story.met_housekeeper': true,
      'story.housekeeper_warm': true,
      'player.honorific': 'sir',
    },
    'step_coverup',
  );
  assert.equal(
    system.openForNpc('npc_housekeeper', 'NPC_housekeeper_dining_door'),
    true,
  );
  let view = showChoices(system);
  const askEvelyn = view.choices.find((choice) => choice.id === 'ask_evelyn');
  assert.ok(askEvelyn);
  assert.equal(askEvelyn.text.includes('房间'), false);
  system.choose(askEvelyn.id);

  view = showChoices(system);
  const askRoom = view.choices.find((choice) => choice.id === 'ask_room');
  assert.ok(askRoom);
  assert.ok(askRoom.text.includes('房间'));
  system.choose(askRoom.id);

  view = showChoices(system);
  const back = view.choices.find((choice) => choice.id === 'back');
  assert.ok(back);
  system.choose(back.id);
  assert.equal(flags['story.housekeeper_key'], true);
});

test('B10 医生的威胁选项需要先拿到诊疗记录', () => {
  const withoutRecord = createFixture(
    {
      'story.met_doctor': true,
      'story.midnight': true,
      'player.honorific': 'sir',
    },
    'step_midnight',
  );
  assert.equal(
    withoutRecord.system.openForNpc('npc_doctor', 'NPC_doctor_stair_foot'),
    true,
  );
  assert.equal(
    showChoices(withoutRecord.system).choices.some((c) => c.id === 'threaten'),
    false,
  );

  const withRecord = createFixture(
    {
      'story.met_doctor': true,
      'story.midnight': true,
      'clue.medical_record': true,
      'player.honorific': 'sir',
    },
    'step_midnight',
  );
  assert.equal(
    withRecord.system.openForNpc('npc_doctor', 'NPC_doctor_stair_foot'),
    true,
  );
  assert.equal(
    showChoices(withRecord.system).choices.some((c) => c.id === 'threaten'),
    true,
  );
});

test('B5 霍尔太太可以谈夜间证词，但不会出现对质话题', () => {
  const { system } = createFixture(
    {
      'story.arrived': true,
      'story.met_housekeeper': true,
      'story.housekeeper_warm': true,
      'player.honorific': 'sir',
    },
    'step_coverup',
  );
  assert.equal(
    system.openForNpc('npc_housekeeper', 'NPC_housekeeper_dining_door'),
    true,
  );
  const view = showChoices(system);
  assert.ok(view.choices.some((choice) => choice.id === 'ask_evelyn'));
  assert.equal(view.choices.some((choice) => choice.id === 'confront'), false);
  assert.equal(view.beatLabel, '第二幕 · 调查');
});

test('B9 对质与 B10 午夜各有独立入口', () => {
  const confront = createFixture(
    {
      'story.met_housekeeper': true,
      'story.knows_coverup': true,
      'story.housekeeper_warm': true,
      'player.honorific': 'sir',
    },
    'step_confront',
  );
  assert.equal(
    confront.system.openForNpc('npc_housekeeper', 'NPC_housekeeper_corridor_mouth'),
    true,
  );
  const confrontIds = showChoices(confront.system).choices.map((c) => c.id);
  assert.ok(confrontIds.includes('need_testimony'));
  assert.equal(confrontIds.includes('ask_evelyn'), false);
  assert.equal(confrontIds.includes('show_letter'), false);

  const midnight = createFixture(
    { 'story.met_housekeeper': true, 'player.honorific': 'sir' },
    'step_midnight',
  );
  assert.equal(
    midnight.system.openForNpc('npc_housekeeper', 'NPC_housekeeper_hall_door_b10'),
    true,
  );
  const midnightView = showChoices(midnight.system);
  assert.equal(midnightView.nodeId, 'npc_housekeeper_midnight_01');
  assert.equal(midnightView.beatLabel, '第四幕 · 午夜');
  assert.ok(midnightView.choices.some((choice) => choice.id === 'leave'));
});

test('B5 补充调查阶段追问账本结束后不会跳回餐桌台词', () => {
  const { system } = createFixture(
    {
      'story.met_arthur': true,
      'clue.shipping_ledger': true,
      'player.honorific': 'sir',
    },
    'step_corroborate',
  );
  assert.equal(
    system.openForNpc('npc_arthur', 'NPC_arthur_study_desk'),
    true,
  );
  let view = showChoices(system);
  const ask = view.choices.find((choice) => choice.id === 'ask_ledger');
  assert.ok(ask);
  system.choose(ask.id);

  view = showChoices(system);
  const back = view.choices.find((choice) => choice.id === 'back');
  assert.ok(back);
  assert.equal(system.choose(back.id), true);
  assert.equal(system.active, false);
});

test('B5 的亚瑟只给过渡对白，B9 才进入正式对质', () => {
  const waiting = createFixture(
    { 'story.met_arthur': true, 'player.honorific': 'sir' },
    'step_evidence',
  );
  assert.equal(
    waiting.system.openForNpc('npc_arthur', 'NPC_arthur_study_desk'),
    true,
  );
  const waitingView = showChoices(waiting.system);
  assert.equal(waitingView.nodeId, 'npc_arthur_b5_study_01');
  assert.equal(waitingView.choices.some((c) => c.id === 'accuse'), false);

  const confront = createFixture(
    {
      'story.met_arthur': true,
      'story.knows_coverup': true,
      'player.honorific': 'sir',
    },
    'step_confront',
  );
  assert.equal(
    confront.system.openForNpc('npc_arthur', 'NPC_arthur_study_desk'),
    true,
  );
  const confrontView = showChoices(confront.system);
  assert.equal(confrontView.nodeId, 'npc_arthur_confront_01');
  assert.ok(confrontView.choices.some((c) => c.id === 'accuse'));
});

test('B5 的格雷医生使用调查入口，不重播到访寒暄', () => {
  const { system } = createFixture(
    {
      'story.met_doctor': true,
      'story.doctor_talked': true,
      'player.honorific': 'sir',
    },
    'step_medical_truth',
  );
  assert.equal(
    system.openForNpc('npc_doctor', 'NPC_doctor_front_door_b4'),
    true,
  );
  const view = showChoices(system);
  assert.equal(view.nodeId, 'npc_doctor_b5_01');
  const ids = view.choices.map((choice) => choice.id);
  assert.ok(ids.includes('ask_evelyn'));
  assert.equal(ids.includes('ask_summer'), false);
  assert.equal(ids.includes('polite'), false);
});

test('B5 关键步骤只渲染当前剧情话题，并显示当前目标提示', () => {
  const coverup = createFixture(
    {
      'story.met_housekeeper': true,
      'story.housekeeper_warm': true,
      'story.has_letter': true,
      'clue.burned_pages': true,
      'clue.arthur_cloak': true,
      'player.honorific': 'sir',
    },
    'step_coverup',
  );
  assert.equal(
    coverup.system.openForNpc('npc_housekeeper', 'NPC_housekeeper_dining_door'),
    true,
  );
  const coverupView = showChoices(coverup.system);
  assert.equal(coverupView.contextLabel, '问出那晚的搬运经过');
  assert.deepEqual(
    coverupView.choices.map((choice) => choice.id),
    ['ask_evelyn', 'leave'],
  );
  assert.equal(coverupView.choices.some((choice) => choice.id === 'show_letter'), false);
  assert.equal(coverupView.choices.some((choice) => choice.id === 'ask_cloak'), false);

  const medicalTruth = createFixture(
    {
      'story.met_doctor': true,
      'story.doctor_talked': true,
      'clue.medical_record': true,
      'clue.bathroom_trace': true,
      'player.honorific': 'sir',
    },
    'step_medical_truth',
  );
  assert.equal(
    medicalTruth.system.openForNpc('npc_doctor', 'NPC_doctor_front_door_b4'),
    true,
  );
  let medicalView = showChoices(medicalTruth.system);
  assert.equal(medicalView.contextLabel, '把两份伤情证据交给格雷医生');
  assert.deepEqual(
    medicalView.choices.map((choice) => choice.id),
    ['ask_evelyn', 'leave'],
  );
  medicalTruth.system.choose('ask_evelyn');
  medicalView = showChoices(medicalTruth.system);
  assert.deepEqual(
    medicalView.choices.map((choice) => choice.id),
    ['show_record', 'ask_towel', 'back'],
  );

  const evidence = createFixture(
    {
      'story.met_arthur': true,
      'clue.shipping_ledger': true,
      'clue.arthur_cloak': true,
      'player.honorific': 'sir',
    },
    'step_evidence',
  );
  assert.equal(
    evidence.system.openForNpc('npc_arthur', 'NPC_arthur_study_desk'),
    true,
  );
  const evidenceView = showChoices(evidence.system);
  assert.equal(evidenceView.contextLabel, '整理证据，准备对质');
  assert.deepEqual(
    evidenceView.choices.map((choice) => choice.id),
    ['leave'],
  );
});

test('对话会话锁定当前步骤的话题白名单，任务推进不会混入下一步追问', () => {
  const fixture = createFixture(
    {
      'story.met_housekeeper': true,
      'story.housekeeper_warm': true,
      'clue.arthur_cloak': true,
      'player.honorific': 'sir',
    },
    'step_coverup',
  );
  assert.equal(
    fixture.system.openForNpc('npc_housekeeper', 'NPC_housekeeper_dining_door'),
    true,
  );
  assert.deepEqual(
    showChoices(fixture.system).choices.map((choice) => choice.id),
    ['ask_evelyn', 'leave'],
  );

  fixture.setActiveTask('step_corroborate');
  assert.deepEqual(
    showChoices(fixture.system).choices.map((choice) => choice.id),
    ['ask_evelyn', 'leave'],
  );
});

test('对话打开后锁定节拍，任务推进不会把下一幕话题混进当前会话', () => {
  const fixture = createFixture(
    { 'story.arrived': true, 'player.honorific': 'sir' },
    'step_housekeeper',
  );
  assert.equal(
    fixture.system.openForNpc('npc_housekeeper', 'NPC_housekeeper_front_door'),
    true,
  );
  let view = showChoices(fixture.system);
  const warm = view.choices.find((choice) => choice.id === 'warm');
  assert.ok(warm);
  fixture.system.choose(warm.id);

  fixture.setActiveTask('step_arthur');
  view = showChoices(fixture.system);
  const ids = view.choices.map((choice) => choice.id);
  assert.deepEqual(ids, ['ask_evelyn', 'leave']);
  assert.equal(view.beatLabel, '第一幕 · 抵达');

  fixture.system.close();
  assert.equal(
    fixture.system.openForNpc('npc_housekeeper', 'NPC_housekeeper_front_door'),
    true,
  );
  assert.equal(currentView(fixture.system).nodeId, 'npc_housekeeper_wait_01');
});

test('B1 出示信进入抵达期信件分支，只谈过去不谈夜间证词', () => {
  const { system, flags } = createFixture(
    {
      'story.arrived': true,
      'story.has_letter': true,
      'player.honorific': 'sir',
    },
    'step_housekeeper',
  );
  assert.equal(
    system.openForNpc('npc_housekeeper', 'NPC_housekeeper_front_door'),
    true,
  );
  let view = showChoices(system);
  const showLetter = view.choices.find((choice) => choice.id === 'show_letter');
  assert.ok(showLetter);
  system.choose(showLetter.id);

  view = showChoices(system);
  assert.equal(view.nodeId, 'npc_housekeeper_letter_b1');
  assert.deepEqual(
    view.choices.map((choice) => choice.id),
    ['ask_evelyn', 'leave'],
  );
  assert.equal(flags['story.met_housekeeper'], true);

  const ask = view.choices.find((choice) => choice.id === 'ask_evelyn');
  assert.ok(ask);
  system.choose(ask.id);
  assert.equal(flags['story.housekeeper_warm'], true);
  assert.equal(flags['story.letter_shown'], true);
  assert.equal(currentView(system).nodeId, 'npc_housekeeper_evelyn_01');

  // 没带信时不会出现这个选项。
  const noLetter = createFixture(
    { 'story.arrived': true, 'player.honorific': 'sir' },
    'step_housekeeper',
  );
  noLetter.system.openForNpc('npc_housekeeper', 'NPC_housekeeper_front_door');
  assert.equal(
    showChoices(noLetter.system).choices.some(
      (choice) => choice.id === 'show_letter',
    ),
    false,
  );
});

test('B5 十三下之后亚瑟在二楼栏杆边使用专属入口', () => {
  const { system } = createFixture(
    { 'story.met_arthur': true, 'player.honorific': 'sir' },
    'step_evidence',
  );
  assert.equal(
    system.openForNpc('npc_arthur', 'NPC_arthur_gallery_rail'),
    true,
  );
  const view = showChoices(system);
  assert.equal(view.nodeId, 'npc_arthur_b5_gallery_01');
  assert.deepEqual(
    view.choices.map((choice) => choice.id),
    ['leave'],
  );

  // 同一节拍下，书房站位仍然进入书房过渡对白。
  const study = createFixture(
    { 'story.met_arthur': true, 'player.honorific': 'sir' },
    'step_evidence',
  );
  study.system.openForNpc('npc_arthur', 'NPC_arthur_study_desk');
  assert.equal(showChoices(study.system).nodeId, 'npc_arthur_b5_study_01');
});

test('B10 取得证词后 NPC 使用证词后的午夜入口', () => {
  assert.equal(
    resolveEntry(
      'step_midnight',
      'npc_housekeeper',
      'NPC_housekeeper_hall_door_b10',
      { 'story.housekeeper_testimony': true },
    )?.nodeId,
    'npc_housekeeper_midnight_testified',
  );
  assert.equal(
    resolveEntry(
      'step_midnight',
      'npc_doctor',
      'NPC_doctor_stair_foot',
      { 'story.doctor_testimony': true },
    )?.nodeId,
    'npc_doctor_midnight_testified',
  );
  assert.equal(
    resolveEntry(
      'step_midnight',
      'npc_housekeeper',
      'NPC_housekeeper_hall_door_b10',
      {},
    )?.nodeId,
    'npc_housekeeper_midnight_01',
  );
  assert.equal(
    resolveEntry(
      'step_midnight',
      'npc_doctor',
      'NPC_doctor_stair_foot',
      {},
    )?.nodeId,
    'npc_doctor_midnight_01',
  );
});

test('B2 追问崖边时记录亚瑟左腕的抓痕，并在 B5 可用于追问书房', () => {
  const fixture = createFixture(
    { 'story.arrived': true, 'player.honorific': 'sir' },
    'step_arthur',
  );
  assert.equal(
    fixture.system.openForNpc('npc_arthur', 'NPC_arthur_parlor_fireplace'),
    true,
  );
  let view = showChoices(fixture.system);
  const askEvelyn = view.choices.find((choice) => choice.id === 'ask_evelyn');
  assert.ok(askEvelyn);
  fixture.system.choose(askEvelyn.id);

  view = showChoices(fixture.system);
  const askWhy = view.choices.find((choice) => choice.id === 'ask_why_cliff');
  assert.ok(askWhy);
  fixture.system.choose(askWhy.id);

  view = showChoices(fixture.system);
  const askStudy = view.choices.find((choice) => choice.id === 'ask_study');
  assert.ok(askStudy);
  fixture.system.choose(askStudy.id);
  assert.ok(fixture.discoveries.includes('clue_arthur_scratch'));
  assert.equal(fixture.flags['story.saw_arthur_scratch'], true);

  const b5 = createFixture(
    {
      'story.met_arthur': true,
      'clue.arthur_scratch': true,
      'player.honorific': 'sir',
    },
    'step_corroborate',
  );
  b5.system.openForNpc('npc_arthur', 'NPC_arthur_study_desk');
  const b5Choices = showChoices(b5.system);
  assert.ok(b5Choices.choices.some((choice) => choice.id === 'ask_scratch'));
});

test('B5 亚瑟承认忌日前披着伊芙琳的斗篷去过崖边', () => {
  const fixture = createFixture(
    {
      'story.met_arthur': true,
      'clue.arthur_cloak': true,
      'player.honorific': 'sir',
    },
    'step_corroborate',
  );
  assert.equal(
    fixture.system.openForNpc('npc_arthur', 'NPC_arthur_study_desk'),
    true,
  );
  let view = showChoices(fixture.system);
  const askCloak = view.choices.find((choice) => choice.id === 'ask_cloak');
  assert.ok(askCloak);
  fixture.system.choose(askCloak.id);

  view = showChoices(fixture.system);
  assert.equal(view.nodeId, 'npc_arthur_b5_cloak_01');
  const back = view.choices.find((choice) => choice.id === 'back');
  assert.ok(back);
  fixture.system.choose(back.id);
  assert.equal(fixture.flags['story.arthur_cloak_admitted'], true);
});

test('B5 格雷承认现场后可以追问隐瞒动机', () => {
  const fixture = createFixture(
    {
      'story.met_doctor': true,
      'story.doctor_confessed': true,
      'player.honorific': 'sir',
    },
    'step_corroborate',
  );
  assert.equal(
    fixture.system.openForNpc('npc_doctor', 'NPC_doctor_front_door_b4'),
    true,
  );
  let view = showChoices(fixture.system);
  const askMotive = view.choices.find((choice) => choice.id === 'ask_motive');
  assert.ok(askMotive);
  fixture.system.choose(askMotive.id);

  view = showChoices(fixture.system);
  assert.equal(view.nodeId, 'npc_doctor_motive_01');
  const leave = view.choices.find((choice) => choice.id === 'leave');
  assert.ok(leave);
  fixture.system.choose(leave.id);
  assert.equal(fixture.flags['story.doctor_motive_known'], true);
});
