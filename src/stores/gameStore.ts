import { create } from 'zustand';

export type ScreenMode = 'home' | 'game';
export type GamePhase = 'ready' | 'playing' | 'paused';

export interface GameState {
  screen: ScreenMode;
  resume: boolean;
  hasSave: boolean;
  saveNotice: string | null;
  phase: GamePhase;
  ready: boolean;
  prompt: string | null;
  toast: string | null;
  error: string | null;

  setScreen: (screen: ScreenMode) => void;
  setHasSave: (hasSave: boolean) => void;
  setSaveNotice: (notice: string | null) => void;
  startNewGame: () => void;
  continueGame: () => void;
  exitToHome: () => void;
  setPhase: (phase: GamePhase) => void;
  setReady: (ready: boolean) => void;
  setPrompt: (prompt: string | null) => void;
  setToast: (toast: string | null) => void;
  showToast: (message: string, durationMs?: number) => void;
  setError: (error: string | null) => void;
  resetGameSession: () => void;
}

let toastTimer: number | null = null;

export const useGameStore = create<GameState>((set) => ({
  screen: 'home',
  resume: false,
  hasSave: false,
  saveNotice: null,
  phase: 'ready',
  ready: false,
  prompt: null,
  toast: null,
  error: null,

  setScreen: (screen) => set({ screen }),
  setHasSave: (hasSave) => set({ hasSave }),
  setSaveNotice: (saveNotice) => set({ saveNotice }),

  startNewGame: () => {
    if (toastTimer !== null) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }
    set({
      screen: 'game',
      resume: false,
      phase: 'ready',
      ready: false,
      prompt: null,
      toast: null,
      error: null,
    });
  },

  continueGame: () => {
    if (toastTimer !== null) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }
    set({
      screen: 'game',
      resume: true,
      phase: 'ready',
      ready: false,
      prompt: null,
      toast: null,
      error: null,
    });
  },

  exitToHome: () => {
    if (toastTimer !== null) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }
    set({
      screen: 'home',
      phase: 'ready',
      ready: false,
      prompt: null,
      toast: null,
      error: null,
    });
  },

  setPhase: (phase) => set({ phase }),
  setReady: (ready) => set({ ready }),
  setPrompt: (prompt) => set({ prompt }),
  setToast: (toast) => set({ toast }),

  showToast: (message: string, durationMs = 3500) => {
    if (toastTimer !== null) {
      window.clearTimeout(toastTimer);
    }
    set({ toast: message });
    toastTimer = window.setTimeout(() => {
      set({ toast: null });
      toastTimer = null;
    }, durationMs);
  },

  setError: (error) => set({ error }),

  resetGameSession: () => {
    if (toastTimer !== null) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }
    set({
      phase: 'ready',
      ready: false,
      prompt: null,
      toast: null,
      error: null,
    });
  },
}));
