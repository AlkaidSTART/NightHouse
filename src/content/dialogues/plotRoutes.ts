import type { StoryCondition } from '../../shared/types/content';

export type DialogueNpcId =
  | 'npc_arthur'
  | 'npc_housekeeper'
  | 'npc_doctor';

/**
 * 一条剧情步骤内的 NPC 对话路由。
 *
 * `allowedChoiceIds` 是该步骤允许展开的话题白名单；`null` 表示不限制。
 * 返回、离开等导航选项由 DialogueSystem 始终保留，因此白名单只负责收窄
 * 当前剧情真正要呈现的追问，不负责堵死对话。
 */
export interface PlotDialogueRoute {
  taskIds: readonly string[];
  npcId: DialogueNpcId;
  nodeId: string;
  /** 同一 NPC 在不同站位需要进入不同场景节点时使用；省略表示默认节点。 */
  spotIds?: readonly string[];
  /** 多个候选路由按顺序匹配，先满足条件者生效。 */
  when?: readonly StoryCondition[];
  skipOpeningWhen?: readonly StoryCondition[];
  allowedChoiceIds?: readonly string[];
}

/** 对话面板上的当前剧情提示；内容与主线任务步骤一一对应。 */
export const DIALOGUE_PLOT_LABEL: Readonly<Record<string, string>> = {
  step_arrive: '进入别墅',
  step_housekeeper: '与霍尔太太交谈，安顿下来',
  step_arthur: '听亚瑟解释伊芙琳的事',
  step_doctor: '向格雷医生追问伊芙琳的死因',
  step_coverup: '问出那晚的搬运经过',
  step_medical_truth: '把两份伤情证据交给格雷医生',
  step_recording: '寻找并播放伊芙琳留下的蜡筒',
  step_corroborate: '再取得一份书证，或修好落地钟',
  step_evidence: '整理证据，准备对质',
  step_confront: '去书房对质亚瑟',
  step_midnight: '在门厅作出午夜抉择',
};

const B5_NON_OPTIONAL_TASKS = [
  'step_coverup',
  'step_medical_truth',
  'step_recording',
  'step_evidence',
] as const;

const B5_ARTHUR_OPTIONAL_CHOICES = [
  'ask_scratch',
  'ask_cloak',
  'ask_recording',
  'ask_ledger',
  'press',
] as const;

const B5_HOUSEKEEPER_OPTIONAL_CHOICES = [
  'show_letter',
  'ask_burned_pages',
  'ask_study_cleanup',
  'ask_cloak',
  'ask_thirteenth',
  'ask_letters',
  'press',
] as const;

const B5_HOUSEKEEPER_MAIN_CHOICES = [
  'ask_evelyn',
  'ask_night',
  'ask_room',
  'press',
  'ask_why_silent',
  'ask_alive',
] as const;

const B5_DOCTOR_MAIN_CHOICES = [
  'ask_evelyn',
  'show_record',
  'ask_towel',
  'press',
] as const;

/**
 * 集中管理「当前剧情步骤应该进入哪段 NPC 对话、显示哪些追问」。
 *
 * 节点与台词仍按 NPC 存放在各自文件；这里只描述剧情路由，避免在 UI、
 * 场景站位和对话树三处重复判断当前剧情。B5 调查幕被拆成多个任务步骤，
 * 因此关键步骤只开放自己的主话题，避免把整幕内容一次性铺开。
 */
export const PLOT_DIALOGUE_ROUTES: readonly PlotDialogueRoute[] = [
  // 第一幕 · 抵达 / 初见
  {
    taskIds: ['step_housekeeper'],
    npcId: 'npc_housekeeper',
    nodeId: 'npc_housekeeper_intro',
    skipOpeningWhen: [{ flag: 'story.met_housekeeper' }],
  },
  {
    taskIds: ['step_arthur'],
    npcId: 'npc_housekeeper',
    nodeId: 'npc_housekeeper_wait_01',
  },
  {
    taskIds: ['step_arthur'],
    npcId: 'npc_arthur',
    nodeId: 'npc_arthur_intro',
    skipOpeningWhen: [{ flag: 'story.met_arthur' }],
  },

  // 第一幕 · 晚宴
  {
    taskIds: ['step_doctor'],
    npcId: 'npc_housekeeper',
    nodeId: 'npc_housekeeper_dinner_01',
  },
  {
    taskIds: ['step_doctor'],
    npcId: 'npc_arthur',
    nodeId: 'npc_arthur_dinner_01',
    spotIds: ['NPC_arthur_dining_head'],
  },
  {
    taskIds: ['step_doctor'],
    npcId: 'npc_doctor',
    nodeId: 'npc_doctor_intro',
    skipOpeningWhen: [{ flag: 'story.doctor_talked' }],
  },

  // 第二幕 · 取得钥匙与搬运证词：只展开霍尔太太的主线追问。
  {
    taskIds: ['step_coverup'],
    npcId: 'npc_housekeeper',
    nodeId: 'npc_housekeeper_b5_01',
    skipOpeningWhen: [{ flag: 'story.met_housekeeper' }],
    allowedChoiceIds: B5_HOUSEKEEPER_MAIN_CHOICES,
  },

  // 第二幕 · 医疗真相：只展开格雷医生的伤情证据链。
  {
    taskIds: ['step_medical_truth'],
    npcId: 'npc_doctor',
    nodeId: 'npc_doctor_b5_01',
    skipOpeningWhen: [{ flag: 'story.doctor_talked' }],
    allowedChoiceIds: B5_DOCTOR_MAIN_CHOICES,
  },

  // 第二幕 · 补充调查：其他 NPC 的线索追问只在自由取证阶段出现。
  {
    taskIds: ['step_corroborate'],
    npcId: 'npc_housekeeper',
    nodeId: 'npc_housekeeper_b5_01',
    skipOpeningWhen: [{ flag: 'story.met_housekeeper' }],
    allowedChoiceIds: B5_HOUSEKEEPER_OPTIONAL_CHOICES,
  },
  {
    taskIds: ['step_corroborate'],
    npcId: 'npc_doctor',
    nodeId: 'npc_doctor_b5_01',
    skipOpeningWhen: [{ flag: 'story.doctor_talked' }],
    allowedChoiceIds: ['ask_motive'],
  },
  {
    taskIds: ['step_corroborate'],
    npcId: 'npc_arthur',
    nodeId: 'npc_arthur_b5_gallery_01',
    spotIds: ['NPC_arthur_gallery_rail'],
    skipOpeningWhen: [{ flag: 'story.met_arthur' }],
    allowedChoiceIds: B5_ARTHUR_OPTIONAL_CHOICES,
  },
  {
    taskIds: ['step_corroborate'],
    npcId: 'npc_arthur',
    nodeId: 'npc_arthur_b5_dining_01',
    spotIds: ['NPC_arthur_dining_head'],
    skipOpeningWhen: [{ flag: 'story.met_arthur' }],
    allowedChoiceIds: B5_ARTHUR_OPTIONAL_CHOICES,
  },
  {
    taskIds: ['step_corroborate'],
    npcId: 'npc_arthur',
    nodeId: 'npc_arthur_b5_study_01',
    skipOpeningWhen: [{ flag: 'story.met_arthur' }],
    allowedChoiceIds: B5_ARTHUR_OPTIONAL_CHOICES,
  },

  // 第二幕 · 无 NPC 主线话题的步骤：仍保留 NPC 的过场台词和离开选项，
  // 但不再把其他步骤的追问混入当前对话。
  {
    taskIds: B5_NON_OPTIONAL_TASKS,
    npcId: 'npc_housekeeper',
    nodeId: 'npc_housekeeper_b5_01',
    skipOpeningWhen: [{ flag: 'story.met_housekeeper' }],
    allowedChoiceIds: [],
  },
  {
    taskIds: B5_NON_OPTIONAL_TASKS,
    npcId: 'npc_doctor',
    nodeId: 'npc_doctor_b5_01',
    skipOpeningWhen: [{ flag: 'story.doctor_talked' }],
    allowedChoiceIds: [],
  },
  {
    taskIds: B5_NON_OPTIONAL_TASKS,
    npcId: 'npc_arthur',
    nodeId: 'npc_arthur_b5_gallery_01',
    spotIds: ['NPC_arthur_gallery_rail'],
    skipOpeningWhen: [{ flag: 'story.met_arthur' }],
    allowedChoiceIds: [],
  },
  {
    taskIds: B5_NON_OPTIONAL_TASKS,
    npcId: 'npc_arthur',
    nodeId: 'npc_arthur_b5_dining_01',
    spotIds: ['NPC_arthur_dining_head'],
    skipOpeningWhen: [{ flag: 'story.met_arthur' }],
    allowedChoiceIds: [],
  },
  {
    taskIds: B5_NON_OPTIONAL_TASKS,
    npcId: 'npc_arthur',
    nodeId: 'npc_arthur_b5_study_01',
    skipOpeningWhen: [{ flag: 'story.met_arthur' }],
    allowedChoiceIds: [],
  },

  // 第三幕 · 对质
  {
    taskIds: ['step_confront'],
    npcId: 'npc_arthur',
    nodeId: 'npc_arthur_confront_01',
  },
  {
    taskIds: ['step_confront'],
    npcId: 'npc_housekeeper',
    nodeId: 'npc_housekeeper_confront_01',
    when: [{ flag: 'story.knows_coverup' }],
  },
  {
    taskIds: ['step_confront'],
    npcId: 'npc_housekeeper',
    nodeId: 'npc_housekeeper_b9_wait_01',
  },
  {
    taskIds: ['step_confront'],
    npcId: 'npc_doctor',
    nodeId: 'npc_doctor_confront_wait_01',
  },

  // 第四幕 · 午夜
  {
    taskIds: ['step_midnight'],
    npcId: 'npc_arthur',
    nodeId: 'npc_arthur_midnight_01',
  },
  {
    taskIds: ['step_midnight'],
    npcId: 'npc_housekeeper',
    nodeId: 'npc_housekeeper_midnight_testified',
    when: [{ flag: 'story.housekeeper_testimony' }],
  },
  {
    taskIds: ['step_midnight'],
    npcId: 'npc_housekeeper',
    nodeId: 'npc_housekeeper_midnight_01',
  },
  {
    taskIds: ['step_midnight'],
    npcId: 'npc_doctor',
    nodeId: 'npc_doctor_midnight_testified',
    when: [{ flag: 'story.doctor_testimony' }],
  },
  {
    taskIds: ['step_midnight'],
    npcId: 'npc_doctor',
    nodeId: 'npc_doctor_midnight_01',
  },
];
