import type { SafePuzzleContent } from '../../content/puzzles';
import type { SafePuzzleView } from '../../shared/types/puzzle';
import type { StoryFlags } from '../story/conditions.ts';
import type { PuzzleHost } from './PuzzleHost.ts';

const SAFE_CLUE_IDS = ['clue_shipping_ledger', 'clue_insurance_policy'] as const;

/**
 * 保险箱谜题：油画背面给出 PERSEPHONE — 1896.3.14，报纸确认沉船日期，
 * 四位转盘输入 0314。错误只累计尝试次数，不触发惩罚。
 */
export class SafePuzzle {
  private readonly content: SafePuzzleContent;
  private readonly host: PuzzleHost;

  constructor(content: SafePuzzleContent, host: PuzzleHost) {
    this.content = content;
    this.host = host;
  }

  isSolved(): boolean {
    return this.host.getFlags()['story.safe_opened'] === true;
  }

  open(): SafePuzzleView {
    return this.buildView(null, null, []);
  }

  submit(code: string): SafePuzzleView {
    const flags = this.host.getFlags();
    if (flags['story.safe_opened'] === true) {
      return this.buildView(null, null, []);
    }
    if (!this.canTry(flags)) {
      return this.buildView(null, null, []);
    }
    if (code.length !== this.content.code.length) {
      return this.buildView(this.content.texts.wrongCode, null, []);
    }
    if (code === this.content.code) {
      return this.solve();
    }

    const attempts = readAttempts(flags) + 1;
    this.host.setFlag('puzzle.safe_attempts', attempts);
    return this.buildView(
      this.content.texts.wrongCode,
      attempts >= 3 ? this.content.texts.thirdFailure : null,
      [],
    );
  }

  private canTry(flags: StoryFlags): boolean {
    return (
      flags['clue.ship_painting'] === true &&
      (flags['clue.newspaper'] === true ||
        flags['clue.medical_record'] === true)
    );
  }

  private solve(): SafePuzzleView {
    this.host.setFlag('story.safe_opened', true);
    this.host.setFlag('story.knows_insurance_fraud', true);
    this.host.completePuzzle('puzzle_safe');

    const newClueTitles: string[] = [];
    for (const clueId of SAFE_CLUE_IDS) {
      const title = this.host.discoverClue(clueId);
      if (title) {
        newClueTitles.push(title);
      }
    }
    return this.buildView(null, null, newClueTitles);
  }

  private buildView(
    codeError: string | null,
    note: string | null,
    newClueTitles: readonly string[],
  ): SafePuzzleView {
    const flags = this.host.getFlags();
    const solved = flags['story.safe_opened'] === true;
    const canTry = !solved && this.canTry(flags);

    return {
      kind: 'safe',
      title: this.content.title,
      category: this.content.category,
      description: solved
        ? [this.content.texts.success]
        : canTry
          ? [this.content.texts.ready]
          : [this.content.texts.lockedWithoutClues],
      canTry,
      codeLength: this.content.code.length,
      codeError,
      note,
      solved,
      newClueTitles,
    };
  }
}

function readAttempts(flags: StoryFlags): number {
  const value = flags['puzzle.safe_attempts'];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
