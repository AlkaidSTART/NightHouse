import type { ItemDefinition } from '../shared/types/content';

/**
 * 随身背包可存放的可交互物品定义。
 *
 * 每个物品对应一个已登记的剧情标记（`storyFlags`），当该标记为 `true` 时即收入背包。
 * 使用状态通过 `usedWhen` 条件推导，不单独在存档增加冗余字段。
 */
export const items: readonly ItemDefinition[] = [
  {
    id: 'item_housekeeper_key',
    title: '伊芙琳卧室钥匙',
    category: '钥匙',
    flag: 'story.housekeeper_key',
    sourceLocationId: 'villa_dining',
    targetLocationId: 'villa_evelyn_room',
    targetLabel: '二楼伊芙琳卧室门',
    description:
      '霍尔太太一直藏在围裙口袋里的黄铜旧钥匙，柄身被摩挲得发亮。她趁亚瑟不在场时把钥匙塞进你手心，叮嘱绝不能让少爷知道是她给的。',
    usage:
      '沿一层门厅主楼梯上二楼，走到走廊最南侧尽头，对准伊芙琳卧室门按 E 即可开锁进入。',
    usedWhen: [
      { flag: 'clue.evelyn_diary' },
      { flag: 'item.pendulum' },
      { flag: 'item.cylinder' },
    ],
  },
  {
    id: 'item_storage_key',
    title: '储物间钥匙串',
    category: '钥匙',
    flag: 'item.storage_key',
    sourceLocationId: 'villa_hall',
    targetLocationId: 'villa_storage',
    targetLabel: '一层走廊储物间门',
    description:
      '从门厅衣帽钩上取下的一串旧钥匙，铜环磨得发亮。其中一把柄上刻着「储物间」，齿口很新，不像常年不用的样子。',
    usage:
      '前往一层走廊北侧中段的储物间门前，对准房门按 E 用钥匙打开储物间。',
    usedWhen: [
      { flag: 'clue.evelyn_luggage' },
      { flag: 'clue.newspaper' },
    ],
  },
  {
    id: 'item_clock_key',
    title: '落地钟上弦钥匙',
    category: '钥匙',
    flag: 'item.clock_key',
    sourceLocationId: 'villa_study',
    targetLocationId: 'villa_hall',
    targetLabel: '一层门厅落地钟',
    description:
      '在书房书桌最下层抽屉里找到的黄铜小钥匙，柄上刻着精致的钟面图案，末端带有方形上弦套口。',
    usage:
      '回到一层门厅，对准西北角的落地钟按 E 打开机关面板，用它开启钟门并为发条上弦。',
    usedWhen: [{ flag: 'story.clock_wound' }],
  },
  {
    id: 'item_pendulum',
    title: '落地钟铜摆锤',
    category: '机关部件',
    flag: 'item.pendulum',
    sourceLocationId: 'villa_evelyn_room',
    targetLocationId: 'villa_hall',
    targetLabel: '一层门厅落地钟',
    description:
      '沉甸甸的黄铜摆锤，原本用旧羊毛外套裹着藏在二楼伊芙琳卧室的衣柜深处，外套口袋里留着一张字条：「它太吵了。」',
    usage:
      '回到一层门厅落地钟前按 E，在打开钟门后将铜摆锤重新挂回摆杆。',
    usedWhen: [{ flag: 'story.clock_pendulum_hung' }],
  },
  {
    id: 'item_cylinder',
    title: '留声机蜡筒',
    category: '关键证物',
    flag: 'item.cylinder',
    sourceLocationId: 'villa_evelyn_room',
    targetLocationId: 'villa_study',
    targetLabel: '一层书房留声机',
    description:
      '二楼伊芙琳卧室梳妆台抽屉木盒里的褐蜡录音筒，盒盖用铅笔写着「E. — 别放」，筒身贴着伊芙琳的手写标签。',
    usage:
      '带回一层书房，对准角落木桌上的留声机按 E 嵌上蜡筒，播放伊芙琳生前录下的话。',
    usedWhen: [{ flag: 'story.heard_recording' }],
  },
  {
    id: 'item_evelyn_letter',
    title: '伊芙琳的退信',
    category: '信件',
    flag: 'story.has_letter',
    sourceLocationId: 'player',
    targetLocationId: 'villa_hall',
    targetLabel: '霍尔太太',
    description:
      '伊芙琳在 1896 年 11 月 12 日写给艾略特的信，信封盖着「无法投递」印戳，里面夹着一张字条：「请务必来」。信中警告：如果大厅的钟敲了十三下，就别签任何东西。',
    usage:
      '与霍尔太太交谈时可向她出示这封信，核实寄信人与信封内便条的来历。',
    usedWhen: [{ flag: 'story.letter_shown' }],
  },
];

export const ITEM_IDS: ReadonlySet<string> = new Set(
  items.map((item) => item.id),
);

const ITEM_BY_FLAG = new Map<string, ItemDefinition>(
  items.map((item) => [item.flag, item]),
);

export function getItemByFlag(flag: string): ItemDefinition | undefined {
  return ITEM_BY_FLAG.get(flag);
}
