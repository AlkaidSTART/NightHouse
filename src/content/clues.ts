import type { ClueDefinition } from '../shared/types/content';

/**
 * 线索定义。内容与位置依据 docs/午夜别墅_故事线文档_v0.7.md §3.1–§3.3。
 *
 * 线索 ID 统一为 `clue_<短名>`；发现线索时同时写入
 * `discoveredClueIds` 和 `clue.<短名>` 标记，二者通过 `clueFlagForId` 保持同源。
 */
export function clueFlagForId(clueId: string): string {
  return `clue.${clueId.startsWith('clue_') ? clueId.slice(5) : clueId}`;
}

export const clues: readonly ClueDefinition[] = [
  {
    id: 'clue_evelyn_letter',
    title: '伊芙琳的信',
    description:
      '伊芙琳在 1896 年 11 月 12 日写给艾略特的信：如果大厅的钟敲了十三下，就别签任何东西。信被退回宅邸，一年后才由霍尔太太转寄。',
    locationId: 'player',
    priority: 'main',
    relatedNpcIds: ['npc_housekeeper'],
    storyFlags: ['story.has_letter'],
  },
  {
    id: 'clue_evelyn_old_letters',
    title: '伊芙琳多年来的旧信',
    description:
      '十年间伊芙琳写给艾略特的四封旧信。从 1884 年寄居夏天，到 1894 年母亲葬礼，再到 1896 年 11 月未写完的便笺。最后一封始终没有回音。',
    locationId: 'villa_evelyn_room',
    priority: 'supporting',
    relatedNpcIds: ['npc_housekeeper'],
    storyFlags: ['story.read_old_letters'],
  },
  {
    id: 'clue_tide_table',
    title: '灰港潮汐表',
    description:
      '1897 年的印刷潮汐表。11 月 13 日一行被铅笔圈出，旁边写着「满潮 00:00」。页角是伊芙琳的字：「他们总在潮水最高的时候做事。」',
    locationId: 'villa_study',
    priority: 'main',
    storyFlags: ['story.knows_high_tide'],
  },
  {
    id: 'clue_shipping_ledger',
    title: '航运账本',
    description:
      '1893–1897 年的家族航运账。连续赤字后，1896 年 4 月的一笔「北方联合保险」赔款刚好覆盖全部欠款，旁注「珀耳塞福涅号，全额」。',
    locationId: 'villa_study',
    priority: 'main',
    storyFlags: ['story.knows_insurance_fraud'],
  },
  {
    id: 'clue_insurance_policy',
    title: '保险赔付单',
    description:
      '保单副本：投保金额是船价的四倍，受益人是埃德蒙·阿什克罗夫特。赔付确认日期为 1896 年 4 月 2 日，签字人正是埃德蒙。',
    locationId: 'villa_study',
    priority: 'main',
    storyFlags: ['story.knows_insurance_fraud'],
  },
  {
    id: 'clue_captains_log',
    title: '船长日志',
    description:
      '船长马丁·肖的日志。最后三页写明货舱进水是人为的，老板要他们换小船走；四名船员没能上来。结尾写着：「不是风暴。是我们自己。」',
    locationId: 'villa_hall',
    priority: 'main',
    storyFlags: ['story.knows_shipwreck'],
  },
  {
    id: 'clue_crew_names',
    title: '四名船员的名字',
    description:
      '伊芙琳手写的四行名字与身份：布伦南、麦凯、里德、克罗斯。下面一行小字：「请把他们的名字念出来。」',
    locationId: 'villa_hall',
    priority: 'main',
    storyFlags: ['story.knows_crew_names'],
  },
  {
    id: 'clue_ship_painting',
    title: '帆船油画题字',
    description:
      '「珀耳塞福涅号」油画背面用褪色墨水写着：PERSEPHONE — MDCCCXCVI · III · XIV。日期是保险箱密码的来源。',
    locationId: 'villa_parlor',
    priority: 'main',
    storyFlags: ['story.knows_ship_date_roman'],
  },
  {
    id: 'clue_medical_record',
    title: '家庭诊疗记录',
    description:
      '格雷医生留下的诊疗副本：1896 年 11 月 13 日 23:40 出诊，伊芙琳已无生命体征，后枕部有约两指宽的挫伤。备注：亚瑟要求不要惊动夫人。',
    locationId: 'villa_study',
    priority: 'main',
    relatedNpcIds: ['npc_doctor'],
    storyFlags: ['story.knows_time_conflict'],
  },
  {
    id: 'clue_bathroom_trace',
    title: '浴室里的痕迹',
    description:
      '药柜里剩余大半的镇静剂、毛巾折痕处的暗褐色渍，以及地砖缝里被反复擦过的暗痕。她受伤后在这栋宅子里被处理过。',
    locationId: 'villa_bathroom',
    priority: 'main',
    relatedNpcIds: ['npc_doctor'],
    storyFlags: ['story.knows_injury_at_home'],
  },
  {
    id: 'clue_gramophone_cylinder',
    title: '留声机蜡筒',
    description:
      '伊芙琳卧室梳妆台抽屉里的木盒，盒盖写着「E. — 别放」。蜡筒录着她对沉船、父亲、亚瑟和艾略特说的话。',
    locationId: 'villa_evelyn_room',
    priority: 'main',
    storyFlags: ['story.heard_recording'],
  },
  {
    id: 'clue_hall_testimony',
    title: '霍尔太太的证词',
    description:
      '霍尔太太看见亚瑟和格雷用床单裹着一个人下楼，抬向西侧露台。她没敢看脸，但碰到了手：「是暖的。」',
    locationId: 'villa_hall',
    priority: 'main',
    relatedNpcIds: ['npc_housekeeper'],
    storyFlags: ['story.knows_coverup'],
  },
  {
    id: 'clue_will_clause',
    title: '遗嘱的孤儿院条款',
    description:
      '遗嘱末尾的手写补充：若至 1897 年 11 月 13 日午夜仍无合法继承人到场签署，阿什克罗夫特宅及全部航运股份捐赠予灰港海事孤儿院。',
    locationId: 'villa_dining',
    priority: 'main',
    storyFlags: ['story.will_read'],
  },
  {
    id: 'clue_clock_key',
    title: '落地钟上弦钥匙',
    description: '一把黄铜小钥匙，柄上刻着钟面图案。可以打开门厅落地钟的钟门。',
    locationId: 'villa_study',
    priority: 'supporting',
    storyFlags: ['item.clock_key'],
  },
  {
    id: 'clue_pendulum',
    title: '落地钟摆锤',
    description:
      '铜摆锤，用旧羊毛外套裹着藏在伊芙琳卧室衣柜里。外套口袋有张纸条：「它太吵了。」',
    locationId: 'villa_evelyn_room',
    priority: 'supporting',
    storyFlags: ['item.pendulum'],
  },
  {
    id: 'clue_burned_pages',
    title: '烧焦的账页',
    description:
      '壁炉灰烬里的半张账页，能辨认「保险」「珀耳塞福涅」「四月」。炉前地毯比周围新，石沿有被刮洗过的暗痕。',
    locationId: 'villa_study',
    priority: 'supporting',
    relatedNpcIds: ['npc_housekeeper'],
    storyFlags: ['story.knows_cleanup'],
  },
  {
    id: 'clue_evelyn_luggage',
    title: '未带走的行李箱',
    description:
      '行李箱里没有衣物，只有一叠文件副本和写给保险商的信稿。旁边旧物箱里有一把带相纸碎屑的裁纸剪。',
    locationId: 'villa_storage',
    priority: 'supporting',
    storyFlags: ['story.evelyn_not_leaving'],
  },
  {
    id: 'clue_newspaper',
    title: '沉船报道剪报',
    description:
      '1896 年 3 月 16 日《灰港纪事》：珀耳塞福涅号遇风暴沉没，四名船员失踪。报道列有布伦南、麦凯、里德、克罗斯。',
    locationId: 'villa_storage',
    priority: 'supporting',
    storyFlags: ['story.knows_official_storm'],
  },
  {
    id: 'clue_family_photo',
    title: '被剪掉的全家福',
    description:
      '客厅全家福中伊芙琳被剪掉，只剩一只手搭在亚瑟肩上。卧室镜框背面藏着被剪下的半张单人像，衬纸上有亚瑟被擦淡的铅笔字。',
    locationId: 'villa_parlor',
    priority: 'supporting',
    relatedNpcIds: ['npc_arthur'],
    storyFlags: ['story.photo_cut'],
  },
  {
    id: 'clue_arthur_scratch',
    title: '亚瑟左腕的抓痕',
    description:
      '亚瑟抬手看怀表时露出的旧抓痕，从手背内侧滑向掌心。它不像自己挠出来的伤口，更像被谁在后退时抓住过。',
    locationId: 'villa_parlor',
    priority: 'supporting',
    relatedNpcIds: ['npc_arthur'],
    storyFlags: ['story.saw_arthur_scratch'],
  },
  {
    id: 'clue_arthur_cloak',
    title: '返潮的旧斗篷',
    description:
      '门厅最里侧的深色旧斗篷绣着 E.A.，下摆却是潮的，沾着寡妇崖边的苦艾草。伊芙琳死后，它仍被人穿过。',
    locationId: 'villa_hall',
    priority: 'supporting',
    relatedNpcIds: ['npc_arthur', 'npc_housekeeper'],
    storyFlags: ['story.knows_wet_cloak'],
  },
  {
    id: 'clue_dinner_seating',
    title: '第十三副餐具',
    description:
      '餐厅长桌摆了十三副银餐具。第十三副没有动过，椅背上搭着伊芙琳的灰羊毛披肩。',
    locationId: 'villa_dining',
    priority: 'supporting',
    relatedNpcIds: ['npc_arthur', 'npc_housekeeper'],
    storyFlags: ['story.thirteen_places'],
  },
  {
    id: 'clue_evelyn_diary',
    title: '伊芙琳的日记',
    description:
      '日记最后几页写满日期和船名，夹着四人名单。最后一页写着「今晚必须说出来」，铅笔补了一行：「守住你拥有的——他们守住的是一具尸体。」',
    locationId: 'villa_evelyn_room',
    priority: 'supporting',
    storyFlags: ['story.knows_evelyn_investigating'],
  },
  {
    id: 'clue_greyharbour',
    title: '灰港',
    description:
      '北海沿岸的小镇，靠渔业与旧码头为生，人口不足两千。阿什克罗夫特宅在镇西的寡妇崖上。',
    locationId: 'scene_gate',
    priority: 'ambient',
  },
  {
    id: 'clue_midnight_villa',
    title: '「午夜别墅」的别称',
    description:
      '当地人把阿什克罗夫特宅叫作「午夜别墅」——据说大厅的落地钟偶尔会在午夜多敲一下。',
    locationId: 'villa_parlor',
    priority: 'ambient',
  },
  {
    id: 'clue_ashcroft_house',
    title: '阿什克罗夫特宅',
    description:
      '三层石砌宅邸，陡坡屋顶、凸窗、铁艺大门，西侧直面断崖。屋内是深色木护墙板、壁灯、满墙书柜和厚地毯；走廊很长，回声明显。',
    locationId: 'villa_corridor',
    priority: 'ambient',
  },
  {
    id: 'clue_ashcroft_shipping',
    title: '三代人的航运账',
    description:
      '阿什克罗夫特家靠北海与波罗的海的货运起家。书架上的航海年鉴与账簿从 1860 年代一直排到 1897 年。',
    locationId: 'villa_study',
    priority: 'ambient',
  },
  {
    id: 'clue_1897_technology',
    title: '1897 年的宅内技术',
    description:
      '宅内以煤气灯为主，门厅与书房装了早期电灯；有一部壁挂电话，线路已经被风扯断。没有汽车，出行靠马车，最近的电报站在三英里外。',
    locationId: 'villa_hall',
    priority: 'ambient',
  },
  {
    id: 'clue_family_motto',
    title: '家族箴言',
    description:
      '壁炉石楣上刻着 TENE QUOD HABES——「守住你拥有的」。埃德蒙把它当家训，笔画里嵌着擦不净的烟灰。',
    locationId: 'villa_parlor',
    priority: 'ambient',
  },
  {
    id: 'clue_widows_cliff',
    title: '寡妇崖与墓园浅滩',
    description:
      '宅邸所在的断崖叫寡妇崖。崖下是暗礁密布的「墓园浅滩」，满潮时崖底的洞穴会被海水完全淹没。',
    locationId: 'villa_cliff',
    priority: 'ambient',
  },
  {
    id: 'clue_maritime_orphanage',
    title: '灰港海事孤儿院',
    description:
      '灰港的海事孤儿院收容遇难海员的子女，是镇上少数专门收容海员遗孤的机构。',
    locationId: 'villa_storage',
    priority: 'ambient',
  },
];

export const CLUE_IDS: ReadonlySet<string> = new Set(
  clues.map((clue) => clue.id),
);

export const CLUE_FLAGS: ReadonlySet<string> = new Set(
  clues.map((clue) => clueFlagForId(clue.id)),
);
