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

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  prerequisites?: StoryCondition[];
  completionConditions: StoryCondition[];
  completionEvent?: string;
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
