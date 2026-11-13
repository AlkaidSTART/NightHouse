import type { DialogueNode } from '../../shared/types/content';
import { clue, flag } from './effects.ts';

/**
 * 霍尔太太。节点与分支依据故事线 §5.3。
 * 她的信息边界：只谈她亲眼看见的搬运、烧纸、旧信和小姐的日常；
 * 不主动说出亚瑟与伊芙琳争执的细节。
 *
 * 每个情节节拍各有一个入口枢纽（B1/B2/B3/B5/B9/B10）。话题节点只挂
 * 当前节拍的 `taskIds`，避免玩家在抵达时直接问出夜间证词，或在
 * 午夜重复调查阶段的旧话题。
 */
export const housekeeperDialogues: readonly DialogueNode[] = [
  // ── B1 抵达 ──
  {
    id: 'npc_housekeeper_intro',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.arrived' }],
    taskIds: ['step_housekeeper'],
    lines: [
      { speaker: 'npc', text: '您到了。外套给我吧，{honorific}。' },
      { speaker: 'npc', text: '房间已经收拾好了。晚餐在餐厅。' },
      { speaker: 'npc', text: '午夜之前，请别上楼。' },
    ],
    reenterLines: [
      { speaker: 'npc', text: '……还有什么需要我做的吗，{honorific}？' },
    ],
    choices: [
      {
        id: 'warm',
        text: '谢谢你，霍尔太太。',
        next: 'npc_housekeeper_warm',
        taskIds: ['step_housekeeper'],
        effects: [
          flag('story.met_housekeeper'),
          flag('story.housekeeper_warm'),
        ],
      },
      {
        id: 'cold',
        text: '我自己来。',
        next: 'npc_housekeeper_cold',
        taskIds: ['step_housekeeper'],
        effects: [
          flag('story.met_housekeeper'),
          flag('story.housekeeper_cold'),
        ],
      },
      {
        id: 'ask_evelyn',
        text: '伊芙琳……她是个什么样的人？',
        next: 'npc_housekeeper_evelyn_01',
        taskIds: ['step_housekeeper'],
        effects: [flag('story.met_housekeeper')],
      },
      {
        id: 'show_letter',
        text: '这封信，是您寄的？',
        next: 'npc_housekeeper_letter_b1',
        conditions: [{ flag: 'story.has_letter' }],
        taskIds: ['step_housekeeper'],
        effects: [flag('story.met_housekeeper')],
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
    id: 'npc_housekeeper_warm',
    npcId: 'npc_housekeeper',
    taskIds: ['step_housekeeper'],
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
        taskIds: ['step_housekeeper'],
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
    taskIds: ['step_housekeeper'],
    lines: [{ speaker: 'npc', text: '随您。晚餐在餐厅。' }],
    choices: [
      {
        id: 'warm_up',
        text: '抱歉，我路上有些累。',
        next: 'npc_housekeeper_warm',
        taskIds: ['step_housekeeper'],
        effects: [flag('story.housekeeper_warm')],
      },
      {
        id: 'leave',
        text: '我先去客厅。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_housekeeper_evelyn_01',
    npcId: 'npc_housekeeper',
    taskIds: ['step_housekeeper'],
    lines: [{ speaker: 'npc', text: '小姐待下人很好。她教我认字。' }],
    choices: [
      {
        id: 'back',
        text: '我明白了。',
        next: 'npc_housekeeper_intro',
      },
    ],
  },
  {
    id: 'npc_housekeeper_letter_b1',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.has_letter' }],
    taskIds: ['step_housekeeper'],
    lines: [
      {
        speaker: 'narration',
        text: '你把那封盖着「无法投递」印戳的信递给她。',
      },
      {
        speaker: 'npc',
        text: '……是我寄的。信退回宅子，压在老爷的文书里，我整理东西时翻出来的。',
      },
      {
        speaker: 'npc',
        text: '信封里那张『请务必来』的便条，也是我放的。我不知道还能找谁。',
      },
      { speaker: 'npc', text: '小姐写这封信的时候，一直在等您的回信。' },
      {
        speaker: 'npc',
        text: '您先见过少爷吧。有些话，得等他不在场我才能说。',
      },
    ],
    choices: [
      {
        id: 'ask_evelyn',
        text: '她写这封信时，是什么样子？',
        next: 'npc_housekeeper_evelyn_01',
        effects: [
          flag('story.housekeeper_warm'),
          flag('story.letter_shown'),
        ],
      },
      {
        id: 'leave',
        text: '我会去见亚瑟。',
        next: null,
        effects: [
          flag('story.housekeeper_warm'),
          flag('story.letter_shown'),
        ],
      },
    ],
  },

  // ── B2 初见亚瑟期间：她仍守在门厅 ──
  {
    id: 'npc_housekeeper_wait_01',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.met_housekeeper' }],
    taskIds: ['step_arthur'],
    lines: [
      { speaker: 'npc', text: '少爷在客厅壁炉边等您。需要什么就叫我。' },
    ],
    choices: [
      {
        id: 'leave',
        text: '好。',
        next: null,
      },
    ],
  },

  // ── B3 晚宴 ──
  {
    id: 'npc_housekeeper_dinner_01',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.met_housekeeper' }],
    taskIds: ['step_doctor'],
    lines: [
      { speaker: 'npc', text: '少爷在长桌尽头等您。汤快凉了。' },
    ],
    choices: [
      {
        id: 'leave',
        text: '我去餐厅。',
        next: null,
      },
    ],
  },

  // ── B5 自由调查 ──
  {
    id: 'npc_housekeeper_b5_01',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.met_housekeeper' }],
    taskIds: ['step_coverup', 'step_evidence'],
    lines: [{ speaker: 'npc', text: '您还有什么要问的吗？' }],
    reenterLines: [{ speaker: 'npc', text: '您还有什么要问的吗？' }],
    choices: [
      {
        id: 'ask_evelyn',
        text: '伊芙琳的事，你还记得什么？',
        next: 'npc_housekeeper_evelyn_b5',
        effects: [flag('story.housekeeper_warm')],
      },
      {
        id: 'show_letter',
        text: '这封信，是你寄的？',
        next: 'npc_housekeeper_letter_01',
        conditions: [{ flag: 'story.has_letter' }],
      },
      {
        id: 'ask_burned_pages',
        text: '书房壁炉里的纸，是你烧的吗？',
        next: 'npc_housekeeper_study_01',
        conditions: [{ flag: 'clue.burned_pages' }],
      },
      {
        id: 'ask_study_cleanup',
        text: '书房里有人清理过，对吗？',
        next: 'npc_housekeeper_study_01',
        conditions: [{ flag: 'clue.shipping_ledger' }],
      },
      {
        id: 'ask_cloak',
        text: '衣帽架最里侧那件斗篷，为什么是湿的？',
        next: 'npc_housekeeper_cloak_01',
        conditions: [{ flag: 'clue.arthur_cloak' }],
      },
      {
        id: 'ask_thirteenth',
        text: '为什么现在还摆着第十三副餐具？',
        next: 'npc_housekeeper_dinner_seat_01',
        conditions: [{ flag: 'clue.dinner_seating' }],
      },
      {
        id: 'ask_letters',
        text: '抽屉里那些信，她都让你收着？',
        next: 'npc_housekeeper_letters_01',
        conditions: [{ flag: 'clue.evelyn_old_letters' }],
      },
      {
        id: 'leave',
        text: '我先去别处看看。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_housekeeper_evelyn_b5',
    npcId: 'npc_housekeeper',
    taskIds: ['step_coverup', 'step_evidence'],
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
        next: 'npc_housekeeper_b5_01',
      },
    ],
  },
  {
    id: 'npc_housekeeper_cloak_01',
    npcId: 'npc_housekeeper',
    taskIds: ['step_coverup', 'step_medical_truth', 'step_recording', 'step_corroborate', 'step_evidence'],
    lines: [
      {
        speaker: 'npc',
        text: '忌日前一晚，少爷披着它出去过。回来时，袖口上都是崖边的草籽。',
      },
      {
        speaker: 'npc',
        text: '他没说去了哪儿。我也没问。那件斗篷我本来想收起来，可他没让。',
      },
      { speaker: 'npc', text: '您别在他面前提。他这一晚已经很难熬了。' },
    ],
    choices: [
      {
        id: 'back',
        text: '我不是想让他难熬。',
        next: 'npc_housekeeper_b5_01',
      },
      {
        id: 'leave',
        text: '我知道了。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_housekeeper_dinner_seat_01',
    npcId: 'npc_housekeeper',
    taskIds: ['step_coverup', 'step_medical_truth', 'step_recording', 'step_corroborate', 'step_evidence'],
    lines: [
      {
        speaker: 'npc',
        text: '少爷让留的。她说小姐没见到人，位置就不能撤。',
      },
      {
        speaker: 'npc',
        text: '披肩是她自己缝的边。我每天摆餐具时都要摸一下，确认还在。',
      },
      { speaker: 'npc', text: '这屋子里总得有人记得她坐哪儿。' },
    ],
    choices: [
      {
        id: 'back',
        text: '谢谢你一直记得。',
        next: 'npc_housekeeper_b5_01',
        effects: [flag('story.housekeeper_confided')],
      },
      {
        id: 'leave',
        text: '我会把这件事记住。',
        next: null,
        effects: [flag('story.housekeeper_confided')],
      },
    ],
  },
  {
    id: 'npc_housekeeper_letters_01',
    npcId: 'npc_housekeeper',
    taskIds: ['step_coverup', 'step_medical_truth', 'step_recording', 'step_corroborate', 'step_evidence'],
    lines: [
      {
        speaker: 'npc',
        text: '小姐每次写完信，都会问我：邮差今天会不会来。',
      },
      {
        speaker: 'npc',
        text: '后来她就不问了。信写好，放在抽屉里，过几天自己再看一遍。',
      },
      { speaker: 'npc', text: '最后那封没写完。她写到一半，把笔放下了。' },
    ],
    choices: [
      {
        id: 'back',
        text: '她一直在等回信。',
        next: 'npc_housekeeper_b5_01',
        effects: [flag('story.housekeeper_guilt')],
      },
      {
        id: 'leave',
        text: '我欠她一封回信。',
        next: null,
        effects: [flag('story.housekeeper_guilt')],
      },
    ],
  },
  {
    id: 'npc_housekeeper_letter_01',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.has_letter' }],
    taskIds: ['step_coverup', 'step_evidence'],
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
    taskIds: ['step_coverup', 'step_evidence'],
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
        next: 'npc_housekeeper_b5_01',
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
    id: 'npc_housekeeper_night_01',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.housekeeper_warm' }],
    taskIds: ['step_coverup', 'step_evidence'],
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
    taskIds: ['step_coverup', 'step_evidence'],
    lines: [
      { speaker: 'npc', text: '我站在楼梯口。灯是亮的。' },
      {
        speaker: 'npc',
        text: '后来……少爷和医生抬着什么东西下来。用床单裹着。',
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
    taskIds: ['step_coverup', 'step_evidence'],
    lines: [
      {
        speaker: 'npc',
        text: '他们给了我一份工钱，和一句话：『老爷身体不好，别让他知道。』',
      },
      {
        speaker: 'npc',
        text: '我拿了钱。这一年，我每天都在想这件事。',
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
    taskIds: ['step_coverup', 'step_evidence'],
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
    taskIds: ['step_coverup', 'step_evidence'],
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
        next: 'npc_housekeeper_evelyn_b5',
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
    taskIds: ['step_coverup', 'step_evidence'],
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
        next: 'npc_housekeeper_b5_01',
      },
    ],
  },
  {
    id: 'npc_housekeeper_study_02',
    npcId: 'npc_housekeeper',
    taskIds: ['step_coverup', 'step_evidence'],
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

  // ── B9 对质 ──
  {
    id: 'npc_housekeeper_b9_wait_01',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.met_housekeeper' }],
    taskIds: ['step_confront'],
    lines: [
      { speaker: 'npc', text: '我什么都不知道。少爷在书房。' },
    ],
    choices: [
      {
        id: 'leave',
        text: '我去找他。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_housekeeper_confront_01',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.knows_coverup' }],
    taskIds: ['step_confront'],
    lines: [{ speaker: 'npc', text: '您要我在午夜说出来吗？' }],
    choices: [
      {
        id: 'need_testimony',
        text: '我需要有人证明那晚发生了什么。',
        next: 'npc_housekeeper_will_testify',
        conditions: [{ flag: 'story.housekeeper_warm' }],
      },
      {
        id: 'warn_cost',
        text: '说出来，你可能就留不下了。',
        next: 'npc_housekeeper_hesitate',
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
    taskIds: ['step_confront'],
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
    taskIds: ['step_confront'],
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

  // ── B10 午夜 ──
  {
    id: 'npc_housekeeper_midnight_01',
    npcId: 'npc_housekeeper',
    taskIds: ['step_midnight'],
    lines: [
      { speaker: 'npc', text: '午夜了，{honorific}。' },
      { speaker: 'npc', text: '我就在门边。需要的时候，我在。' },
    ],
    choices: [
      {
        id: 'leave',
        text: '谢谢你，霍尔太太。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_housekeeper_midnight_testified',
    npcId: 'npc_housekeeper',
    conditions: [{ flag: 'story.housekeeper_testimony' }],
    taskIds: ['step_midnight'],
    lines: [
      { speaker: 'npc', text: '我答应过小姐。天一亮，我就去说。' },
      { speaker: 'npc', text: '您做您的决定。我不催您。' },
    ],
    choices: [
      {
        id: 'leave',
        text: '谢谢你，霍尔太太。',
        next: null,
      },
    ],
  },
];
