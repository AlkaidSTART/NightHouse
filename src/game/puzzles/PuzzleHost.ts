import type { StoryFlagValue } from '../../shared/types/content';
import type { StoryFlags } from '../story/conditions.ts';

export interface PuzzleHost {
  getFlags(): StoryFlags;
  setFlag: (key: string, value: StoryFlagValue) => void;
  /** 返回线索标题表示本次新发现；已发现时返回 null。 */
  discoverClue: (clueId: string) => string | null;
  completePuzzle: (puzzleId: string) => void;
}
