import type { DialogueNode } from '../../shared/types/content';
import { arthurDialogues } from './arthur.ts';
import { doctorDialogues } from './doctor.ts';
import { housekeeperDialogues } from './housekeeper.ts';

export { DIALOGUE_CHOICE_GUIDES } from './choiceGuides.ts';

export const dialogues: readonly DialogueNode[] = [
  ...arthurDialogues,
  ...housekeeperDialogues,
  ...doctorDialogues,
];
