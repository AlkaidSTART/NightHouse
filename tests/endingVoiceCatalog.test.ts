import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseTruthRecapDraft } from '../scripts/endingVoPlan.ts';
import { parseEndingVoiceCatalog } from '../src/content/endingVoiceCatalogData.ts';
import truthRecap from '../src/content/endingTruthRecap.json' with { type: 'json' };

const clip = {
  clipId: 'VO_Ending_TruthRecap_P01',
  group: 'TruthRecap',
  text: '正文',
  url: '/assets/audio/vo/ending/VO_Ending_TruthRecap_P01.ogg',
  durationSeconds: 1,
};

test('提交的共享回收字幕与制作文档草稿一致，ID 固定可用于无旁白字幕', () => {
  const draft = parseTruthRecapDraft(readFileSync('docs/plans/audio/ending-vo-truth-recap.md', 'utf8'));
  assert.deepEqual(truthRecap.map((paragraph) => paragraph.text), draft);
  assert.deepEqual(truthRecap.map((paragraph) => paragraph.id),
    ['VO_Ending_TruthRecap_P01', 'VO_Ending_TruthRecap_P02', 'VO_Ending_TruthRecap_P03',
      'VO_Ending_TruthRecap_P04', 'VO_Ending_TruthRecap_P05', 'VO_Ending_TruthRecap_P06']);
});

test('旁白目录校验拒绝错误版本、越界路径、重复 ID 和无效时长', () => {
  assert.equal(parseEndingVoiceCatalog({ version: 1, run: 'x', clips: [clip] }).clips.length, 1);
  assert.throws(() => parseEndingVoiceCatalog({ version: 2, run: 'x', clips: [] }), /版本/);
  assert.throws(() => parseEndingVoiceCatalog({ version: 1, run: 'x', clips: [{ ...clip, url: '/assets/audio/sfx/ending/a.ogg' }] }), /运行路径/);
  assert.throws(() => parseEndingVoiceCatalog({ version: 1, run: 'x', clips: [clip, clip] }), /重复/);
  assert.throws(() => parseEndingVoiceCatalog({ version: 1, run: 'x', clips: [{ ...clip, durationSeconds: 0 }] }), /时长/);
  assert.throws(() => parseEndingVoiceCatalog({ version: 1, run: 'x', clips: [{ ...clip, clipId: '../voice' }] }), /clipId/);
});
