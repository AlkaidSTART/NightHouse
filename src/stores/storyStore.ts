import { create } from 'zustand';
import { quests } from '../content/quests';
import type { StoryFlagValue } from '../shared/types/content';
import type { NPCState, SaveData, Vec3Tuple } from '../shared/types/save';
import { createNewSave, SAVE_SCHEMA_VERSION } from '../game/save/SaveManager';
import { resolveActiveStepId } from '../game/story/questProgress';

export interface StoryState {
  currentSceneId: string;
  /** 当前任务步骤 ID（全局进度共享值），由剧情标记推导，非持久化。 */
  activeTaskId: string | null;
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
  activeTaskId: resolveActiveStepId(initialDefault.storyFlags, quests),
  storyFlags: initialDefault.storyFlags,
  discoveredClueIds: initialDefault.discoveredClueIds,
  completedPuzzleIds: initialDefault.completedPuzzleIds,
  completedQuestIds: initialDefault.completedQuestIds,
  npcStates: initialDefault.npcStates,
  choices: initialDefault.choices,

  loadFromSave: (save: SaveData) => {
    const storyFlags = { ...save.storyFlags };
    set({
      currentSceneId: save.currentSceneId,
      activeTaskId: resolveActiveStepId(storyFlags, quests),
      storyFlags,
      discoveredClueIds: [...save.discoveredClueIds],
      completedPuzzleIds: [...save.completedPuzzleIds],
      completedQuestIds: [...save.completedQuestIds],
      npcStates: { ...save.npcStates },
      choices: { ...save.choices },
    });
  },

  setStoryFlag: (flag: string, value: StoryFlagValue) => {
    set((state) => {
      const storyFlags = {
        ...state.storyFlags,
        [flag]: value,
      };
      return {
        storyFlags,
        activeTaskId: resolveActiveStepId(storyFlags, quests),
      };
    });
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
      activeTaskId: resolveActiveStepId(fresh.storyFlags, quests),
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
