import type {
  EndingDefinition,
  StoryFlagValue,
} from '../shared/types/content';
import type { EndingView } from '../shared/types/ending';

/**
 * 结局判定与演出文本。
 *
 * 判定路由依据 docs/午夜别墅_故事线文档_v0.7.md §7；
 * 演出文本逐字来自 docs/午夜别墅_结局_继承体面_v0.1.md、
 * docs/午夜别墅_结局_拒绝签字_v0.1.md 与
 * docs/午夜别墅_结局_让她说话_v0.1.md。
 *
 * `EndingDefinition.conditions` 语义是「全部满足」；数组顺序即优先级。
 */
export const endings: readonly EndingDefinition[] = [
  {
    id: 'ending_echo',
    title: '让她说话',
    conditions: [
      { flag: 'choice.midnight', equals: 'refuse' },
      { flag: 'clue.captains_log' },
      { flag: 'clue.crew_names' },
      { flag: 'clue.insurance_policy' },
      { flag: 'story.heard_recording' },
      { flag: 'story.housekeeper_testimony' },
      { flag: 'story.arthur_confessed' },
    ],
  },
  {
    id: 'ending_refused',
    title: '拒绝签字',
    conditions: [{ flag: 'choice.midnight', equals: 'refuse' }],
  },
  {
    id: 'ending_signed',
    title: '继承体面',
    conditions: [{ flag: 'choice.midnight', equals: 'sign' }],
  },
];

const ECHO_SCRIPT: EndingView = {
  id: 'ending_echo',
  title: '让她说话',
  subtitle: '你让她说完了。',
  paragraphs: [
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
  ],
};

const SIGNED_SCRIPT: EndingView = {
  id: 'ending_signed',
  title: '继承体面',
  subtitle: '你继承了体面。',
  paragraphs: [
    '你在文件末尾签下「艾略特·维恩」。',
    '亚瑟把纸收走，折好，放进内袋。「父亲会满意的。」',
    '大厅的钟敲了。一下，两下……你没有数。到第十三下的时候，没有人抬头。',
    '霍尔太太站在门边，看了你很久，然后低下头。',
    '你拿到一笔钱，一栋你从不住的空房子，和一个每年十一月都要回来签字的理由。',
    '天亮时雨停了。马车在桥那头等你。你回头看了一眼那栋房子。',
    '纪念石上，伊芙琳的名字被海风吹得发白。',
  ],
};

const SIGNED_EVIDENCE_PARAGRAPH =
  '你把那些纸留在了书房。它们会一直在那儿。';

const REFUSED_STRONG_SCRIPT: EndingView = {
  id: 'ending_refused',
  title: '拒绝签字',
  subtitle: '你得到了真话。',
  paragraphs: [
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
  ],
};

const REFUSED_WEAK_SCRIPT: EndingView = {
  id: 'ending_refused',
  title: '拒绝签字',
  subtitle: '你拒绝了，但没有人听见。',
  paragraphs: [
    '你把笔放下。',
    '亚瑟看了你一会儿，然后笑了。不是嘲讽，是疲惫。',
    '「可以。」他说，「遗嘱会按父亲的意愿处理。您明早搭第一班马车走。」',
    '你走出门厅的时候，钟敲了十二下。不是十三下。',
    '你什么也没能证明。雨还在下。桥要到中午才通。',
    '一年后，你在外地的报纸上看到阿什克罗夫特家的消息：生意恢复了，宅子重新粉刷过。',
    '没有人再提伊芙琳。',
  ],
};

const EVIDENCE_FLAGS = [
  'clue.medical_record',
  'clue.bathroom_trace',
  'clue.shipping_ledger',
  'clue.insurance_policy',
  'clue.captains_log',
] as const;

function isTrue(flags: Readonly<Record<string, StoryFlagValue>>, key: string): boolean {
  return flags[key] === true;
}

/**
 * 拒签结局按手头书证分强/弱两个演出变体，但仍算同一个结局 ID。
 * 只有玩家在午夜真的把证据摆上桌，才播放「有人听见」的强变体；
 * 否则安静拒签不应自动获得当众摊牌的旁白。
 */
export function isStrongRefusal(
  flags: Readonly<Record<string, StoryFlagValue>>,
): boolean {
  return (
    isTrue(flags, 'story.evidence_presented') &&
    isTrue(flags, 'clue.shipping_ledger') &&
    isTrue(flags, 'clue.insurance_policy')
  );
}

export function hasAnyEvidence(
  flags: Readonly<Record<string, StoryFlagValue>>,
): boolean {
  return EVIDENCE_FLAGS.some((key) => isTrue(flags, key));
}

/**
 * 根据结局 ID 与当前剧情标记生成演出视图。
 * 未知 ID 返回 null，调用方应保持沉默而不是弹出空结局。
 */
export function presentEnding(
  endingId: string,
  flags: Readonly<Record<string, StoryFlagValue>>,
): EndingView | null {
  if (endingId === 'ending_echo') {
    return ECHO_SCRIPT;
  }
  if (endingId === 'ending_signed') {
    return hasAnyEvidence(flags)
      ? {
          ...SIGNED_SCRIPT,
          paragraphs: [...SIGNED_SCRIPT.paragraphs, SIGNED_EVIDENCE_PARAGRAPH],
        }
      : SIGNED_SCRIPT;
  }
  if (endingId === 'ending_refused') {
    return isStrongRefusal(flags)
      ? REFUSED_STRONG_SCRIPT
      : REFUSED_WEAK_SCRIPT;
  }
  return null;
}
