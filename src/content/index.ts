import type {
  ClueDefinition,
  DialogueNode,
  EndingDefinition,
  InspectableDefinition,
  ItemDefinition,
  NpcDefinition,
  PuzzleDefinition,
  QuestDefinition,
} from '../shared/types/content';
import { clues } from './clues.ts';
import {
  DIALOGUE_CHOICE_GUIDES,
  dialogues,
} from './dialogues/index.ts';
import type { DialogueChoiceGuide } from '../shared/types/content';
import { endings } from './endings.ts';
import { inspectables } from './inspectables.ts';
import { items } from './items.ts';
import { npcs } from './npcs.ts';
import { clockPuzzleContent, safePuzzleContent } from './puzzles.ts';
import { quests } from './quests.ts';

export interface ContentRegistry {
  dialogues: readonly DialogueNode[];
  dialogueChoiceGuides: Readonly<Record<string, DialogueChoiceGuide>>;
  npcs: readonly NpcDefinition[];
  clues: readonly ClueDefinition[];
  items: readonly ItemDefinition[];
  inspectables: readonly InspectableDefinition[];
  quests: readonly QuestDefinition[];
  puzzles: readonly PuzzleDefinition[];
  endings: readonly EndingDefinition[];
}

export const content: ContentRegistry = {
  dialogues,
  dialogueChoiceGuides: DIALOGUE_CHOICE_GUIDES,
  npcs,
  clues,
  items,
  inspectables,
  quests,
  puzzles: [clockPuzzleContent.definition, safePuzzleContent.definition],
  endings,
};
