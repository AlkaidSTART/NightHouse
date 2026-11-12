import type {
  ClueDefinition,
  DialogueNode,
  EndingDefinition,
  InspectableDefinition,
  NpcDefinition,
  PuzzleDefinition,
  QuestDefinition,
} from '../shared/types/content';
import { clues } from './clues.ts';
import { dialogues } from './dialogues/index.ts';
import { inspectables } from './inspectables.ts';
import { npcs } from './npcs.ts';
import { clockPuzzleContent, safePuzzleContent } from './puzzles.ts';
import { quests } from './quests.ts';

export interface ContentRegistry {
  dialogues: readonly DialogueNode[];
  npcs: readonly NpcDefinition[];
  clues: readonly ClueDefinition[];
  inspectables: readonly InspectableDefinition[];
  quests: readonly QuestDefinition[];
  puzzles: readonly PuzzleDefinition[];
  endings: readonly EndingDefinition[];
}

export const content: ContentRegistry = {
  dialogues,
  npcs,
  clues,
  inspectables,
  quests,
  puzzles: [clockPuzzleContent.definition, safePuzzleContent.definition],
  endings: [],
};
