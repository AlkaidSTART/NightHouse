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
  lines: DialogueLine[];
  choices: DialogueChoice[];
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

export interface QuestStep {
  id: string;
  /** 目标面板上显示的一句话目标。 */
  objective: string;
  /** 路线提示，说明玩家下一步该往哪走。 */
  hint: string;
  /** 目标所在区域 ID，用于小地图标记与方向指引。 */
  locationId: string;
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
