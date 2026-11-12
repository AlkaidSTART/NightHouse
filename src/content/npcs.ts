import type { NpcDefinition } from '../shared/types/content';

/**
 * NPC 定义。人物身份、性格与情报边界依据
 * docs/午夜别墅_故事线文档_v0.7.md §5 与 docs/午夜别墅_世界观设定_v0.7.md §6。
 *
 * `knownClueIds` 只表示这个角色可以谈论或交出的信息，
 * 不代表玩家已经知道；实际解锁仍由对话条件控制。
 */
export const npcs: readonly NpcDefinition[] = [
  {
    id: 'npc_arthur',
    name: '亚瑟·阿什克罗夫特',
    role: '长子 · 现任家主',
    personality: ['克制', '回避主语', '长期失眠', '越接近真相句子越短'],
    publicGoal: '在午夜前完成遗产签署，保住阿什克罗夫特家族在灰港的体面。',
    hiddenMotive:
      '那晚与伊芙琳争执时她撞上壁炉。他叫来格雷，随后一起把尸体抬到崖边，并让霍尔太太闭嘴。',
    knownClueIds: [
      'clue_family_photo',
      'clue_will_clause',
      'clue_shipping_ledger',
      'clue_insurance_policy',
      'clue_dinner_seating',
    ],
    dialogueEntryId: 'npc_arthur_intro',
  },
  {
    id: 'npc_housekeeper',
    name: '霍尔太太',
    role: '管家 · 在宅中服务三十年',
    personality: ['寡言', '敬语', '省略主语', '习惯站在门边'],
    publicGoal: '把宅子维持成什么都没发生过的样子，直到遗产手续结束。',
    hiddenMotive:
      '她收下了封口钱，也把伊芙琳的警告信压了一年才转寄。她欠小姐一句真话。',
    knownClueIds: [
      'clue_hall_testimony',
      'clue_burned_pages',
      'clue_evelyn_old_letters',
      'clue_dinner_seating',
    ],
    dialogueEntryId: 'npc_housekeeper_intro',
  },
  {
    id: 'npc_doctor',
    name: '埃利亚斯·格雷医生',
    role: '家庭医生 · 服务家族二十年',
    personality: ['温和', '疲惫', '用医学术语转移话题', '防御性反问'],
    publicGoal: '以见证人身份完成遗产手续，同时确认亚瑟还能撑过今晚。',
    hiddenMotive:
      '他在书房看见伊芙琳躺在地上，却只在死亡证明上签了字，并参与了移尸。',
    knownClueIds: ['clue_medical_record', 'clue_bathroom_trace'],
    dialogueEntryId: 'npc_doctor_intro',
  },
];
