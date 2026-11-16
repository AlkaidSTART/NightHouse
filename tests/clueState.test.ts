import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  discoverClueState,
  reconcileClueState,
} from '../src/game/clues/clueState.ts';

test('线索状态：加载时从线索日志补齐 clue.* 与声明的剧情标记', () => {
  const state = reconcileClueState(
    { 'story.arrived': true },
    ['clue_medical_record', 'clue_bathroom_trace'],
  );

  assert.deepEqual(state.discoveredClueIds, [
    'clue_medical_record',
    'clue_bathroom_trace',
  ]);
  assert.equal(state.storyFlags['clue.medical_record'], true);
  assert.equal(state.storyFlags['clue.bathroom_trace'], true);
  assert.equal(state.storyFlags['story.knows_time_conflict'], true);
  assert.equal(state.storyFlags['story.knows_injury_at_home'], true);
  assert.equal(state.storyFlags['story.arrived'], true);
});

test('线索状态：旧存档只有 clue.* 时也会恢复线索日志', () => {
  const state = reconcileClueState(
    {
      'clue.medical_record': true,
    },
    [],
  );

  assert.deepEqual(state.discoveredClueIds, ['clue_medical_record']);
  assert.equal(state.storyFlags['story.knows_time_conflict'], true);
});

test('线索状态：重复发现修复派生标记，但不会重复计入新线索', () => {
  const result = discoverClueState(
    {},
    ['clue_medical_record'],
    'clue_medical_record',
  );

  assert.ok(result);
  assert.equal(result.firstDiscovery, false);
  assert.equal(result.storyFlags['clue.medical_record'], true);
  assert.equal(result.storyFlags['story.knows_time_conflict'], true);

  const first = discoverClueState({}, [], 'clue_bathroom_trace');
  assert.ok(first);
  assert.equal(first.firstDiscovery, true);
});

test('线索状态：未知线索 ID 不写入状态', () => {
  const result = discoverClueState({}, [], 'clue_does_not_exist');
  assert.equal(result, null);

  const loaded = reconcileClueState({}, ['clue_does_not_exist']);
  assert.deepEqual(loaded.discoveredClueIds, []);
});
