import type { DialogueNode } from '../../shared/types/content';
import { flag } from './effects.ts';

/**
 * 埃利亚斯·格雷医生。节点与分支依据故事线 §5.4 与 §6.4 午夜节点。
 * 他的信息边界：坚持「意外」说法，只在诊疗记录与浴室痕迹同时出现时崩溃。
 */
export const doctorDialogues: readonly DialogueNode[] = [
  {
    id: 'npc_doctor_intro',
    npcId: 'npc_doctor',
    conditions: [{ flag: 'story.met_doctor' }],
    lines: [
      {
        speaker: 'npc',
        text: '晚上好，{honorific}。亚瑟说您路上受了凉。让我看看。',
      },
      { speaker: 'npc', text: '你小时候在这儿住过。那年夏天。' },
    ],
    choices: [
      {
        id: 'polite',
        text: '麻烦您了，格雷医生。',
        next: 'npc_doctor_purpose',
        taskIds: ['step_doctor'],
        effects: [flag('story.doctor_talked')],
      },
      {
        id: 'ask_summer',
        text: '您记得那个夏天？',
        next: 'npc_doctor_summer_01',
        taskIds: ['step_doctor'],
        effects: [flag('story.doctor_talked')],
      },
      {
        id: 'ask_evelyn',
        text: '伊芙琳的事，您在场。',
        next: 'npc_doctor_evelyn_01',
        taskIds: ['step_doctor', 'step_coverup'],
        effects: [flag('story.doctor_talked')],
      },
      {
        id: 'refuse',
        text: '我没事。',
        next: null,
        effects: [flag('story.doctor_talked')],
      },
    ],
  },
  {
    id: 'npc_doctor_summer_01',
    npcId: 'npc_doctor',
    lines: [
      {
        speaker: 'npc',
        text: '那年夏天你在这儿住了两个月。伊芙琳带你去看潮。',
      },
      { speaker: 'npc', text: '她那时候就喜欢一个人往崖边跑。' },
    ],
    choices: [
      {
        id: 'back',
        text: '我明白了。',
        next: 'npc_doctor_intro',
        effects: [flag('story.summer_mentioned')],
      },
      {
        id: 'leave',
        text: '我先去看别处。',
        next: null,
        effects: [flag('story.summer_mentioned')],
      },
    ],
  },
  {
    id: 'npc_doctor_purpose',
    npcId: 'npc_doctor',
    lines: [
      {
        speaker: 'npc',
        text: '不用客气，{honorific}。算是见证吧——也是来看看亚瑟，他这一年睡得不好。',
      },
    ],
    choices: [
      {
        id: 'ask_sleep',
        text: '他为什么睡不着？',
        next: 'npc_doctor_sleep',
      },
      {
        id: 'back',
        text: '我明白了。',
        next: 'npc_doctor_intro',
      },
    ],
  },
  {
    id: 'npc_doctor_sleep',
    npcId: 'npc_doctor',
    lines: [
      { speaker: 'npc', text: '良心和神经是两回事，但从症状上很难分开。' },
      { speaker: 'npc', text: '……我是说，悲伤。' },
    ],
    choices: [
      {
        id: 'back',
        text: '当然。',
        next: 'npc_doctor_intro',
        effects: [flag('story.doctor_slip')],
      },
    ],
  },
  {
    id: 'npc_doctor_evelyn_01',
    npcId: 'npc_doctor',
    lines: [
      { speaker: 'npc', text: '我是医生，不是验尸官。那天太晚了，海上又起了雾。' },
      { speaker: 'npc', text: '坠落、溺水。很常见的意外。' },
    ],
    choices: [
      {
        id: 'ask_time',
        text: '您几点到的？',
        next: 'npc_doctor_time_01',
      },
      {
        id: 'show_record',
        text: '这份诊疗记录，是您写的。',
        next: 'npc_doctor_record_01',
        conditions: [{ flag: 'clue.medical_record' }],
      },
      {
        id: 'ask_towel',
        text: '浴室里的毛巾，怎么解释？',
        next: 'npc_doctor_challenge_01',
        conditions: [
          { flag: 'clue.bathroom_trace' },
          { flag: 'clue.medical_record' },
        ],
      },
      {
        id: 'back',
        text: '那就不打扰了。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_doctor_time_01',
    npcId: 'npc_doctor',
    lines: [{ speaker: 'npc', text: '……午夜前后。具体记不清了。' }],
    choices: [
      {
        id: 'back',
        text: '那正好。',
        next: 'npc_doctor_evelyn_01',
        effects: [flag('story.doctor_time_conflict')],
      },
    ],
  },
  {
    id: 'npc_doctor_record_01',
    npcId: 'npc_doctor',
    conditions: [{ flag: 'clue.medical_record' }],
    lines: [
      { speaker: 'npc', text: '……你从哪儿拿到这个的？' },
      { speaker: 'npc', text: '记录可能有误。那天我很累。' },
    ],
    choices: [
      {
        id: 'press',
        text: '坠海的人，怎么会有后枕挫伤？',
        next: 'npc_doctor_record_02',
      },
      {
        id: 'back',
        text: '也许吧。',
        next: 'npc_doctor_evelyn_01',
      },
    ],
  },
  {
    id: 'npc_doctor_record_02',
    npcId: 'npc_doctor',
    lines: [
      {
        speaker: 'npc',
        text: '你想要我说什么？说我在书房里看见她躺在地上？',
      },
      { speaker: 'npc', text: '……我签了字。我只签了字。' },
    ],
    choices: [
      {
        id: 'back',
        text: '签字也需要看一眼。',
        next: 'npc_doctor_evelyn_01',
        effects: [flag('story.doctor_admits_exam')],
      },
    ],
  },
  {
    id: 'npc_doctor_challenge_01',
    npcId: 'npc_doctor',
    conditions: [
      { flag: 'clue.bathroom_trace' },
      { flag: 'clue.medical_record' },
    ],
    lines: [
      { speaker: 'npc', text: '那些毛巾……是之前的。她常流鼻血。' },
    ],
    choices: [
      {
        id: 'press',
        text: '鼻血不会留下那种痕迹。',
        next: 'npc_doctor_challenge_02',
      },
      {
        id: 'back',
        text: '我再想想。',
        next: 'npc_doctor_evelyn_01',
      },
    ],
  },
  {
    id: 'npc_doctor_challenge_02',
    npcId: 'npc_doctor',
    lines: [
      { speaker: 'npc', text: '你到底想毁掉什么？这个家？还是你自己那份？' },
      { speaker: 'npc', text: '……她撞到了壁炉。我告诉过亚瑟，没救了。' },
    ],
    choices: [
      {
        id: 'end',
        text: '我只想知道真相。',
        next: null,
        effects: [
          flag('story.doctor_confronted'),
          flag('story.knows_coverup'),
          flag('story.doctor_confessed'),
        ],
      },
    ],
  },
  {
    id: 'npc_doctor_midnight_01',
    npcId: 'npc_doctor',
    conditions: [{ flag: 'story.midnight' }],
    lines: [
      { speaker: 'npc', text: '我只是个医生。你们家的事，我不该管。' },
    ],
    choices: [
      {
        id: 'ask_testify',
        text: '请您作证。',
        next: 'npc_doctor_testify',
        conditions: [{ flag: 'story.doctor_confessed' }],
        taskIds: ['step_midnight'],
      },
      {
        id: 'leave',
        text: '我不勉强您。',
        next: null,
      },
      {
        id: 'threaten',
        text: '那我就把诊疗记录交给律师。',
        next: 'npc_doctor_press',
        taskIds: ['step_midnight'],
      },
    ],
  },
  {
    id: 'npc_doctor_testify',
    npcId: 'npc_doctor',
    lines: [
      { speaker: 'npc', text: '……我会重新写一份死亡证明。这是我唯一能做的。' },
    ],
    choices: [
      {
        id: 'end',
        text: '谢谢您。',
        next: null,
        effects: [flag('story.doctor_testimony')],
      },
    ],
  },
  {
    id: 'npc_doctor_press',
    npcId: 'npc_doctor',
    lines: [{ speaker: 'npc', text: '你在威胁我。……好，好。我写。' }],
    choices: [
      {
        id: 'end',
        text: '我希望你写得是真的。',
        next: null,
        effects: [
          flag('story.doctor_testimony'),
          flag('story.doctor_hostile'),
        ],
      },
    ],
  },
];
