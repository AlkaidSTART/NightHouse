import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CLUE_FLAGS } from '../src/content/clues.ts';
import { investigationThreads } from '../src/content/investigationThreads.ts';
import { KNOWN_STORY_FLAGS } from '../src/content/storyFlags.ts';
import { resolveInvestigationThreads } from '../src/game/story/investigationProgress.ts';

const knownFlags = new Set<string>([...KNOWN_STORY_FLAGS, ...CLUE_FLAGS]);

test('调查线：每一步都引用已登记的线索或剧情标记', () => {
  for (const thread of investigationThreads) {
    assert.ok(thread.title.trim().length > 0, `${thread.id} 缺少标题`);
    assert.ok(thread.hint.trim().length > 0, `${thread.id} 缺少提示`);
    assert.ok(thread.steps.length > 0, `${thread.id} 没有调查步骤`);
    for (const step of thread.steps) {
      assert.ok(
        knownFlags.has(step.flag),
        `${thread.id} 引用了未登记的标记 ${step.flag}`,
      );
    }
  }
});

test('调查线：按标记推导计数，集齐后才标记完成', () => {
  const cause = investigationThreads.find(
    (thread) => thread.id === 'thread_scene',
  );
  assert.ok(cause);

  const partial = resolveInvestigationThreads(
    {
      'clue.medical_record': true,
      'clue.bathroom_trace': true,
      'story.doctor_confessed': true,
    },
    [cause],
  )[0];
  assert.ok(partial);
  assert.equal(partial.found, 3);
  assert.equal(partial.total, 4);
  assert.equal(partial.complete, false);

  const complete = resolveInvestigationThreads(
    {
      'clue.medical_record': true,
      'clue.bathroom_trace': true,
      'story.doctor_confessed': true,
      'story.doctor_motive_known': true,
    },
    [cause],
  )[0];
  assert.ok(complete);
  assert.equal(complete.found, 4);
  assert.equal(complete.complete, true);
});
