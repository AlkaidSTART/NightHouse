import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  migrateSaveData,
  SAVE_SCHEMA_VERSION,
} from '../src/game/save/SaveManager.ts';

function legacySave(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    updatedAt: 1,
    currentSceneId: 'villa_entry',
    player: {
      position: [0, 1.7, 4],
      rotation: [0, 0, 0],
    },
    storyFlags: {},
    discoveredClueIds: [],
    completedPuzzleIds: [],
    completedQuestIds: [],
    npcStates: {},
    choices: {},
    ...overrides,
  };
}

test('存档迁移：v1 线索日志会补写缺失的线索与剧情标记', () => {
  const migrated = migrateSaveData(
    legacySave({
      discoveredClueIds: ['clue_medical_record', 'clue_bathroom_trace'],
    }),
  );

  assert.ok(migrated);
  assert.equal(migrated.schemaVersion, SAVE_SCHEMA_VERSION);
  assert.equal(migrated.storyFlags['clue.medical_record'], true);
  assert.equal(migrated.storyFlags['clue.bathroom_trace'], true);
  assert.equal(migrated.storyFlags['story.knows_time_conflict'], true);
  assert.equal(migrated.storyFlags['story.knows_injury_at_home'], true);
});

test('存档迁移：未来版本与损坏字段仍会被拒绝', () => {
  assert.equal(
    migrateSaveData(legacySave({ schemaVersion: SAVE_SCHEMA_VERSION + 1 })),
    null,
  );
  assert.equal(
    migrateSaveData(legacySave({ discoveredClueIds: 'not-an-array' })),
    null,
  );
});
