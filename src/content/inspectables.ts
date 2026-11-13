import type {
  InspectSection,
  InspectableDefinition,
  StoryEffect,
  StoryFlagValue,
} from '../shared/types/content';

/**
 * 可检视物件的正文。`id` 必须与 `villaGreybox.interactables` 中的交互点 ID 一致。
 * 文本依据 docs/午夜别墅_故事线文档_v0.7.md 与场景建模方案；没有出处的内容只写
 * 材质、磨损和环境细节，不新增剧情事实。
 */

function setFlag(key: string, value: StoryFlagValue = true): StoryEffect {
  return { type: 'set-flag', key, value };
}

function clue(key: string): StoryEffect {
  return { type: 'discover-clue', key };
}

function body(...paragraphs: string[]): InspectSection {
  return { paragraphs };
}

function quote(...paragraphs: string[]): InspectSection {
  return { style: 'quote', paragraphs };
}

function note(...paragraphs: string[]): InspectSection {
  return { style: 'note', paragraphs };
}

export const inspectables: readonly InspectableDefinition[] = [
  // ───────────────────────── 室外 ─────────────────────────

  {
    id: 'INT_prop_gate_plaque',
    title: '铁门铜牌',
    category: '铭牌',
    variants: [
      {
        sections: [
          body(
            '黄铜牌上刻着 ASH CROFT HOUSE，字母的凹槽里积着绿色的铜锈。',
            '海风把门柱上的漆吹得发白，铜牌却被人擦过，边缘留着几道新鲜的指印。',
          ),
          note('门后是一条穿过枯树篱的车道，宅邸的窗在雨里亮着。'),
          note(
            '灰港是北海沿岸的小镇，靠渔业与旧码头为生，人口不足两千。宅邸在镇西的寡妇崖上。',
          ),
        ],
        effects: [clue('clue_greyharbour')],
      },
    ],
  },

  // ───────────────────────── 门厅 ─────────────────────────

  {
    id: 'INT_prop_longcase_clock',
    title: '落地钟',
    category: '钟表',
    variants: [
      {
        when: [{ flag: 'story.clock_repaired' }],
        sections: [
          body(
            '钟门开着，钟摆重新挂回了摆杆。钟面停在十一点五十五分，等着走到午夜。',
            '钟座侧板向内弹开，露出一个狭长的暗格。',
          ),
          {
            heading: '船长日志',
            paragraphs: ['署名「船长马丁·肖（Capt. Martin Shaw）」。最后三页字迹潦草：'],
          },
          quote(
            '3 月 13 日，夜。货舱进水，是人为的。老板要我们换小船走，说潮水会替我们把船收走。',
            '3 月 14 日，凌晨。风变了。小艇放不下去。布伦南、麦凯、里德和那个孤儿院来的孩子克罗斯还在下面。麦凯留在机舱给锅炉泄压，不然整条船都会炸开。',
            '如果有人读到这个——不是风暴。是我们自己。',
          ),
          {
            heading: '四名船员的名字',
            paragraphs: [
              '一张折过很多次的纸，伊芙琳的字迹：托马斯·布伦南，大副，44 岁；休·麦凯，轮机长，51 岁；乔纳森·里德，二等水手，26 岁；塞缪尔·克罗斯，舱面学徒，16 岁。',
            ],
          },
          note('下面一行小字：「请把他们的名字念出来。」'),
        ],
        effects: [
          clue('clue_captains_log'),
          clue('clue_crew_names'),
          setFlag('story.knows_shipwreck'),
          setFlag('story.knows_crew_names'),
        ],
      },
      {
        sections: [
          body(
            '钟面停在十二点差一点的位置，指针上落了薄灰。',
            '钟门锁着。钟摆杆空着，摆锤不在。玻璃内侧有一道细细的划痕，正对着十二点。',
          ),
          note('凑近时，能听见一声很轻的滴答，然后归于寂静。'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_cloak',
    title: '最里侧的旧斗篷',
    category: '衣物',
    variants: [
      {
        when: [{ flag: 'story.arthur_cloak_admitted' }],
        sections: [
          body(
            '斗篷的领口还留着 E.A. 的褪色绣字。亚瑟承认忌日前一晚披着它去过崖边。',
            '下摆的潮气已经快干了，只剩苦艾草和冷雨混在一起的味道。',
          ),
          note('它不是被遗落在这里的。它是被放回来的。'),
        ],
      },
      {
        sections: [
          body(
            '衣帽架最里侧挂着一件深色羊毛斗篷，领口内侧绣着褪色的字母 E.A.。',
            '下摆是潮的，指腹一捻，能闻到海崖边苦艾草的涩味。旁边几件外套都是干的。',
          ),
        ],
        effects: [
          clue('clue_arthur_cloak'),
          setFlag('story.knows_wet_cloak'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_storage_key_ring',
    title: '钥匙串',
    category: '钥匙',
    variants: [
      {
        sections: [
          body(
            '挂钩上挂着一串旧钥匙，铜环已经磨得发亮。',
            '其中一把的柄上刻着储物间，齿口很新，不像常年不用的样子。',
          ),
        ],
        effects: [setFlag('item.storage_key')],
      },
    ],
  },
  {
    id: 'INT_prop_telephone',
    title: '壁挂电话',
    category: '陈设',
    variants: [
      {
        sections: [
          body(
            '听筒拿起来，里面没有拨号音，只有很轻的电流声，像远处的雨。',
            '线被从墙里扯断过，断口用黑胶布草草缠了两圈。',
          ),
          note(
            '宅内以煤气灯为主，门厅与书房装了早期电灯。电话在这一带还算稀罕，最近的电报站在三英里外。',
          ),
        ],
        effects: [clue('clue_1897_technology')],
      },
    ],
  },
  {
    id: 'INT_prop_signing_table',
    title: '签字桌',
    category: '文件',
    variants: [
      {
        sections: [
          body(
            '桌面摊着遗产文件、墨水瓶和一支蘸水笔。',
            '继承人签名那一栏还空着。墨水瓶没有盖，笔尖已经干了。',
          ),
          note('文件的一角压着一枚怀表，表盖是凉的。'),
        ],
      },
    ],
  },

  // ───────────────────────── 客厅 ─────────────────────────

  {
    id: 'INT_prop_family_portrait',
    title: '全家福',
    category: '照片',
    variants: [
      {
        sections: [
          body(
            '壁炉上方的全家福里，阿什克罗夫特一家站得笔直。',
            '照片右侧被剪掉了一块，只剩下伊芙琳的一只手，搭在亚瑟肩上。剪刀口很整齐，不是撕的。',
          ),
        ],
        effects: [clue('clue_family_photo'), setFlag('story.photo_cut')],
      },
    ],
  },
  {
    id: 'INT_prop_motto',
    title: '壁炉刻字',
    category: '刻字',
    variants: [
      {
        sections: [
          quote('TENE QUOD HABES'),
          note('守住你拥有的。'),
          body('刻在石楣上，笔画里嵌着擦不净的烟灰。'),
          note(
            '这是埃德蒙·阿什克罗夫特刻下的家训。他把家族体面看得比真相更重。',
          ),
        ],
        effects: [clue('clue_family_motto')],
      },
    ],
  },
  {
    id: 'INT_prop_mantel_clock',
    title: '壁炉上的小座钟',
    category: '钟表',
    variants: [
      {
        sections: [
          body(
            '小座钟走得很稳，指针指着 23:47。',
            '玻璃罩内侧有一圈干净的布痕，显然常被人拿起来对时。',
          ),
          note(
            '当地人把阿什克罗夫特宅叫作「午夜别墅」——据说大厅的落地钟偶尔会在午夜多敲一下。',
          ),
        ],
        effects: [
          setFlag('story.saw_mantel_clock'),
          clue('clue_midnight_villa'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_ship_painting',
    title: '帆船油画',
    category: '画作',
    variants: [
      {
        sections: [
          body(
            '灰绿色的海面上，一艘三桅帆船正穿过低云。船首下方写着船名：PERSEPHONE。',
            '画框没有贴紧墙，右侧留着一道可以伸手进去的缝。',
          ),
        ],
        effects: [clue('clue_ship_painting')],
      },
    ],
  },
  {
    id: 'INT_prop_ship_painting_back',
    title: '画框背面',
    category: '画作',
    variants: [
      {
        sections: [
          quote(
            'PERSEPHONE — MDCCCXCVI · III · XIV',
            '给伊芙琳，她喜欢这条船。 — E.A.',
          ),
          body('墨迹已经褪成褐色，但罗马数字和那两笔首字母还很清楚。'),
        ],
        effects: [
          clue('clue_ship_painting'),
          setFlag('story.knows_ship_date_roman'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_piano',
    title: '钢琴',
    category: '陈设',
    variants: [
      {
        when: [{ flag: 'story.read_old_letters' }],
        sections: [
          body(
            '你想起来，1888 年那封信里，伊芙琳写道：航运不好以后，家里连钢琴也不让她弹了。',
            '琴盖上这层灰，已经比她离开的时间还厚。',
          ),
          note('中央 C 的键面上仍有一个被擦掉的指印。'),
        ],
      },
      {
        sections: [
          body(
            '琴盖合着，键盖上落了一层薄灰。',
            '只有中央 C 的键面上有一个被擦掉的指印，像是有人按下去，又很快松了手。',
          ),
        ],
      },
    ],
  },

  // ───────────────────────── 一层走廊 ─────────────────────────

  {
    id: 'INT_prop_corridor_mirror',
    title: '走廊镜',
    category: '陈设',
    variants: [
      {
        sections: [
          body(
            '镜面边缘已经发黑，照出来的人比实际慢半拍。',
            '你侧了侧身，镜子里那道影子还停在原处。再看时，走廊里什么也没有。',
          ),
          note(
            '这栋三层石宅有陡坡屋顶、凸窗和铁艺大门，西侧直面断崖。深色木护墙板、壁灯和厚地毯把走廊拉得很长，回声也格外明显。',
          ),
        ],
        effects: [clue('clue_ashcroft_house')],
      },
    ],
  },

  // ───────────────────────── 书房 ─────────────────────────

  {
    id: 'INT_prop_tide_table',
    title: '灰港潮汐表',
    category: '文件',
    variants: [
      {
        sections: [
          body(
            '木框里夹着一张 1897 年的印刷潮汐表。',
            '11 月 13 日一行被铅笔圈了起来，旁边写着「满潮 00:00」。',
          ),
          note('页角有一行更淡的字迹：「他们总在潮水最高的时候做事。」'),
        ],
        effects: [
          clue('clue_tide_table'),
          setFlag('story.knows_high_tide'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_study_desk_drawer',
    title: '书桌抽屉',
    category: '文件',
    variants: [
      {
        when: [
          { flag: 'story.doctor_confessed' },
          { flag: 'story.heard_recording' },
          { flag: 'story.safe_opened' },
        ],
        sections: [
          body(
            '你把诊疗记录、账本、赔付单和蜡筒并排放在书桌上。伊芙琳的录音是她的声音，账目是父亲的字，死亡时间则是格雷写的。',
            '三样东西指向同一件事：她死在宅子里，而屋里所有人都在替那晚找一个更体面的说法。',
          ),
          note('证据已经足够逼亚瑟把话说完。去书房中间的书桌旁等他。'),
        ],
        effects: [setFlag('story.case_ready')],
      },
      {
        when: [
          { flag: 'story.doctor_confessed' },
          { flag: 'story.heard_recording' },
          { flag: 'story.clock_repaired' },
        ],
        sections: [
          body(
            '你把诊疗记录和蜡筒放在书桌上。钟座里的船长日志翻到最后一页，四名船员的名字压在伊芙琳的字迹下面。',
            '第十三下不是幻觉。它和骗保、移尸、沉默一起，被这栋房子留了下来。',
          ),
          note('证据已经足够逼亚瑟把话说完。去书房中间的书桌旁等他。'),
        ],
        effects: [setFlag('story.case_ready')],
      },
      {
        sections: [
          body(
            '最下层抽屉卡了一下才拉开。里面是一串钥匙和一份折起来的诊疗副本。',
            '钥匙串上有一把黄铜小钥匙，柄上刻着钟面图案。',
          ),
          {
            heading: '诊疗副本',
            style: 'quote',
            paragraphs: [
              '1896 年 11 月 13 日，23:40 出诊。患者伊芙琳·阿什克罗夫特，女性，27 岁。',
              '抵达时已无生命体征。后枕部挫伤，约两指宽。瞳孔散大。建议：不移动，通知家属。',
            ],
          },
          note('备注：亚瑟先生要求不要惊动夫人。'),
        ],
        effects: [
          clue('clue_clock_key'),
          setFlag('item.clock_key'),
          clue('clue_medical_record'),
          setFlag('story.knows_time_conflict'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_study_hearth',
    title: '壁炉石沿',
    category: '痕迹',
    variants: [
      {
        sections: [
          body(
            '炉台石沿上有一道被刮洗过的暗痕，指甲刮上去，能刮出一点灰。',
            '炉前的地毯比周围新，边缘压着一圈没洗掉的黑墨水渍。',
          ),
        ],
        effects: [clue('clue_burned_pages'), setFlag('story.knows_cleanup')],
      },
    ],
  },
  {
    id: 'INT_prop_study_ashes',
    title: '壁炉灰烬',
    category: '痕迹',
    variants: [
      {
        sections: [
          body('灰烬里埋着半张没烧完的账页。'),
          quote('……保险……珀耳塞福涅号……四月……'),
          body('剩下的字被火舌卷掉了，纸边一碰就碎。'),
        ],
        effects: [clue('clue_burned_pages'), setFlag('story.knows_cleanup')],
      },
    ],
  },
  {
    id: 'INT_prop_study_rug',
    title: '炉前地毯',
    category: '陈设',
    variants: [
      {
        sections: [
          body(
            '地毯的绒面比周围厚，颜色也新，像是最近才换过。',
            '边缘有一道被反复擦过的黑墨水渍，擦得越用力，颜色越往纤维里渗。',
          ),
        ],
        effects: [clue('clue_burned_pages'), setFlag('story.knows_cleanup')],
      },
    ],
  },
  {
    id: 'INT_prop_safe',
    title: '保险箱',
    category: '陈设',
    variants: [
      {
        when: [{ flag: 'story.safe_opened' }],
        sections: [
          body('箱门开着，里面只剩下一叠用细绳捆好的文件。'),
          {
            heading: '航运账本',
            paragraphs: [
              '1893–1897 年的家族航运账。1893 年起连续赤字；1896 年 4 月的一笔「北方联合保险」赔款刚好覆盖当年全部欠款。',
            ],
          },
          note('赔款条目旁有一行小字：「珀耳塞福涅号，全额。」'),
          {
            heading: '保险赔付单',
            paragraphs: [
              '保单副本。投保金额是船价的四倍；受益人是埃德蒙·阿什克罗夫特。',
              '附带的赔付确认单日期为 1896 年 4 月 2 日，签字人正是埃德蒙。',
            ],
          },
        ],
        effects: [
          clue('clue_shipping_ledger'),
          clue('clue_insurance_policy'),
          setFlag('story.knows_insurance_fraud'),
        ],
      },
      {
        sections: [
          body(
            '一只老式四位数字保险箱嵌在书架旁，箱门冰凉。',
            '转盘上第 3、4 位磨得最亮。你转了转，内部传来干涩的卡响，门纹丝不动。',
          ),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_phonograph',
    title: '留声机',
    category: '陈设',
    variants: [
      {
        when: [{ flag: 'story.heard_recording' }],
        sections: [
          body(
            '唱针停在蜡筒末尾的空白处，铜喇叭里只剩下雨声。',
            '你记得她最后叫了你的名字。不是责备，更像确认你真的回来了。',
          ),
          note('蜡筒还留在转轴上。你没有再放一遍。'),
        ],
      },
      {
        when: [{ flag: 'item.cylinder' }],
        sections: [
          body('你把蜡筒嵌进转轴，放下唱针。铜喇叭里先是一阵沙沙声，然后响起她的声音。'),
          quote(
            '如果有人在听这段——爸爸，亚瑟，或者任何一个还愿意听的人。',
            '珀耳塞福涅号不是沉在风暴里。是我们把它沉下去的。四个人没有上来。',
            '我不要钱。我只要他们的名字被念出来。',
            '……亚瑟，我知道你在听。你答应过我的。',
            '……还有，艾略特。如果你真的收到了那封信，如果你真的回来了——对不起，把你也拉进这滩脏水里。但除了你，这屋里已经没有别人会听我说话了。',
          ),
          body('蜡筒转完最后一圈，唱针在空白处沙沙地空转。'),
        ],
        effects: [
          clue('clue_gramophone_cylinder'),
          setFlag('story.heard_recording'),
        ],
      },
      {
        sections: [
          body(
            '铜喇叭擦得很亮，蜡筒座却空着。唱针悬在半空。',
            '要让它说话，得先找到一只蜡筒。',
          ),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_study_bookshelf',
    title: '书架',
    category: '书籍',
    variants: [
      {
        sections: [
          body(
            '书架上半是按年份排好的航海年鉴，下半是装订成册的账簿。',
            '港务年鉴停在 1897 年，书脊被翻得起了毛。旁边几本账簿的标签是同一种笔迹。',
          ),
          note('最上层夹着一本翻旧的《航海保险条款》，书脊被抽出来过很多次。'),
          note(
            '阿什克罗夫特家靠北海与波罗的海的货运起家。年鉴与账簿从 1860 年代一直排到 1897 年。',
          ),
        ],
        effects: [clue('clue_ashcroft_shipping')],
      },
    ],
  },
  {
    id: 'INT_prop_study_book',
    title: '《航海保险条款》',
    category: '书籍',
    variants: [
      {
        sections: [
          {
            heading: '第四章 · 船舶险',
            paragraphs: [
              '「投保金额不得超过船舶在事故发生时的实际价值。超过部分无效。」',
            ],
          },
          note('这一页的页边被人用铅笔重重画了一道线，旁边写着：「四倍。」'),
          body('再往后翻，是一张空白批注页。纸上有几处压痕，像是曾经夹过什么。'),
        ],
      },
    ],
  },

  // ───────────────────────── 储物间 ─────────────────────────

  {
    id: 'INT_prop_luggage',
    title: '未带走的行李箱',
    category: '行李',
    variants: [
      {
        sections: [
          body(
            '行李箱里没有衣物，只有一叠文件副本和几封写给保险商的信稿。',
            '最上面那封信只写了一半，落款处的墨水洇开，像被人按住过。',
            '箱底的衬布上有一道折痕，形状刚好是一把剪刀。',
          ),
        ],
        effects: [
          clue('clue_evelyn_luggage'),
          setFlag('story.evelyn_not_leaving'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_newspaper_stack',
    title: '旧报纸堆',
    category: '文件',
    variants: [
      {
        sections: [
          {
            heading: '《灰港纪事》1896 年 3 月 16 日',
            style: 'quote',
            paragraphs: ['珀耳塞福涅号遇风暴沉没，四名船员失踪。'],
          },
          body('名单列得很短：布伦南、麦凯、里德、克罗斯。'),
          note('报纸边缘被人用指甲掐出了一道印。'),
        ],
        effects: [
          clue('clue_newspaper'),
          setFlag('story.knows_official_storm'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_old_items_box',
    title: '旧物箱',
    category: '物品',
    variants: [
      {
        sections: [
          body(
            '木箱里塞着旧相框、卷边的明信片和一把裁纸剪。',
            '剪刀刃口内侧卡着几粒相纸碎屑，边缘发白。',
          ),
          note('箱底压着半张被剪坏的照片衬纸。'),
        ],
        effects: [
          clue('clue_evelyn_luggage'),
          setFlag('story.evelyn_not_leaving'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_ship_model',
    title: '船模',
    category: '陈设',
    variants: [
      {
        sections: [
          body(
            '玻璃罩里是一艘三桅船模，桅杆上还系着褪色的线。',
            '船首的名字被人用刀刮掉了，只剩下一个模糊的 P。',
          ),
          note(
            '灰港的海事孤儿院收容遇难海员的子女，是镇上少数专门收容海员遗孤的机构。',
          ),
        ],
        effects: [clue('clue_maritime_orphanage')],
      },
    ],
  },

  // ───────────────────────── 餐厅 ─────────────────────────

  {
    id: 'INT_prop_thirteenth_setting',
    title: '第十三副餐具',
    category: '陈设',
    variants: [
      {
        sections: [
          body(
            '长桌摆着十三副银餐具。前十二副都用过，只有这一副干干净净。',
            '餐巾没有拆封，酒杯倒扣着。椅子被人往外拉开了一点，像刚有人起身。',
          ),
        ],
        effects: [
          clue('clue_dinner_seating'),
          setFlag('story.thirteen_places'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_shawl',
    title: '椅背上的披肩',
    category: '衣物',
    variants: [
      {
        sections: [
          body(
            '一条灰色羊毛披肩搭在椅背上，针脚很细，边角磨得发亮。',
            '凑近能闻到很淡的皂角味，和这栋房子里别的房间不一样。',
          ),
        ],
        effects: [
          clue('clue_dinner_seating'),
          setFlag('story.thirteen_places'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_will_copy',
    title: '遗嘱副本',
    category: '文件',
    variants: [
      {
        sections: [
          {
            heading: '遗嘱补充条款',
            style: 'quote',
            paragraphs: [
              '若至 1897 年 11 月 13 日午夜，仍无合法继承人到场签署，则阿什克罗夫特宅及全部航运股份，捐赠予灰港海事孤儿院。',
            ],
          },
          note('——埃德蒙·阿什克罗夫特，1897 年 1 月'),
          body('正文的其余部分按常规分配财产，字迹工整得像另一个人写的。'),
        ],
        effects: [
          clue('clue_will_clause'),
          setFlag('story.will_read'),
        ],
      },
    ],
  },

  // ───────────────────────── 二层走廊 ─────────────────────────

  {
    id: 'INT_prop_family_photos',
    title: '走廊里的家族照片',
    category: '照片',
    variants: [
      {
        when: [{ flag: 'story.heard_recording' }],
        sections: [
          body(
            '照片里伊芙琳站在最边上，玻璃的裂纹横过她的脸。',
            '刚听完她的声音，这排沉默的银框显得更像另一份死亡证明：每个活着的人都被摆得端正，只有她被人从画面里划掉。',
          ),
        ],
      },
      {
        sections: [
          body(
            '墙上一排银框照片，从曾祖父到亚瑟，每个人都站在同一段楼梯前。',
            '照片里的伊芙琳只有一张，站在最边上。框玻璃上有一道裂纹，正好横过她的脸。',
          ),
        ],
      },
    ],
  },

  // ───────────────────────── 伊芙琳卧室 ─────────────────────────

  {
    id: 'INT_prop_nightstand',
    title: '床头柜',
    category: '物品',
    variants: [
      {
        sections: [
          body(
            '床头柜上放着半瓶镇静水合氯醛和一只干水杯。瓶口的封蜡没拆干净，药水却已经少了一半。',
            '杯子内壁是干的，杯沿没有唇印。',
          ),
          {
            heading: '日记',
            paragraphs: [
              '日记最后几页写满了日期和船名，夹着一张四人名单。',
            ],
          },
          quote('今晚必须说出来。'),
          note('铅笔补了一行：「守住你拥有的——他们守住的是一具尸体。」'),
        ],
        effects: [
          clue('clue_evelyn_diary'),
          setFlag('story.knows_evelyn_investigating'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_wardrobe',
    title: '衣柜',
    category: '陈设',
    variants: [
      {
        sections: [
          body(
            '衣柜里挂着几件深色外套，樟脑味很重。',
            '最里面那件旧羊毛外套沉得反常。掀开下摆，一只铜摆锤被布包着，裹得严严实实。',
          ),
          note('外套口袋里有一张纸条：「它太吵了。」'),
        ],
        effects: [clue('clue_pendulum'), setFlag('item.pendulum')],
      },
    ],
  },
  {
    id: 'INT_prop_vanity_drawer',
    title: '梳妆台抽屉',
    category: '文件',
    variants: [
      {
        sections: [
          body(
            '抽屉里压着一叠旧信，最上面是一只木盒。盒盖用铅笔写着「E. — 别放」。',
            '木盒里铺着绒布，一只蜡筒嵌在凹槽中，筒身贴着手写标签。',
          ),
          {
            heading: '旧信',
            paragraphs: [
              '四封信按年份叠好。最早的一封夹着一片干枯的石楠花，最晚的一封没有写完。',
            ],
          },
        ],
        effects: [
          clue('clue_evelyn_old_letters'),
          setFlag('story.read_old_letters'),
          setFlag('item.cylinder'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_vanity_mirror_back',
    title: '镜框背面',
    category: '照片',
    variants: [
      {
        sections: [
          body(
            '梳妆镜和墙之间留着一道窄缝。伸手进去，摸到一张硬纸板。',
            '背面贴着被剪下的半张单人像，照片里的伊芙琳正看着镜头。',
          ),
          note('衬纸上有一行被擦淡的铅笔字：「别再这么看着我了。」'),
        ],
        effects: [clue('clue_family_photo'), setFlag('story.photo_cut')],
      },
    ],
  },

  // ───────────────────────── 浴室 ─────────────────────────

  {
    id: 'INT_prop_medicine_cabinet',
    title: '药柜',
    category: '物品',
    variants: [
      {
        sections: [
          body(
            '药柜里排着几只棕色药瓶。最里面一瓶标签写着「镇静剂，格雷医生处方，1896.11」。',
            '瓶里还剩大半。旁边的水杯是干的，杯沿没有唇印。',
          ),
        ],
        effects: [
          clue('clue_bathroom_trace'),
          setFlag('story.knows_injury_at_home'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_towel_rack',
    title: '毛巾架',
    category: '物品',
    variants: [
      {
        sections: [
          body(
            '毛巾架最里侧叠着一条旧毛巾。',
            '折痕处有一块暗褐色的渍，已经洗过很多次，仍没褪干净。',
          ),
        ],
        effects: [
          clue('clue_bathroom_trace'),
          setFlag('story.knows_injury_at_home'),
        ],
      },
    ],
  },
  {
    id: 'INT_prop_tile_stain',
    title: '地砖缝',
    category: '痕迹',
    variants: [
      {
        sections: [
          body(
            '浴缸边的地砖缝里有一道暗色痕迹，被反复擦过。',
            '水汽盖不住它。沿着缝往下，砖面还留着几道细小的刮痕。',
          ),
        ],
        effects: [
          clue('clue_bathroom_trace'),
          setFlag('story.knows_injury_at_home'),
        ],
      },
    ],
  },

  // ───────────────────────── 崖边 ─────────────────────────

  {
    id: 'INT_prop_terrace_railing',
    title: '露台栏杆',
    category: '室外',
    variants: [
      {
        sections: [
          body(
            '石栏杆被雨水打得发亮，西侧正对着黑沉沉的海。',
            '栏杆下方有一道新鲜的刮痕，漆皮翻起来，露出浅色的石芯。',
          ),
          note(
            '宅邸所在的断崖叫寡妇崖。崖下是暗礁密布的「墓园浅滩」，满潮时崖底的洞穴会被海水完全淹没。',
          ),
        ],
        effects: [clue('clue_widows_cliff')],
      },
    ],
  },
  {
    id: 'INT_prop_memorial_stone',
    title: '纪念石',
    category: '室外',
    variants: [
      {
        when: [{ flag: 'story.clock_repaired' }],
        sections: [
          body(
            '纪念石上刻着托马斯·布伦南、休·麦凯、乔纳森·里德、塞缪尔·克罗斯。',
            '船长日志里的名字终于和石头上的刻痕对上了。伊芙琳把第十三下留给这四个人，也把自己留在了他们旁边。',
          ),
          note('石面被雨水洗得发亮。远处门厅的钟声已经停了。'),
        ],
      },
      {
        sections: [
          body(
            '崖边立着一块新刻的石碑，碑面被海风吹得发白。',
            '四个名字的凹槽里积着雨水，字口很浅，像刻的人下不了手。',
          ),
        ],
      },
    ],
  },
];

export const INSPECTABLE_IDS: ReadonlySet<string> = new Set(
  inspectables.map((item) => item.id),
);
