import type { DialogueNode } from '../../shared/types/content';
import { arthurDialogues } from './arthur.ts';
import { doctorDialogues } from './doctor.ts';
import { housekeeperDialogues } from './housekeeper.ts';

export const dialogues: readonly DialogueNode[] = [
  ...arthurDialogues,
  ...housekeeperDialogues,
  ...doctorDialogues,
];
