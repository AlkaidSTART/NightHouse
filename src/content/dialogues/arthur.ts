import type { DialogueNode } from '../../shared/types/content';
import { clue, flag } from './effects.ts';

/**
 * 亚瑟·阿什克罗夫特。节点与分支依据故事线 §1.6（晚宴）、§5.2（常规）、
 * B9 对质与 B10 午夜节点。所有状态变更只挂在选项上。
 */
export const arthurDialogues: readonly DialogueNode[] = [
  {
    id: 'npc_arthur_intro',
    npcId: 'npc_arthur',
    conditions: [{ flag: 'story.arrived' }],
    lines: [
      { speaker: 'npc', text: '你来了。路上不好走吧——桥断了。' },
      {
        speaker: 'npc',
        text: '坐吧。父亲的事，我很抱歉。但总得有人把这件事做完。',
      },
    ],
    choices: [
      {
        id: 'ask_evelyn',
        text: '伊芙琳的事，我想听你说。',
        next: 'npc_arthur_evelyn_01',
        effects: [flag('story.met_arthur')],
      },
      {
        id: 'ask_will',
        text: '午夜签的，到底是什么文件？',
        next: 'npc_arthur_will_01',
        effects: [flag('story.met_arthur')],
      },
      {
        id: 'ask_house',
        text: '这栋房子……一直是这样吗？',
        next: 'npc_arthur_house_01',
        effects: [flag('story.met_arthur')],
      },
      {
        id: 'ask_ledger',
        text: '书房里的账本，我看了。',
        next: 'npc_arthur_business_01',
        conditions: [{ flag: 'clue.shipping_ledger' }],
        effects: [flag('story.met_arthur')],
      },
      {
        id: 'leave',
        text: '我先四处看看。',
        next: null,
        effects: [flag('story.met_arthur')],
      },
    ],
  },
  {
    id: 'npc_arthur_evelyn_01',
    npcId: 'npc_arthur',
    lines: [
      { speaker: 'npc', text: '她一直睡不好。医生说是神经衰弱。' },
      { speaker: 'npc', text: '那天晚上她喝了酒，一个人去了崖边。' },
      { speaker: 'npc', text: '我们找了她一整夜。潮水……你知道的。' },
    ],
    choices: [
      {
        id: 'ask_why_cliff',
        text: '她为什么半夜去崖边？',
        next: 'npc_arthur_evelyn_02',
      },
      {
        id: 'show_photo',
        text: '全家福上，她被人剪掉了。',
        next: 'npc_arthur_photo_01',
        conditions: [{ flag: 'clue.family_photo' }],
      },
      {
        id: 'accept',
        text: '我知道了。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_arthur_evelyn_02',
    npcId: 'npc_arthur',
    lines: [
      { speaker: 'npc', text: '我不知道。也许她只是想一个人待着。' },
      {
        speaker: 'narration',
        text: '他抬手看怀表。袖口滑下去，左腕内侧露出一道浅白色的陈年抓痕。',
      },
      { speaker: 'narration', text: '他说话时看着壁炉，而不是你。' },
    ],
    choices: [
      {
        id: 'ask_study',
        text: '那晚你在这儿？',
        next: 'npc_arthur_evelyn_03',
      },
      {
        id: 'back',
        text: '算了。',
        next: 'npc_arthur_evelyn_01',
      },
    ],
  },
  {
    id: 'npc_arthur_evelyn_03',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'npc',
        text: '……我在这儿。她走后，我在这儿坐到天亮。',
      },
    ],
    choices: [
      {
        id: 'back',
        text: '我明白了。',
        next: 'npc_arthur_intro',
        effects: [flag('story.arthur_admits_study')],
      },
      {
        id: 'leave',
        text: '我先走了。',
        next: null,
        effects: [flag('story.arthur_admits_study')],
      },
    ],
  },
  {
    id: 'npc_arthur_photo_01',
    npcId: 'npc_arthur',
    conditions: [{ flag: 'clue.family_photo' }],
    lines: [{ speaker: 'npc', text: '是母亲剪的。她说看着难受。' }],
    choices: [
      {
        id: 'press',
        text: '剪掉一个人，和哀悼不一样。',
        next: 'npc_arthur_photo_02',
      },
      {
        id: 'back',
        text: '也许吧。',
        next: 'npc_arthur_evelyn_01',
      },
    ],
  },
  {
    id: 'npc_arthur_photo_02',
    npcId: 'npc_arthur',
    lines: [{ speaker: 'npc', text: '你说话很像她。' }],
    choices: [
      {
        id: 'back',
        text: '我不觉得。',
        next: 'npc_arthur_intro',
        effects: [flag('story.arthur_notices_resemblance')],
      },
      {
        id: 'leave',
        text: '我先走了。',
        next: null,
        effects: [flag('story.arthur_notices_resemblance')],
      },
    ],
  },
  {
    id: 'npc_arthur_will_01',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'npc',
        text: '父亲把宅子和股份留给我，一部分现款留给你。',
      },
      {
        speaker: 'npc',
        text: '其余捐给海事孤儿院——如果没人签字，全部归孤儿院。',
      },
    ],
    choices: [
      {
        id: 'ask_orphanage',
        text: '为什么是孤儿院？',
        next: 'npc_arthur_will_02',
      },
      {
        id: 'ask_midnight',
        text: '为什么一定要在午夜？',
        next: 'npc_arthur_will_03',
      },
      {
        id: 'back',
        text: '我明白了。',
        next: 'npc_arthur_intro',
      },
    ],
  },
  {
    id: 'npc_arthur_will_02',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'npc',
        text: '父亲的良心。他晚年总说，海上的账，迟早要还。',
      },
    ],
    choices: [
      {
        id: 'back',
        text: '……',
        next: 'npc_arthur_will_01',
      },
      {
        id: 'leave',
        text: '我去看看别处。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_arthur_will_03',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'npc',
        text: '律师明早来取。父亲定的时间——他说午夜之前，家里人必须到齐。',
      },
    ],
    choices: [
      {
        id: 'back',
        text: '到齐。',
        next: 'npc_arthur_will_01',
      },
      {
        id: 'leave',
        text: '我去看看别处。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_arthur_house_01',
    npcId: 'npc_arthur',
    lines: [
      { speaker: 'npc', text: '这房子比我年纪还大。它有自己的脾气。' },
      {
        speaker: 'npc',
        text: '壁炉上那行字是父亲刻的：守住你拥有的。他觉得这是家训。',
      },
      { speaker: 'npc', text: '如果半夜听见什么，别当回事。' },
    ],
    choices: [
      {
        id: 'back',
        text: '我会记住。',
        next: 'npc_arthur_intro',
      },
      {
        id: 'leave',
        text: '我先四处看看。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_arthur_business_01',
    npcId: 'npc_arthur',
    conditions: [{ flag: 'clue.shipping_ledger' }],
    lines: [
      { speaker: 'npc', text: '账本？你翻了我的书房。' },
      {
        speaker: 'npc',
        text: '航运不好做。父亲那一代把能抵押的都抵押了。',
      },
    ],
    choices: [
      {
        id: 'press',
        text: '1896 年那笔赔款呢？',
        next: 'npc_arthur_business_02',
      },
      {
        id: 'back',
        text: '门没锁。',
        next: 'npc_arthur_intro',
      },
    ],
  },
  {
    id: 'npc_arthur_business_02',
    npcId: 'npc_arthur',
    lines: [{ speaker: 'npc', text: '……那是风暴。报纸上写着。' }],
    choices: [
      {
        id: 'back',
        text: '报纸也会写错。',
        next: 'npc_arthur_intro',
        effects: [flag('story.arthur_deflects_shipwreck')],
      },
      {
        id: 'leave',
        text: '我去看看别处。',
        next: null,
        effects: [flag('story.arthur_deflects_shipwreck')],
      },
    ],
  },

  // ── B3 晚宴残席（三人同场） ──
  {
    id: 'npc_arthur_dinner_01',
    npcId: 'npc_arthur',
    conditions: [{ flag: 'story.met_arthur' }],
    lines: [
      {
        speaker: 'npc',
        text: '汤已经凉了，我让霍尔太太不必再热。坐吧，或者随便看看。',
      },
      {
        speaker: 'npc',
        text: '【格雷医生】我们在聊这栋房子的老规矩。',
      },
    ],
    choices: [
      {
        id: 'ask_seat',
        text: '为什么多摆了一副餐具？',
        next: 'npc_arthur_dinner_seat',
      },
      {
        id: 'ask_evelyn',
        text: '伊芙琳那晚是什么状态？',
        next: 'npc_arthur_dinner_evelyn',
      },
      {
        id: 'look_will',
        text: '桌上这份遗嘱，我能看吗？',
        next: 'npc_arthur_dinner_will',
      },
      {
        id: 'watch',
        text: '先不说话，看看他们。',
        next: 'npc_arthur_dinner_watch',
      },
      {
        id: 'leave',
        text: '我出去走走。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_arthur_dinner_seat',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'npc',
        text: '父亲还在的时候定下的规矩。只要没见到人，她的位置就留着。撤掉反而奇怪。',
      },
      {
        speaker: 'npc',
        text: '【格雷医生】活人总得靠点仪式感才能睡得着。对吧，亚瑟？',
      },
      {
        speaker: 'narration',
        text: '霍尔太太低头把第十三副餐具歪掉的餐刀摆正，没有接话。',
      },
    ],
    choices: [
      {
        id: 'back',
        text: '回到餐桌上的话题。',
        next: 'npc_arthur_dinner_01',
        effects: [clue('clue_dinner_seating'), flag('story.thirteen_places')],
      },
    ],
  },
  {
    id: 'npc_arthur_dinner_evelyn',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'npc',
        text: '她那阵子把账本看得太重，整宿整宿不睡，看谁都像欠了她的债。',
      },
      {
        speaker: 'npc',
        text: '【格雷医生】从医学上讲是神经衰弱。不过……她出事那天下午跟我聊过几句，脑子倒是比我们谁都清楚。',
      },
      { speaker: 'npc', text: '格雷大夫，您的酒杯空了。' },
    ],
    choices: [
      {
        id: 'back',
        text: '回到餐桌上的话题。',
        next: 'npc_arthur_dinner_01',
      },
    ],
  },
  {
    id: 'npc_arthur_dinner_will',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'npc',
        text: '父亲把话写得很死。午夜之前你不签字，阿什克罗夫特这个姓氏在灰港就彻底完了。',
      },
      { speaker: 'npc', text: '【格雷医生】签了，对活着的人都好。' },
      {
        speaker: 'npc',
        text: '【霍尔太太】少爷，汤已经撤了，别在饭桌上谈公事，老爷以前不喜欢的。',
      },
    ],
    choices: [
      {
        id: 'back',
        text: '我把文件放回去。',
        next: 'npc_arthur_dinner_01',
        effects: [clue('clue_will_clause'), flag('story.will_read')],
      },
    ],
  },
  {
    id: 'npc_arthur_dinner_watch',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'narration',
        text: '亚瑟看着右手边的空椅子，手指在桌布边缘轻轻敲击。',
      },
      { speaker: 'narration', text: '格雷仰头喝干了最后一口酒。' },
      {
        speaker: 'narration',
        text: '霍尔太太把伊芙琳椅背上的灰羊毛披肩往上提了提，免得拖到地上。',
      },
      { speaker: 'npc', text: '午夜之前，我们还有时间。' },
    ],
    choices: [
      {
        id: 'leave',
        text: '我离开餐厅。',
        next: null,
      },
    ],
  },

  // ── B9 对质 ──
  {
    id: 'npc_arthur_confront_01',
    npcId: 'npc_arthur',
    lines: [{ speaker: 'npc', text: '你把所有人叫到这儿，是想干什么？' }],
    choices: [
      {
        id: 'show_log',
        text: '钟座里有一本船长日志。',
        next: 'npc_arthur_confront_log',
        conditions: [{ flag: 'clue.captains_log' }],
      },
      {
        id: 'show_policy',
        text: '这是你父亲签的赔付单。',
        next: 'npc_arthur_confront_policy',
        conditions: [{ flag: 'clue.insurance_policy' }],
      },
      {
        id: 'play_recording',
        text: '她留了一段话。你要听吗？',
        next: 'npc_arthur_confront_recording',
        conditions: [{ flag: 'story.heard_recording' }],
      },
      {
        id: 'accuse',
        text: '是你杀了她。',
        next: 'npc_arthur_confront_accuse',
      },
      {
        id: 'ask_father',
        text: '是不是父亲下的令？',
        next: 'npc_arthur_confront_father_01',
      },
      {
        id: 'mercy',
        text: '我不是来审判你的。',
        next: 'npc_arthur_confront_mercy',
      },
      {
        id: 'leave',
        text: '现在还不是时候。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_arthur_confront_log',
    npcId: 'npc_arthur',
    lines: [
      { speaker: 'npc', text: '……你从钟里拿到的。' },
      { speaker: 'npc', text: '她真的把什么都留下了。' },
    ],
    choices: [
      {
        id: 'press',
        text: '她留下的是你做过的事。',
        next: 'npc_arthur_confront_break',
        effects: [flag('story.arthur_cornered')],
      },
      {
        id: 'back',
        text: '你还有什么要说？',
        next: 'npc_arthur_confront_01',
        effects: [flag('story.arthur_cornered')],
      },
    ],
  },
  {
    id: 'npc_arthur_confront_policy',
    npcId: 'npc_arthur',
    lines: [
      { speaker: 'npc', text: '父亲签的字。不是我。' },
      { speaker: 'npc', text: '但钱是我花的。' },
    ],
    choices: [
      {
        id: 'press',
        text: '所以你知道那笔钱是怎么来的。',
        next: 'npc_arthur_confront_break',
      },
      {
        id: 'back',
        text: '你还有什么要说？',
        next: 'npc_arthur_confront_01',
      },
    ],
  },
  {
    id: 'npc_arthur_confront_recording',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'narration',
        text: '伊芙琳的声音在书房里响起来。亚瑟没有动，直到录音结束。',
      },
      { speaker: 'npc', text: '关掉它。' },
      { speaker: 'npc', text: '求你。' },
    ],
    choices: [
      {
        id: 'press',
        text: '她说的那四个人，你记得吗？',
        next: 'npc_arthur_confront_break',
        effects: [flag('story.arthur_broken')],
      },
      {
        id: 'back',
        text: '你还有什么要说？',
        next: 'npc_arthur_confront_01',
        effects: [flag('story.arthur_broken')],
      },
    ],
  },
  {
    id: 'npc_arthur_confront_accuse',
    npcId: 'npc_arthur',
    lines: [
      { speaker: 'npc', text: '我没有杀她。' },
      { speaker: 'npc', text: '……我只是没有救她。' },
    ],
    choices: [
      {
        id: 'press',
        text: '把手伸出来。',
        next: 'npc_arthur_confront_break',
        effects: [flag('story.knows_coverup')],
      },
      {
        id: 'back',
        text: '你还有什么要说？',
        next: 'npc_arthur_confront_01',
        effects: [flag('story.knows_coverup')],
      },
    ],
  },
  {
    id: 'npc_arthur_confront_father_01',
    npcId: 'npc_arthur',
    lines: [
      { speaker: 'npc', text: '你以为是他下的令？' },
      { speaker: 'npc', text: '他猜到了。他没有下令。他只是不再问。' },
    ],
    choices: [
      {
        id: 'press',
        text: '所以你替他做了。',
        next: 'npc_arthur_confront_break',
        effects: [flag('story.arthur_father_suspected')],
      },
      {
        id: 'back',
        text: '你还有什么要说？',
        next: 'npc_arthur_confront_01',
        effects: [flag('story.arthur_father_suspected')],
      },
    ],
  },
  {
    id: 'npc_arthur_confront_mercy',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'npc',
        text: '她说……『爸爸会恨我的』。她说她不想毁了这个家。',
      },
      {
        speaker: 'npc',
        text: '然后我们吵起来。我抓住她的手腕——她往后退——',
      },
      {
        speaker: 'narration',
        text: '他挽起左袖。手腕内侧的抓痕从手背滑向掌心。',
      },
      { speaker: 'npc', text: '她倒下去的时候抓了我一把，我没拉住。' },
    ],
    choices: [
      {
        id: 'press',
        text: '然后你叫了格雷。',
        next: 'npc_arthur_confront_break',
        effects: [flag('story.knows_full_truth')],
      },
      {
        id: 'back',
        text: '你还有什么要说？',
        next: 'npc_arthur_confront_01',
        effects: [flag('story.knows_full_truth')],
      },
    ],
  },
  {
    id: 'npc_arthur_confront_break',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'npc',
        text: '她撞到了壁炉。我扶她起来的时候，她已经不说话了。',
      },
      { speaker: 'npc', text: '我叫了格雷。他说没救了。' },
      {
        speaker: 'npc',
        text: '我们把她抬到崖边。我以为……我以为这样对所有人都好。',
      },
      { speaker: 'npc', text: '……23 点 55 分了。去门厅吧，文件在桌上。' },
    ],
    choices: [
      {
        id: 'go_hall',
        text: '我会去门厅。',
        next: null,
        effects: [
          flag('story.arthur_confessed'),
          flag('story.knows_full_truth'),
          flag('story.knows_coverup'),
          flag('story.midnight'),
        ],
      },
    ],
  },

  // ── B10 午夜 ──
  {
    id: 'npc_arthur_midnight_01',
    npcId: 'npc_arthur',
    conditions: [{ flag: 'story.midnight' }],
    lines: [
      { speaker: 'npc', text: '到点了。笔在这儿。' },
      { speaker: 'npc', text: '签吧。然后我们都去睡一觉。' },
    ],
    choices: [
      {
        id: 'sign',
        text: '我签。',
        next: null,
        effects: [flag('choice.midnight', 'sign')],
      },
      {
        id: 'refuse',
        text: '我不签。',
        next: 'npc_arthur_refuse_01',
        effects: [flag('choice.midnight', 'refuse')],
      },
      {
        id: 'ask_evelyn',
        text: '伊芙琳会怎么选？',
        next: 'npc_arthur_midnight_02',
      },
    ],
  },
  {
    id: 'npc_arthur_midnight_02',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'npc',
        text: '她不会签。但她也不会想让这个家散了。',
      },
    ],
    choices: [
      {
        id: 'back',
        text: '把笔给我。',
        next: 'npc_arthur_midnight_01',
      },
    ],
  },
  {
    id: 'npc_arthur_refuse_01',
    npcId: 'npc_arthur',
    lines: [
      {
        speaker: 'narration',
        text: '亚瑟看着你，没有去碰那支笔。',
      },
    ],
    choices: [
      {
        id: 'present_evidence',
        text: '我把账本和赔付单放在桌上。',
        next: 'npc_arthur_refuse_strong',
        conditions: [
          { flag: 'clue.shipping_ledger' },
          { flag: 'clue.insurance_policy' },
        ],
      },
      {
        id: 'refuse_quietly',
        text: '我什么也不签。',
        next: 'npc_arthur_refuse_weak',
      },
    ],
  },
  {
    id: 'npc_arthur_refuse_strong',
    npcId: 'npc_arthur',
    lines: [
      { speaker: 'npc', text: '你证明不了任何事。这里只有我们四个人。' },
      { speaker: 'npc', text: '……但律师明早会看到这些。' },
    ],
    choices: [
      {
        id: 'end',
        text: '那就让律师看。',
        next: null,
      },
    ],
  },
  {
    id: 'npc_arthur_refuse_weak',
    npcId: 'npc_arthur',
    lines: [
      { speaker: 'npc', text: '可以。遗嘱会按父亲的意愿处理。' },
      { speaker: 'npc', text: '您明早搭第一班马车走。' },
    ],
    choices: [
      {
        id: 'end',
        text: '我会走。',
        next: null,
      },
    ],
  },
];
