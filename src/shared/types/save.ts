import type { StoryFlagValue } from './content';

export type Vec3Tuple = [number, number, number];

export interface NPCState {
  npcId: string;
  mood: string;
  relationship: number;
  currentDialogueNode: string | null;
  unlockedDialogueIds: string[];
  flags: Record<string, StoryFlagValue>;
}

export interface SaveData {
  schemaVersion: number;
  updatedAt: number;
  currentSceneId: string;
  player: {
    position: Vec3Tuple;
    rotation: Vec3Tuple;
  };
  storyFlags: Record<string, StoryFlagValue>;
  discoveredClueIds: string[];
  completedPuzzleIds: string[];
  completedQuestIds: string[];
  npcStates: Record<string, NPCState>;
  choices: Record<string, string>;
}

export interface PlayerSettings {
  mouseSensitivity: number;
  masterVolume: number;
  effectsVolume: number;
}
