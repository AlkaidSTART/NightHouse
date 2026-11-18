export type StoryFlagValue = boolean | number | string;

export type CluePriority = 'main' | 'supporting' | 'ambient';

export type DialogueSpeaker = 'npc' | 'player' | 'narration';

export interface StoryCondition {
  flag: string;
  equals?: StoryFlagValue;
}

export type StoryEffectType =
  | 'set-flag'
  | 'discover-clue'
  | 'unlock-dialogue';

export interface StoryEffect {
  type: StoryEffectType;
  key: string;
  value?: StoryFlagValue;
}

export interface DialogueLine {
  speaker: DialogueSpeaker;
  text: string;
}

export interface DialogueChoice {
  id: string;
  text: string;
  next: string | null;
  conditions?: StoryCondition[];
  effects?: StoryEffect[];
  /**
   * 选项所属的任务步骤。只有当前任务步骤命中时才显示，避免 NPC 一次列出
   * 所有话题；省略表示常规选项（返回、离开、态度回应），始终显示。
   */
  taskIds?: readonly string[];
}

export interface DialogueNode {
  id: string;
  npcId: string;
  conditions?: StoryCondition[];
  /**
   * 节点所属的任务步骤。只有当前任务步骤命中时才允许进入，
   * 用于把 NPC 的对话按情节分段，避免上一段的入口在后续情节被重复触发。
   */
  taskIds?: readonly string[];
  lines: DialogueLine[];
  /**
   * 重复交谈时替代开场白的短句。入口节点在第二次之后会跳过 `lines`，
   * 用一两句当前情节的招呼替代，避免不同情节之间没有可感知的对话边界。
   */
  reenterLines?: DialogueLine[];
  choices: DialogueChoice[];
}

/** 对话中可供玩家按顺序参考的提问步骤。 */
export interface DialogueChoiceGuideStep {
  /** 必须对应当前节点的真实选项 ID。 */
  choiceId: string;
  /** 简短的话题说明，用于对话面板中的顺序提示。 */
  label: string;
}

/**
 * 单个对话节点的提问引导。
 *
 * 引导决定对话面板当前突出显示哪个问题；其他非导航话题折叠在“其他话题”
 * 中，但仍可展开选择。条件不满足或当前剧情白名单未开放的话题会被
 * DialogueSystem 自动过滤。
 */
export interface DialogueChoiceGuide {
  /** 当前节点的提问策略提示。 */
  hint?: string;
  sequence: readonly DialogueChoiceGuideStep[];
}

export interface NpcDefinition {
  id: string;
  name: string;
  role: string;
  personality: string[];
  publicGoal: string;
  hiddenMotive?: string;
  knownClueIds?: string[];
  dialogueEntryId: string;
}

export interface ClueDefinition {
  id: string;
  title: string;
  description: string;
  locationId: string;
  priority: CluePriority;
  relatedNpcIds?: string[];
  storyFlags?: string[];
}

export type ItemCategory = '钥匙' | '信件' | '机关部件' | '关键证物';

/**
 * 背包中可存放的可交互物品定义。
 * 持有状态与使用状态均由 `storyFlags` 实时推导，避免存档状态双写。
 */
export interface ItemDefinition {
  id: string;
  title: string;
  category: ItemCategory;
  /** 标记玩家已获得该物品的剧情标记。 */
  flag: string;
  /** 获得地点（区域 ID，或 'player' 表示随身携带）。 */
  sourceLocationId: string;
  /** 物品对应的可交互目标区域 ID。 */
  targetLocationId: string;
  /** 可交互目标名称（如房门或机关名称）。 */
  targetLabel: string;
  description: string;
  usage: string;
  /** 满足任一条件时视为该物品已完成核心交互用途。 */
  usedWhen?: StoryCondition[];
}

export type InspectTextStyle = 'body' | 'quote' | 'note' | 'signature';

/** 检视面板中的一段正文。段落之间保留空行，适合信纸、日志和书籍排版。 */
export interface InspectSection {
  heading?: string;
  style?: InspectTextStyle;
  paragraphs: readonly string[];
}

/**
 * 同一检视对象在不同剧情状态下的内容。按顺序取第一个 `when` 全部满足的变体；
 * 没有 `when` 的变体是兜底，必须放在最后。
 */
export interface InspectVariant {
  when?: readonly StoryCondition[];
  sections: readonly InspectSection[];
  /** 阅读时执行；重复阅读是幂等的。 */
  effects?: readonly StoryEffect[];
}

/** 可检视对象，`id` 与场景交互点 ID 一致。 */
export interface InspectableDefinition {
  id: string;
  title: string;
  /** 面板上方的类别标签，如「信件」「文件」「书籍」。 */
  category: string;
  variants: readonly InspectVariant[];
}

/**
 * 同一步任务内的阶段性目标。按顺序解析，第一个 `until` 尚未全部满足的阶段
 * 就是玩家当前该去的地点；所有阶段完成后使用任务步骤自身的最终目标。
 */
export interface QuestStage {
  id: string;
  /** 当前阶段在目标面板上显示的一句话目标。 */
  objective: string;
  /** 当前阶段的路线提示。 */
  hint: string;
  /** 当前阶段所在区域 ID，用于小地图标记与方向指引。 */
  locationId: string;
  /** 全部满足后进入下一阶段。 */
  until: StoryCondition[];
}

export interface QuestStep {
  id: string;
  /** 目标面板上显示的一句话目标；有未完成阶段时由阶段目标覆盖。 */
  objective: string;
  /** 路线提示；有未完成阶段时由阶段提示覆盖。 */
  hint: string;
  /** 最终目标所在区域 ID，也是阶段的兜底地点。 */
  locationId: string;
  /** 复合任务按取证/交付顺序声明阶段地点，避免导航指向最终交付点。 */
  stages?: readonly QuestStage[];
  /** 满足任一条件组即视为该步完成（外层「或」，内层「且」）。 */
  doneWhen: StoryCondition[][];
}

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  /** 按顺序推进；第一个未完成的步骤就是当前目标。 */
  steps: QuestStep[];
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  description: string;
  prerequisites?: StoryCondition[];
  successConditions: StoryCondition[];
  failureFeedback: string;
  successEvent: string;
}

export interface EndingDefinition {
  id: string;
  title: string;
  conditions: StoryCondition[];
}
