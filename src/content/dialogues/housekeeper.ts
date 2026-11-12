import type { DialogueNode } from '../../shared/types/content';
import { clue, flag } from './effects.ts';

/**
 * 霍尔太太。节点与分支依据故事线 §5.3。
 * 她的信息边界：只谈她亲眼看见的搬运、烧纸、旧信和小姐的日常；
 * 不主动说出亚瑟与伊芙琳争执的细节。
 */
export const housekeeperDialogues: readonly DialogueNode[] = [
  {
    id: 'npc_housekeeper_intro',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.arrived' }],
    taskIds: ['step_housekeeper', 'step_coverup', 'step_confront'],
    lines: [
      { speaker: 'npc', text: '您到了。外套给我吧，{honorific}。' },
      { speaker: 'npc', text: '房间已经收拾好了。晚餐在餐厅。' },
    ],
    choices: [
      {
        id: 'warm',
        text: '谢谢你，霍尔太太。',
        next: 'npc_housekeeper_warm',
        taskIds: ['step_housekeeper', 'step_coverup'],
        effects: [
          flag('story.met_housekeeper'),
          flag('story.housekeeper_warm'),
        ],
      },
      {
        id: 'cold',
        text: '我自己来。',
        next: 'npc_housekeeper_cold',
        taskIds: ['step_housekeeper', 'step_coverup'],
        effects: [
          flag('story.met_housekeeper'),
          flag('story.housekeeper_cold'),
        ],
      },
      {
        id: 'ask_evelyn',
        text: '伊芙琳……她以前住在哪间房？',
        next: 'npc_housekeeper_evelyn_01',
        taskIds: ['step_housekeeper', 'step_coverup', 'step_confront'],
        effects: [flag('story.met_housekeeper')],
      },
      {
        id: 'show_letter',
        text: '这封信，是你寄的？',
        next: 'npc_housekeeper_letter_01',
        conditions: [{ flag: 'story.has_letter' }],
        taskIds: ['step_coverup', 'step_confront'],
        effects: [flag('story.met_housekeeper')],
      },
      {
        id: 'ask_burned_pages',
        text: '书房壁炉里的纸，是你烧的吗？',
        next: 'npc_housekeeper_study_01',
        conditions: [{ flag: 'clue.burned_pages' }],
        taskIds: ['step_coverup', 'step_confront'],
        effects: [flag('story.met_housekeeper')],
      },
      {
        id: 'ask_study_cleanup',
        text: '书房里有人清理过，对吗？',
        next: 'npc_housekeeper_study_01',
        conditions: [{ flag: 'clue.shipping_ledger' }],
        taskIds: ['step_coverup', 'step_confront'],
        effects: [flag('story.met_housekeeper')],
      },
      {
        id: 'confront',
        text: '关于那晚，我要一个答案。',
        next: 'npc_housekeeper_confront_01',
        conditions: [{ flag: 'story.knows_coverup' }],
        taskIds: ['step_confront'],
        effects: [
          flag('story.met_housekeeper'),
          flag('story.housekeeper_confided'),
        ],
      },
      {
        id: 'leave',
        text: '我先去客厅。',
        next: null,
        effects: [flag('story.met_housekeeper')],
      },
    ],
  },
  {
    id: 'npc_housekeeper_letter_01',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.has_letter' }],
    lines: [
      {
        speaker: 'narration',
        text: '你把信放在桌上。她看了很久，手在围裙上擦了两下。',
      },
      {
        speaker: 'npc',
        text: '……是我寄的。小姐写好后一直压在老爷的文书里。我想，总得有人知道。',
      },
    ],
    choices: [
      {
        id: 'ask_night',
        text: '那晚发生了什么？',
        next: 'npc_housekeeper_night_01',
        effects: [
          flag('story.housekeeper_warm'),
          flag('story.letter_shown'),
        ],
      },
      {
        id: 'ask_why',
        text: '你为什么现在才寄？',
        next: 'npc_housekeeper_letter_02',
        effects: [
          flag('story.housekeeper_warm'),
          flag('story.letter_shown'),
        ],
      },
      {
        id: 'leave',
        text: '我知道了。',
        next: null,
        effects: [
          flag('story.housekeeper_warm'),
          flag('story.letter_shown'),
        ],
      },
    ],
  },
  {
    id: 'npc_housekeeper_letter_02',
    npcId: 'npc_housekeeper',
    lines: [
      {
        speaker: 'npc',
        text: '小姐说过，如果她出了什么事，就把这封信寄出去。',
      },
      { speaker: 'npc', text: '我拖了一年。我怕。' },
    ],
    choices: [
      {
        id: 'back',
        text: '你没有做错。',
        next: 'npc_housekeeper_intro',
        effects: [flag('story.housekeeper_guilt')],
      },
      {
        id: 'leave',
        text: '我需要时间想一想。',
        next: null,
        effects: [flag('story.housekeeper_guilt')],
      },
    ],
  },
  {
    id: 'npc_housekeeper_warm',
    npcId: 'npc_housekeeper',
    lines: [
      { speaker: 'npc', text: '……不用谢，{honorific}。' },
      { speaker: 'npc', text: '安静，是因为人都走了。' },
      { speaker: 'npc', text: '……您和小姐说话的口气有点像。' },
    ],
    choices: [
      {
        id: 'ask_evelyn',
        text: '她是个什么样的人？',
        next: 'npc_housekeeper_evelyn_01',
      },
      {
        id: 'leave',
        text: '我去看看别处。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_housekeeper_cold',
    npcId: 'npc_housekeeper',
    lines: [{ speaker: 'npc', text: '随您。晚餐在餐厅。' }],
    choices: [
      {
        id: 'warm_up',
        text: '抱歉，我路上有些累。',
        next: 'npc_housekeeper_intro',
        effects: [flag('story.housekeeper_warm')],
      },
      {
        id: 'leave',
        text: '我去餐厅。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_housekeeper_evelyn_01',
    npcId: 'npc_housekeeper',
    lines: [{ speaker: 'npc', text: '小姐待下人很好。她教我认字。' }],
    choices: [
      {
        id: 'ask_night',
        text: '那晚，你看见什么了吗？',
        next: 'npc_housekeeper_night_01',
        conditions: [{ flag: 'story.housekeeper_warm' }],
      },
      {
        id: 'ask_room',
        text: '她的房间还留着吗？',
        next: 'npc_housekeeper_room_01',
        conditions: [{ flag: 'story.housekeeper_warm' }],
      },
      {
        id: 'back',
        text: '我明白了。',
        next: 'npc_housekeeper_intro',
      },
    ],
  },
  {
    id: 'npc_housekeeper_night_01',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.housekeeper_warm' }],
    lines: [
      { speaker: 'npc', text: '我在。我在楼下等门。' },
      {
        speaker: 'npc',
        text: '……我听见书房有声音。两个人的声音。',
      },
    ],
    choices: [
      {
        id: 'press',
        text: '然后呢？',
        next: 'npc_housekeeper_night_02',
        effects: [flag('story.housekeeper_hints')],
      },
      {
        id: 'stop',
        text: '不用说了。',
        next: null,
        effects: [flag('story.housekeeper_hints')],
      },
    ],
  },
  {
    id: 'npc_housekeeper_night_02',
    npcId: 'npc_housekeeper',
    lines: [
      { speaker: 'npc', text: '我站在楼梯口。灯是亮的。' },
      {
        speaker: 'npc',
        text: '后来……先生和医生抬着什么东西下来。用床单裹着。',
      },
    ],
    choices: [
      {
        id: 'ask_why_silent',
        text: '你当时为什么不说？',
        next: 'npc_housekeeper_night_03',
        effects: [flag('story.knows_coverup')],
      },
      {
        id: 'ask_alive',
        text: '那时候，她还活着吗？',
        next: 'npc_housekeeper_night_04',
        effects: [flag('story.knows_coverup')],
      },
      {
        id: 'leave',
        text: '我需要想一想。',
        next: null,
        effects: [flag('story.knows_coverup')],
      },
    ],
  },
  {
    id: 'npc_housekeeper_night_03',
    npcId: 'npc_housekeeper',
    lines: [
      {
        speaker: 'npc',
        text: '他们给了我一份工钱，和一句话：『太太身体不好，别让她知道。』',
      },
      {
        speaker: 'npc',
        text: '我拿了钱。这三十年，我每天都在想这件事。',
      },
    ],
    choices: [
      {
        id: 'back',
        text: '那不是你的错。',
        next: 'npc_housekeeper_night_02',
        effects: [flag('story.housekeeper_guilt')],
      },
      {
        id: 'leave',
        text: '我该走了。',
        next: null,
        effects: [flag('story.housekeeper_guilt')],
      },
    ],
  },
  {
    id: 'npc_housekeeper_night_04',
    npcId: 'npc_housekeeper',
    lines: [
      {
        speaker: 'npc',
        text: '医生说她没气了。我不知道。我没敢看。',
      },
      { speaker: 'npc', text: '但她的手是暖的。' },
    ],
    choices: [
      {
        id: 'back',
        text: '这就够了。',
        next: 'npc_housekeeper_night_02',
        effects: [
          flag('story.knows_coverup'),
          clue('clue_hall_testimony'),
        ],
      },
      {
        id: 'leave',
        text: '谢谢你告诉我。',
        next: null,
        effects: [
          flag('story.knows_coverup'),
          clue('clue_hall_testimony'),
        ],
      },
    ],
  },
  {
    id: 'npc_housekeeper_room_01',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.housekeeper_warm' }],
    lines: [
      {
        speaker: 'npc',
        text: '二楼最里面是她的房间。钥匙在围裙口袋里。',
      },
      {
        speaker: 'narration',
        text: '她把钥匙塞进你手里，低声说：',
      },
      { speaker: 'npc', text: '别让他知道是我给的。' },
      {
        speaker: 'npc',
        text: '……小姐出事那天下午，还去门厅邮箱看过一回。其实她知道邮差早上已经来过了。',
      },
    ],
    choices: [
      {
        id: 'back',
        text: '我不会说。',
        next: 'npc_housekeeper_intro',
        effects: [
          flag('story.evelyn_room_open'),
          flag('story.housekeeper_key'),
        ],
      },
    ],
  },
  {
    id: 'npc_housekeeper_study_01',
    npcId: 'npc_housekeeper',
    lines: [
      {
        speaker: 'npc',
        text: '书房我打扫过。壁炉里的纸……是先生让我烧的。',
      },
      { speaker: 'npc', text: '我留了一角。我说不上为什么。' },
    ],
    choices: [
      {
        id: 'press',
        text: '小姐在查什么？',
        next: 'npc_housekeeper_study_02',
      },
      {
        id: 'back',
        text: '我先不问了。',
        next: 'npc_housekeeper_intro',
      },
    ],
  },
  {
    id: 'npc_housekeeper_study_02',
    npcId: 'npc_housekeeper',
    lines: [
      {
        speaker: 'npc',
        text: '小姐在查船上的事。先生知道。他让我别多嘴。',
      },
    ],
    choices: [
      {
        id: 'end',
        text: '谢谢你。',
        next: null,
        effects: [flag('story.housekeeper_confirms_cleanup')],
      },
    ],
  },
  {
    id: 'npc_housekeeper_confront_01',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.knows_coverup' }],
    lines: [{ speaker: 'npc', text: '您要我在午夜说出来吗？' }],
    choices: [
      {
        id: 'need_testimony',
        text: '我需要有人证明那晚发生了什么。',
        next: 'npc_housekeeper_will_testify',
        conditions: [{ flag: 'story.housekeeper_warm' }],
        taskIds: ['step_confront'],
      },
      {
        id: 'warn_cost',
        text: '说出来，你可能就留不下了。',
        next: 'npc_housekeeper_hesitate',
        taskIds: ['step_confront'],
      },
      {
        id: 'no_need',
        text: '不用。你已经说得够多了。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_housekeeper_will_testify',
    npcId: 'npc_housekeeper',
    lines: [{ speaker: 'npc', text: '……好。我欠小姐一句话。' }],
    choices: [
      {
        id: 'end',
        text: '谢谢你，霍尔太太。',
        next: null,
        effects: [
          flag('story.housekeeper_testimony'),
          clue('clue_hall_testimony'),
        ],
      },
    ],
  },
  {
    id: 'npc_housekeeper_hesitate',
    npcId: 'npc_housekeeper',
    lines: [
      {
        speaker: 'npc',
        text: '说出来，我这份工就没了。这地方是我唯一的家。',
      },
    ],
    choices: [
      {
        id: 'promise',
        text: '我会保证你没事。',
        next: 'npc_housekeeper_will_testify',
        conditions: [{ flag: 'story.housekeeper_warm' }],
      },
      {
        id: 'no_pressure',
        text: '我明白。不用勉强。',
        next: null,
      },
    ],
  },
];
