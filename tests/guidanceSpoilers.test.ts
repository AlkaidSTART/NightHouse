import assert from 'node:assert/strict';
import { test } from 'node:test';
import { investigationThreads } from '../src/content/investigationThreads.ts';
import { clockPuzzleContent, safePuzzleContent } from '../src/content/puzzles.ts';
import { quests } from '../src/content/quests.ts';

test('玩家可见引导不提前泄露谜题答案', () => {
  const guidance = [
    ...quests.flatMap((quest) =>
      quest.steps.flatMap((step) => [
        step.objective,
        step.hint,
        ...(step.stages ?? []).flatMap((stage) => [
          stage.objective,
          stage.hint,
        ]),
      ]),
    ),
    ...investigationThreads.flatMap((thread) => [
      thread.title,
      thread.hint,
      ...thread.steps.map((step) => step.label),
    ]),
    clockPuzzleContent.definition.description,
    ...Object.values(clockPuzzleContent.texts),
    safePuzzleContent.definition.description,
    ...Object.values(safePuzzleContent.texts),
  ].join('\n');

  assert.equal(/0314|23:47/.test(guidance), false);
  assert.equal(
    /任选其一|书房抽屉取钥匙|二楼衣柜取摆锤/.test(guidance),
    false,
  );
});
