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
): Fixture {
  const flags: Record<string, StoryFlagValue> = { ...initialFlags };
  const discoveries: string[] = [];
  const choices: Array<[string, string]> = [];
  const views: Array<DialogueView | null> = [];
  const conversationEnds: ConversationEndEvent[] = [];
  const host: DialogueHost = {
    getFlags: () => flags,
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
  return { system, flags, discoveries, choices, views, conversationEnds };
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

test('入口按站位与剧情进度切换', () => {
  assert.equal(
    resolveDialogueEntry('npc_arthur', 'NPC_arthur_signing_table', {
      'story.midnight': true,
    })?.nodeId,
    'npc_arthur_midnight_01',
  );
  assert.equal(
    resolveDialogueEntry('npc_arthur', 'NPC_arthur_study_desk', {
      'story.knows_coverup': true,
    })?.nodeId,
    'npc_arthur_confront_01',
  );
  assert.equal(
    resolveDialogueEntry('npc_arthur', 'NPC_arthur_dining_head', {
      'story.met_arthur': true,
    })?.nodeId,
    'npc_arthur_dinner_01',
  );
  assert.equal(
    resolveDialogueEntry('npc_arthur', 'NPC_arthur_parlor_fireplace', {})
      ?.nodeId,
    'npc_arthur_intro',
  );
  assert.equal(
    resolveDialogueEntry('npc_doctor', 'NPC_doctor_stair_foot', {
      'story.midnight': true,
    })?.nodeId,
    'npc_doctor_midnight_01',
  );
  assert.equal(
    resolveDialogueEntry('npc_doctor', 'NPC_doctor_front_door_b4', {})
      ?.nodeId,
    'npc_doctor_intro',
  );
  assert.equal(resolveDialogueEntry('npc_unknown', 'NPC', {}), null);
});

test('重复交谈时跳过入口台词，直接进入话题选项', () => {
  assert.equal(
    resolveDialogueEntry('npc_housekeeper', 'NPC_housekeeper_front_door', {})
      ?.skipOpeningLines,
    false,
  );
  assert.equal(
    resolveDialogueEntry('npc_housekeeper', 'NPC_housekeeper_front_door', {
      'story.met_housekeeper': true,
    })?.skipOpeningLines,
    true,
  );
  assert.equal(
    resolveDialogueEntry('npc_arthur', 'NPC_arthur_parlor_fireplace', {
      'story.met_arthur': true,
    })?.skipOpeningLines,
    true,
  );
  assert.equal(
    resolveDialogueEntry('npc_doctor', 'NPC_doctor_front_door_b4', {
      'story.doctor_talked': true,
    })?.skipOpeningLines,
    true,
  );

  const { system } = createFixture({
    'story.arrived': true,
    'story.met_housekeeper': true,
    'player.honorific': 'miss',
  });
  assert.equal(
    system.openForNpc('npc_housekeeper', 'NPC_housekeeper_front_door'),
    true,
  );
  const view = currentView(system);
  assert.equal(view.nodeId, 'npc_housekeeper_intro');
  assert.equal(view.canContinue, false);
  assert.equal(view.line, null);
  assert.ok(view.choices.length > 0);
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
  const before = createFixture({
    'story.arrived': true,
    'player.honorific': 'sir',
  });
  assert.equal(before.system.open('npc_housekeeper_intro'), true);
  let view = showChoices(before.system);
  assert.equal(
    view.choices.some((choice) => choice.id === 'ask_burned_pages'),
    false,
  );

  const after = createFixture({
    'story.arrived': true,
    'player.honorific': 'sir',
    'clue.burned_pages': true,
  });
  assert.equal(after.system.open('npc_housekeeper_intro'), true);
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
  const { system, flags } = createFixture({
    'story.arrived': true,
    'player.honorific': 'miss',
  });
  assert.equal(system.open('npc_housekeeper_intro'), true);

  let view = showChoices(system);
  const warm = view.choices.find((choice) => choice.id === 'warm');
  assert.ok(warm);
  system.choose(warm.id);

  view = showChoices(system);
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
