import type { ClockPuzzleContent } from '../../content/puzzles';
import type {
  ClockPuzzleView,
  PuzzleActionView,
} from '../../shared/types/puzzle';
import type { StoryFlags } from '../story/conditions.ts';
import type { PuzzleHost } from './PuzzleHost.ts';

const CAPTAIN_CLUE_IDS = ['clue_captains_log', 'clue_crew_names'] as const;

/**
 * 落地钟谜题：钥匙 → 开钟门 → 挂摆锤 → 上弦 → 校准到 23:47。
 * 状态全部由剧情标记推导，读档后可以从中断的步骤继续。
 */
export class ClockPuzzle {
  private readonly content: ClockPuzzleContent;
  private readonly host: PuzzleHost;

  constructor(content: ClockPuzzleContent, host: PuzzleHost) {
    this.content = content;
    this.host = host;
  }

  isSolved(): boolean {
    return this.host.getFlags()['story.clock_repaired'] === true;
  }

  open(): ClockPuzzleView {
    return this.buildView(null, []);
  }

  act(actionId: string): ClockPuzzleView {
    const flags = this.host.getFlags();
    if (flags['story.clock_repaired'] === true) {
      return this.buildView(null, []);
    }

    const hasKey = flags['item.clock_key'] === true;
    const hasPendulum = flags['item.pendulum'] === true;
    const doorOpen = flags['story.clock_door_open'] === true;
    const pendulumHung = flags['story.clock_pendulum_hung'] === true;
    const wound = flags['story.clock_wound'] === true;

    if (actionId === 'clock.open-door') {
      if (!hasKey || doorOpen) {
        return this.buildView(null, []);
      }
      this.host.setFlag('story.clock_door_open', true);
      return this.buildView(this.content.texts.doorOpened, []);
    }

    if (actionId === 'clock.hang-pendulum') {
      if (!doorOpen || !hasPendulum || pendulumHung) {
        return this.buildView(null, []);
      }
      this.host.setFlag('story.clock_pendulum_hung', true);
      return this.buildView(this.content.texts.pendulumInstalled, []);
    }

    if (actionId === 'clock.wind') {
      if (!pendulumHung || wound) {
        return this.buildView(null, []);
      }
      this.host.setFlag('story.clock_wound', true);
      return this.buildView(this.content.texts.wound, []);
    }

    const choice = this.content.calibration.find(
      (candidate) => candidate.id === actionId,
    );
    if (!choice || !wound) {
      return this.buildView(null, []);
    }
    if (!this.canCalibrate(flags)) {
      return this.buildView(null, []);
    }
    if (!choice.correct) {
      return this.buildView(this.content.texts.wrongTime, []);
    }
    return this.solve();
  }

  private canCalibrate(flags: StoryFlags): boolean {
    return (
      flags['story.saw_mantel_clock'] === true &&
      flags['story.knows_high_tide'] === true
    );
  }

  private solve(): ClockPuzzleView {
    this.host.setFlag('story.clock_repaired', true);
    this.host.setFlag('story.knows_shipwreck', true);
    this.host.setFlag('story.knows_crew_names', true);
    this.host.completePuzzle('puzzle_clock');

    const newClueTitles: string[] = [];
    for (const clueId of CAPTAIN_CLUE_IDS) {
      const title = this.host.discoverClue(clueId);
      if (title) {
        newClueTitles.push(title);
      }
    }
    return this.buildView(null, newClueTitles);
  }

  private buildView(
    feedback: string | null,
    newClueTitles: readonly string[],
  ): ClockPuzzleView {
    const flags = this.host.getFlags();
    const solved = flags['story.clock_repaired'] === true;
    const actions: PuzzleActionView[] = [];
    let description: readonly string[];

    if (solved) {
      description = [this.content.texts.success];
    } else if (flags['item.clock_key'] !== true) {
      description = [this.content.texts.lockedWithoutKey];
    } else if (flags['story.clock_door_open'] !== true) {
      description = [this.content.texts.doorReady];
      actions.push({
        id: 'clock.open-door',
        label: this.content.actions.openDoor,
      });
    } else if (flags['item.pendulum'] !== true) {
      description = [this.content.texts.doorOpenedNoPendulum];
    } else if (flags['story.clock_pendulum_hung'] !== true) {
      description = [this.content.texts.pendulumReady];
      actions.push({
        id: 'clock.hang-pendulum',
        label: this.content.actions.hangPendulum,
      });
    } else if (flags['story.clock_wound'] !== true) {
      description = [this.content.texts.pendulumHung];
      actions.push({
        id: 'clock.wind',
        label: this.content.actions.wind,
      });
    } else if (!this.canCalibrate(flags)) {
      description = [this.content.texts.woundNeedsClock];
    } else {
      description = [this.content.texts.calibrationReady];
      for (const choice of this.content.calibration) {
        actions.push({ id: choice.id, label: choice.label });
      }
    }

    return {
      kind: 'clock',
      title: this.content.title,
      category: this.content.category,
      description,
      actions,
      feedback,
      solved,
      newClueTitles,
    };
  }
}
