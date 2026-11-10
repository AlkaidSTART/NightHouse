import type {
  ClueDefinition,
  DialogueNode,
  EndingDefinition,
  NpcDefinition,
  PuzzleDefinition,
  QuestDefinition,
} from '../shared/types/content';

export interface ContentRegistry {
  dialogues: DialogueNode[];
  npcs: NpcDefinition[];
  clues: ClueDefinition[];
  quests: QuestDefinition[];
  puzzles: PuzzleDefinition[];
  endings: EndingDefinition[];
}

export const content: ContentRegistry = {
  dialogues: [],
  npcs: [],
  clues: [],
  quests: [],
  puzzles: [],
  endings: [],
};
