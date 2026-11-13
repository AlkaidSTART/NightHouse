import assert from 'node:assert/strict';
import { test } from 'node:test';
import { content } from '../src/content/index.ts';
import { endings, presentEnding } from '../src/content/endings.ts';
import {
  DialogueSystem,
  type DialogueHost,
} from '../src/game/dialogue/DialogueSystem.ts';
import { resolveEnding } from '../src/game/story/endingResolver.ts';
import type { StoryFlagValue } from '../src/shared/types/content.ts';
import type { DialogueView } from '../src/shared/types/dialogue.ts';

const ECHO_SUPPORT_FLAGS = [
  'clue.captains_log',
  'clue.crew_names',
  'clue.insurance_policy',
  'story.heard_recording',
  'story.housekeeper_testimony',
  'story.arthur_confessed',
] as const;

/** 隐藏结局要求的七项状态；拒签本身由 B10 真实选项写入。 */
const ECHO_FLAGS: Record<string, StoryFlagValue> = {
  'clue.captains_log': true,
  'clue.crew_names': true,
  'clue.insurance_policy': true,
  'story.heard_recording': true,
  'story.housekeeper_testimony': true,
  'story.arthur_confessed': true,
};

const REFUSAL_STRONG_FLAGS: Record<string, StoryFlagValue> = {
  'clue.shipping_ledger': true,
  'clue.insurance_policy': true,
};

const EXPECTED_ECHO_PARAGRAPHS = [
  '23 点 55 分，门厅。',
  '走廊尽头的书房门没有关严。刚才在书房播放过的留声机还没有停，铜喇叭里传来蜡筒空转的沙沙声。',
  '门厅长桌上摊着遗嘱。你把签好一半的名字划掉，把遗嘱推到桌子中间，然后将船长马丁·肖的日志、保险赔付单，以及钟座暗格里那张折皱的纸一并摊在桌面上。',
  '赶在落地钟敲响之前，你拿起那张纸，对着门厅里的三个人，替伊芙琳把上面的名字一个一个念了出来：',
  '「托马斯·布伦南，大副。休·麦凯，轮机长。乔纳森·里德，二等水手。塞缪尔·克罗斯，舱面学徒，十六岁。」',
  '亚瑟站在桌边，没有动，也没有阻止。',
  '「……她说得对。」他低声说，「那天晚上在书房，她也是这么念给我听的。」',
  '霍尔太太在门口哭。格雷医生摘下眼镜，说他明天会重写死亡证明。',
  '门厅的落地钟在这时敲响。一下，两下……一直到第十三下。没有人惊讶。',
  '天亮时，你把材料交给灰港海事孤儿院的代表。那是个瘦高的女人，她看着名单上最后一个名字——塞缪尔·克罗斯，轻声说她还记得那个孩子。她读完最后一页，问你想要什么。',
  '你说：「把他们的名字刻上去。」',
  '第二块纪念石立在寡妇崖上的时候，伊芙琳的名字旁边多了四个名字：珀耳塞福涅号的船员，1896 年 3 月 14 日。',
];

interface B10Fixture {
  system: DialogueSystem;
  flags: Record<string, StoryFlagValue>;
}

type RefusalPath = 'strong' | 'quiet';

function createB10Fixture(
  initialFlags: Readonly<Record<string, StoryFlagValue>>,
): B10Fixture {
  const flags: Record<string, StoryFlagValue> = {
    'story.midnight': true,
    ...initialFlags,
  };
  const host: DialogueHost = {
    getFlags: () => flags,
    getActiveTaskId: () => 'step_midnight',
    setFlag: (key, value) => {
      flags[key] = value;
    },
    discoverClue: () => {},
    recordChoice: () => {},
    onChange: () => {},
  };
  return {
    flags,
    system: new DialogueSystem({
      dialogues: content.dialogues,
      npcNames: new Map(content.npcs.map((npc) => [npc.id, npc.name])),
      host,
    }),
  };
}

function beginB10(
  initialFlags: Readonly<Record<string, StoryFlagValue>>,
): B10Fixture {
  const fixture = createB10Fixture(initialFlags);
  assert.equal(
    fixture.system.openForNpc('npc_arthur', 'NPC_arthur_signing_table'),
    true,
  );
  return fixture;
}

function showChoices(system: DialogueSystem): DialogueView {
  let view = system.view();
  assert.ok(view);
  let advances = 0;
  while (view.canContinue) {
    assert.ok(advances < 20, 'B10 对话台词推进疑似未终止');
    system.advance();
    advances += 1;
    view = system.view();
    assert.ok(view);
  }
  return view;
}

function completeB10Sign(
  initialFlags: Readonly<Record<string, StoryFlagValue>>,
): Record<string, StoryFlagValue> {
  const { system, flags } = beginB10(initialFlags);
  assert.equal(showChoices(system).nodeId, 'npc_arthur_midnight_01');
  assert.equal(system.choose('sign'), true);
  assert.equal(flags['choice.midnight'], 'sign');
  return flags;
}

function completeB10Refusal(
  initialFlags: Readonly<Record<string, StoryFlagValue>>,
  path: RefusalPath,
): Record<string, StoryFlagValue> {
  const { system, flags } = beginB10(initialFlags);
  assert.equal(showChoices(system).nodeId, 'npc_arthur_midnight_01');
  assert.equal(system.choose('refuse'), true);

  const refusalChoices = showChoices(system).choices.map((choice) => choice.id);
  if (path === 'strong') {
    assert.ok(refusalChoices.includes('present_evidence'));
  } else {
    assert.ok(refusalChoices.includes('refuse_quietly'));
  }
  assert.equal(
    system.choose(path === 'strong' ? 'present_evidence' : 'refuse_quietly'),
    true,
  );

  const finalChoices = showChoices(system);
  assert.ok(finalChoices.choices.some((choice) => choice.id === 'end'));
  assert.equal(system.choose('end'), true);
  assert.equal(flags['choice.midnight'], 'refuse');
  return flags;
}

function roundTripFlags(
  flags: Readonly<Record<string, StoryFlagValue>>,
): Record<string, StoryFlagValue> {
  const parsed: unknown = JSON.parse(JSON.stringify(flags));
  assert.ok(parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed));
  const restored: Record<string, StoryFlagValue> = {};
  for (const [key, value] of Object.entries(parsed)) {
    assert.ok(
      typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean',
    );
    restored[key] = value;
  }
  return restored;
}

test('B10 首次进入播放午夜开场，而不是直接跳过台词', () => {
  const { system } = beginB10({});
  const opening = system.view();
  assert.ok(opening);
  assert.equal(opening.nodeId, 'npc_arthur_midnight_01');
  assert.equal(opening.line?.text, '到点了。笔在这儿。');
  assert.equal(opening.canContinue, true);
});

test('结局以固定优先级注册：echo > refused > signed', () => {
  assert.equal(content.endings.length, 3);
  assert.deepEqual(
    content.endings.map((ending) => ending.id),
    ['ending_echo', 'ending_refused', 'ending_signed'],
  );
  const echo = content.endings.find((ending) => ending.id === 'ending_echo');
  assert.ok(echo);
  assert.deepEqual(echo.conditions, [
    { flag: 'choice.midnight', equals: 'refuse' },
    { flag: 'clue.captains_log' },
    { flag: 'clue.crew_names' },
    { flag: 'clue.insurance_policy' },
    { flag: 'story.heard_recording' },
    { flag: 'story.housekeeper_testimony' },
    { flag: 'story.arthur_confessed' },
  ]);
});

test('B10 签字路径进入 ending_signed，并在序列化后保持一致', () => {
  const flags = roundTripFlags(
    completeB10Sign({ 'clue.medical_record': true }),
  );
  const ending = resolveEnding(flags, endings);
  assert.ok(ending);
  assert.equal(ending.id, 'ending_signed');
  const view = presentEnding(ending.id, flags);
  assert.equal(view?.subtitle, '你继承了体面。');
  assert.equal(
    view?.paragraphs.at(-1),
    '你把那些纸留在了书房。它们会一直在那儿。',
  );
});

test('B10 安静拒签进入 ending_refused weak，并在序列化后保持一致', () => {
  const flags = roundTripFlags(completeB10Refusal({}, 'quiet'));
  const ending = resolveEnding(flags, endings);
  assert.ok(ending);
  assert.equal(ending.id, 'ending_refused');
  const view = presentEnding(ending.id, flags);
  assert.equal(view?.subtitle, '你拒绝了，但没有人听见。');
});

test('B10 出示账本与赔付单进入 ending_refused strong', () => {
  const flags = completeB10Refusal(REFUSAL_STRONG_FLAGS, 'strong');
  const ending = resolveEnding(flags, endings);
  assert.ok(ending);
  assert.equal(ending.id, 'ending_refused');
  assert.equal(flags['story.evidence_presented'], true);
  assert.equal(
    presentEnding(ending.id, flags)?.subtitle,
    '你得到了真话。',
  );
});

test('证据齐全但安静拒签仍保持 ending_refused weak', () => {
  const flags = completeB10Refusal(REFUSAL_STRONG_FLAGS, 'quiet');
  assert.equal(flags['story.evidence_presented'], undefined);
  const ending = resolveEnding(flags, endings);
  assert.ok(ending);
  assert.equal(ending.id, 'ending_refused');
  assert.equal(
    presentEnding(ending.id, flags)?.subtitle,
    '你拒绝了，但没有人听见。',
  );
});

test('B10 拒签且七项条件齐全时优先进入 ending_echo', () => {
  const flags = roundTripFlags(completeB10Refusal(ECHO_FLAGS, 'quiet'));
  const ending = resolveEnding(flags, endings);
  assert.equal(ending?.id, 'ending_echo');

  assert.ok(ending);
  const view = presentEnding(ending.id, flags);
  assert.ok(view);
  assert.equal(view.title, '让她说话');
  assert.equal(view.subtitle, '你让她说完了。');
  assert.deepEqual(view.paragraphs, EXPECTED_ECHO_PARAGRAPHS);
  const namedCrewParagraph = view.paragraphs[4] ?? '';
  assert.ok(namedCrewParagraph.includes('托马斯·布伦南'));
  assert.ok(namedCrewParagraph.includes('塞缪尔·克罗斯'));
});

test('B10 拒签时缺少任一隐藏结局条件都会回落到 ending_refused', () => {
  for (const missingFlag of ECHO_SUPPORT_FLAGS) {
    const incompleteFlags: Record<string, StoryFlagValue> = {
      ...ECHO_FLAGS,
      [missingFlag]: false,
    };
    const flags = completeB10Refusal(incompleteFlags, 'quiet');
    assert.equal(
      resolveEnding(flags, endings)?.id,
      'ending_refused',
      `缺少 ${missingFlag} 时不应进入 ending_echo`,
    );
  }
});

test('七项条件齐全但 B10 选择签署时仍进入 ending_signed', () => {
  const flags = completeB10Sign(ECHO_FLAGS);
  assert.equal(resolveEnding(flags, endings)?.id, 'ending_signed');
});
