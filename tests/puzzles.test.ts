import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clues } from '../src/content/clues.ts';
import {
  clockPuzzleContent,
  safePuzzleContent,
} from '../src/content/puzzles.ts';
import { ClockPuzzle } from '../src/game/puzzles/ClockPuzzle.ts';
import type { PuzzleHost } from '../src/game/puzzles/PuzzleHost.ts';
import { SafePuzzle } from '../src/game/puzzles/SafePuzzle.ts';
import type { StoryFlagValue } from '../src/shared/types/content.ts';

const clueTitles = new Map(clues.map((clue) => [clue.id, clue.title]));

interface FakePuzzleState {
  flags: Record<string, StoryFlagValue>;
  discovered: Set<string>;
  completed: Set<string>;
}

function createHost(initialFlags: Record<string, StoryFlagValue> = {}): {
  state: FakePuzzleState;
  host: PuzzleHost;
} {
  const state: FakePuzzleState = {
    flags: { ...initialFlags },
    discovered: new Set(),
    completed: new Set(),
  };
  return {
    state,
    host: {
      getFlags: () => state.flags,
      setFlag: (key, value) => {
        state.flags[key] = value;
      },
      discoverClue: (clueId) => {
        if (state.discovered.has(clueId)) {
          return null;
        }
        state.discovered.add(clueId);
        return clueTitles.get(clueId) ?? clueId;
      },
      completePuzzle: (puzzleId) => {
        state.completed.add(puzzleId);
      },
    },
  };
}

test('谜题内容：答案与操作配置自洽', () => {
  assert.equal(clockPuzzleContent.definition.id, 'puzzle_clock');
  assert.equal(safePuzzleContent.definition.id, 'puzzle_safe');
  assert.equal(
    clockPuzzleContent.calibration.filter((choice) => choice.correct).length,
    1,
  );
  assert.equal(
    clockPuzzleContent.calibration.find((choice) => choice.correct)?.label,
    '拨到 23:47',
  );
  assert.equal(safePuzzleContent.code.length, 4);
  assert.ok(/^\d{4}$/.test(safePuzzleContent.code));
});

test('落地钟：没有钥匙时只能看到锁着的钟门', () => {
  const fake = createHost();
  const puzzle = new ClockPuzzle(clockPuzzleContent, fake.host);
  const view = puzzle.open();

  assert.equal(view.actions.length, 0);
  assert.ok(view.description[0]?.includes('锁着'));
  assert.equal(view.solved, false);
});

test('落地钟：按开钟门、挂摆锤、上弦推进，缺少校时依据时不提供拨针选项', () => {
  const fake = createHost({
    'item.clock_key': true,
    'item.pendulum': true,
  });
  const puzzle = new ClockPuzzle(clockPuzzleContent, fake.host);

  let view = puzzle.open();
  assert.deepEqual(
    view.actions.map((action) => action.id),
    ['clock.open-door'],
  );
  view = puzzle.act('clock.open-door');
  assert.equal(fake.state.flags['story.clock_door_open'], true);
  assert.equal(view.feedback, clockPuzzleContent.texts.doorOpened);

  puzzle.act('clock.hang-pendulum');
  assert.equal(fake.state.flags['story.clock_pendulum_hung'], true);

  view = puzzle.act('clock.wind');
  assert.equal(fake.state.flags['story.clock_wound'], true);
  assert.equal(view.actions.length, 0);
  assert.ok(view.description[0]?.includes('确认'));

  fake.state.flags['story.saw_mantel_clock'] = true;
  fake.state.flags['story.knows_high_tide'] = true;
  view = puzzle.open();
  assert.equal(view.actions.length, clockPuzzleContent.calibration.length);
});

test('落地钟：错误时间不打开暗格，23:47 解锁船长日志与船员名单', () => {
  const fake = createHost({
    'item.clock_key': true,
    'item.pendulum': true,
    'story.clock_door_open': true,
    'story.clock_pendulum_hung': true,
    'story.clock_wound': true,
    'story.saw_mantel_clock': true,
    'story.knows_high_tide': true,
  });
  const puzzle = new ClockPuzzle(clockPuzzleContent, fake.host);

  let view = puzzle.act('clock.set-0000');
  assert.equal(view.solved, false);
  assert.equal(view.feedback, clockPuzzleContent.texts.wrongTime);
  assert.equal(fake.state.flags['story.clock_repaired'], undefined);

  view = puzzle.act('clock.set-2347');
  assert.equal(view.solved, true);
  assert.deepEqual(view.newClueTitles, ['船长日志', '四名船员的名字']);
  assert.equal(fake.state.flags['story.clock_repaired'], true);
  assert.equal(fake.state.flags['story.knows_shipwreck'], true);
  assert.equal(fake.state.flags['story.knows_crew_names'], true);
  assert.ok(fake.state.completed.has('puzzle_clock'));
  assert.ok(fake.state.discovered.has('clue_captains_log'));
  assert.ok(fake.state.discovered.has('clue_crew_names'));
  assert.equal(puzzle.isSolved(), true);
});

test('保险箱：缺少油画或日期线索时不开放输入', () => {
  const noClues = createHost();
  const puzzle = new SafePuzzle(safePuzzleContent, noClues.host);
  assert.equal(puzzle.open().canTry, false);

  const paintingOnly = createHost({ 'clue.ship_painting': true });
  const paintingPuzzle = new SafePuzzle(safePuzzleContent, paintingOnly.host);
  assert.equal(paintingPuzzle.open().canTry, false);

  const withNewspaper = createHost({
    'clue.ship_painting': true,
    'clue.newspaper': true,
  });
  const readyPuzzle = new SafePuzzle(safePuzzleContent, withNewspaper.host);
  assert.equal(readyPuzzle.open().canTry, true);
});

test('保险箱：错误密码累计尝试，第三次触发医生台词', () => {
  const fake = createHost({
    'clue.ship_painting': true,
    'clue.medical_record': true,
  });
  const puzzle = new SafePuzzle(safePuzzleContent, fake.host);

  let view = puzzle.submit('1234');
  assert.equal(view.solved, false);
  assert.equal(view.codeError, safePuzzleContent.texts.wrongCode);
  assert.equal(view.note, null);

  puzzle.submit('9999');
  view = puzzle.submit('0000');
  assert.equal(fake.state.flags['puzzle.safe_attempts'], 3);
  assert.equal(view.note, safePuzzleContent.texts.thirdFailure);
});

test('保险箱：0314 打开箱门并记录账本与赔付单', () => {
  const fake = createHost({
    'clue.ship_painting': true,
    'clue.newspaper': true,
  });
  const puzzle = new SafePuzzle(safePuzzleContent, fake.host);

  const view = puzzle.submit('0314');
  assert.equal(view.solved, true);
  assert.deepEqual(view.newClueTitles, ['航运账本', '保险赔付单']);
  assert.equal(fake.state.flags['story.safe_opened'], true);
  assert.equal(fake.state.flags['story.knows_insurance_fraud'], true);
  assert.ok(fake.state.completed.has('puzzle_safe'));
  assert.ok(fake.state.discovered.has('clue_shipping_ledger'));
  assert.ok(fake.state.discovered.has('clue_insurance_policy'));
  assert.equal(puzzle.isSolved(), true);
});
