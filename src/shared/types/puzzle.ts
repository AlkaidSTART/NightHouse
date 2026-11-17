export interface PuzzleActionView {
  id: string;
  label: string;
}

export interface ClockPuzzleView {
  kind: 'clock';
  title: string;
  category: string;
  description: readonly string[];
  actions: readonly PuzzleActionView[];
  feedback: string | null;
  solved: boolean;
  newClueTitles: readonly string[];
}

export interface SafePuzzleView {
  kind: 'safe';
  title: string;
  category: string;
  description: readonly string[];
  /** 是否允许输入密码；保险箱未完成时始终为 true。 */
  canTry: boolean;
  codeLength: number;
  codeError: string | null;
  note: string | null;
  solved: boolean;
  newClueTitles: readonly string[];
}

export type PuzzleView = ClockPuzzleView | SafePuzzleView;
