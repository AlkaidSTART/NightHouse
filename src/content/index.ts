import type {
  ClueDefinition,
  DialogueNode,
  EndingDefinition,
  NpcDefinition,
  PuzzleDefinition,
  QuestDefinition,
} from '../shared/types/content';
import { clues } from './clues.ts';
import { dialogues } from './dialogues/index.ts';
import { npcs } from './npcs.ts';

export interface ContentRegistry {
  dialogues: readonly DialogueNode[];
  npcs: readonly NpcDefinition[];
  clues: readonly ClueDefinition[];
  quests: readonly QuestDefinition[];
  puzzles: readonly PuzzleDefinition[];
  endings: readonly EndingDefinition[];
}

export const content: ContentRegistry = {
  dialogues,
  npcs,
  clues,
  quests: [],
  puzzles: [],
  endings: [],
};
