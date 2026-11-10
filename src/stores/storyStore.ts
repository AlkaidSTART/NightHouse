import { create } from 'zustand';
import type { StoryFlagValue } from '../shared/types/content';
import type { NPCState, SaveData, Vec3Tuple } from '../shared/types/save';
import { createNewSave, SAVE_SCHEMA_VERSION } from '../game/save/SaveManager';

export interface StoryState {
  currentSceneId: string;
  storyFlags: Record<string, StoryFlagValue>;
  discoveredClueIds: string[];
  completedPuzzleIds: string[];
  completedQuestIds: string[];
  npcStates: Record<string, NPCState>;
  choices: Record<string, string>;

  loadFromSave: (save: SaveData) => void;
  setStoryFlag: (flag: string, value: StoryFlagValue) => void;
  discoverClue: (clueId: string) => void;
  completePuzzle: (puzzleId: string) => void;
  completeQuest: (questId: string) => void;
  recordChoice: (choiceId: string, optionId: string) => void;
  updateNpcState: (npcId: string, patch: Partial<NPCState>) => void;
  resetStory: (sceneId?: string) => void;
  toSaveData: (player: { position: Vec3Tuple; rotation: Vec3Tuple }) => SaveData;
}

const initialDefault = createNewSave();

export const useStoryStore = create<StoryState>((set, get) => ({
  currentSceneId: initialDefault.currentSceneId,
  storyFlags: initialDefault.storyFlags,
  discoveredClueIds: initialDefault.discoveredClueIds,
  completedPuzzleIds: initialDefault.completedPuzzleIds,
  completedQuestIds: initialDefault.completedQuestIds,
  npcStates: initialDefault.npcStates,
  choices: initialDefault.choices,

  loadFromSave: (save: SaveData) => {
    set({
      currentSceneId: save.currentSceneId,
      storyFlags: { ...save.storyFlags },
      discoveredClueIds: [...save.discoveredClueIds],
      completedPuzzleIds: [...save.completedPuzzleIds],
      completedQuestIds: [...save.completedQuestIds],
      npcStates: { ...save.npcStates },
      choices: { ...save.choices },
    });
  },

  setStoryFlag: (flag: string, value: StoryFlagValue) => {
    set((state) => ({
      storyFlags: {
        ...state.storyFlags,
        [flag]: value,
      },
    }));
  },

  discoverClue: (clueId: string) => {
    set((state) => {
      if (state.discoveredClueIds.includes(clueId)) {
        return state;
      }
      return {
        discoveredClueIds: [...state.discoveredClueIds, clueId],
      };
    });
  },

  completePuzzle: (puzzleId: string) => {
    set((state) => {
      if (state.completedPuzzleIds.includes(puzzleId)) {
        return state;
      }
      return {
        completedPuzzleIds: [...state.completedPuzzleIds, puzzleId],
      };
    });
  },

  completeQuest: (questId: string) => {
    set((state) => {
      if (state.completedQuestIds.includes(questId)) {
        return state;
      }
      return {
        completedQuestIds: [...state.completedQuestIds, questId],
      };
    });
  },

  recordChoice: (choiceId: string, optionId: string) => {
    set((state) => ({
      choices: {
        ...state.choices,
        [choiceId]: optionId,
      },
    }));
  },

  updateNpcState: (npcId: string, patch: Partial<NPCState>) => {
    set((state) => {
      const existing = state.npcStates[npcId] ?? {
        npcId,
        mood: 'neutral',
        relationship: 0,
        currentDialogueNode: null,
        unlockedDialogueIds: [],
        flags: {},
      };

      return {
        npcStates: {
          ...state.npcStates,
          [npcId]: {
            ...existing,
            ...patch,
          },
        },
      };
    });
  },

  resetStory: (sceneId?: string) => {
    const fresh = createNewSave(sceneId);
    set({
      currentSceneId: fresh.currentSceneId,
      storyFlags: fresh.storyFlags,
      discoveredClueIds: fresh.discoveredClueIds,
      completedPuzzleIds: fresh.completedPuzzleIds,
      completedQuestIds: fresh.completedQuestIds,
      npcStates: fresh.npcStates,
      choices: fresh.choices,
    });
  },

  toSaveData: (player: { position: Vec3Tuple; rotation: Vec3Tuple }): SaveData => {
    const state = get();
    return {
      schemaVersion: SAVE_SCHEMA_VERSION,
      updatedAt: Date.now(),
      currentSceneId: state.currentSceneId,
      player: {
        position: [...player.position],
        rotation: [...player.rotation],
      },
      storyFlags: { ...state.storyFlags },
      discoveredClueIds: [...state.discoveredClueIds],
      completedPuzzleIds: [...state.completedPuzzleIds],
      completedQuestIds: [...state.completedQuestIds],
      npcStates: { ...state.npcStates },
      choices: { ...state.choices },
    };
  },
}));
