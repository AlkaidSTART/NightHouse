import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { presentEnding } from '../src/content/endings.ts';
import {
  buildEndingVoClips,
  buildEndingVoSamples,
  parseTruthRecapDraft,
} from '../scripts/endingVoPlan.ts';

const draft = readFileSync('docs/plans/audio/ending-vo-truth-recap.md', 'utf8');
const truth = parseTruthRecapDraft(draft);
const clips = buildEndingVoClips(truth);

test('结局配音清单与实际四分支逐段一致，包含签署证据附加段', () => {
  const variants = [
    { group: 'Signed', id: 'ending_signed', flags: { 'clue.shipping_ledger': true } },
    { group: 'RefusedStrong', id: 'ending_refused', flags: { 'story.evidence_presented': true, 'clue.shipping_ledger': true, 'clue.insurance_policy': true } },
    { group: 'RefusedWeak', id: 'ending_refused', flags: {} },
    { group: 'Echo', id: 'ending_echo', flags: {} },
  ] as const;
  for (const variant of variants) {
    assert.deepEqual(clips.filter((clip) => clip.group === variant.group).map((clip) => clip.text), presentEnding(variant.id, variant.flags)?.paragraphs);
  }
  assert.equal(clips.filter((clip) => clip.group === 'TruthRecap').length, 6);
  assert.deepEqual(clips.filter((clip) => clip.condition !== null).map((clip) => clip.clipId), ['VO_Ending_Signed_P08']);
  assert.equal(new Set(clips.map((clip) => clip.runtimePath)).size, clips.length);
});

test('共享草稿保持待审状态，文档结构或长度不符合要求时阻止导出', () => {
  assert.ok(clips.filter((clip) => clip.group === 'TruthRecap').every((clip) => clip.review === 'draft'));
  assert.throws(() => parseTruthRecapDraft('## 用途\n正文'), /文案草稿/);
  assert.throws(() => parseTruthRecapDraft('## 文案草稿\n> 只有一段\n\n## 用途'), /6 个/);
  assert.throws(() => buildEndingVoClips(['只给一段']), /6 段/);
  assert.throws(() => buildEndingVoClips(['长'.repeat(601), ...truth.slice(1)]), /超过/);
});

test('样音逐字取自正文，9 条均低于 10 秒预算；正文改动需重选样音', () => {
  const samples = buildEndingVoSamples(clips);
  assert.equal(samples.length, 9);
  assert.equal(new Set(samples.map((sample) => sample.output)).size, 9);
  assert.ok(samples.every((sample) => sample.estimatedSeconds < 10));
  assert.throws(() => buildEndingVoSamples(clips.filter((clip) => clip.group !== 'Echo')), /失配/);
});

test('已导出的 JSON 与文本源一致，防止旧清单继续用于制作', () => {
  const manifest = JSON.parse(readFileSync('assets/audio/vo/ending_manifest/ending_vo.json', 'utf8')) as { clips: unknown; samples: unknown };
  assert.deepEqual(manifest.clips, clips);
  assert.deepEqual(manifest.samples, buildEndingVoSamples(clips));
});

test('合成工具默认仅预览；全量合成必须核对文案摘要', () => {
  const preview = JSON.parse(execFileSync('node', ['scripts/synthesizeEndingVo.mjs', 'samples'], { encoding: 'utf8' })) as {
    execute: boolean; calls: number; estimatedSeconds: number; textSha256: string;
  };
  assert.equal(preview.execute, false);
  assert.equal(preview.calls, 9);
  assert.ok(preview.estimatedSeconds > 0);
  assert.equal(preview.textSha256.length, 64);
  assert.throws(() => execFileSync('node', [
    'scripts/synthesizeEndingVo.mjs', 'production', '--voice', 'longanlingxin_v3.1',
    '--execute', '--run-id', 'unapproved-test', '--approved-text-sha256', 'incorrect',
  ], { encoding: 'utf8' }), /完整文案仍待确认/);
});
