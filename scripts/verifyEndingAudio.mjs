#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from 'node:fs';
import { buildEndingVoClips, parseTruthRecapDraft } from './endingVoPlan.ts';

const recordPath = 'assets/audio/vo/vo_ending/generation_production_production_01.json';
const record = JSON.parse(readFileSync(recordPath, 'utf8'));
const clips = buildEndingVoClips(parseTruthRecapDraft(readFileSync('docs/plans/audio/ending-vo-truth-recap.md', 'utf8')));
assert.equal(record.status, 'generated_pending_listening_and_license_review');
assert.equal(record.clips.length, clips.length);
assert.equal(record.voice, undefined); // voice is recorded per clip
const sfx = JSON.parse(readFileSync('assets/audio/sfx/ending/generation_procedural_01.json', 'utf8'));
function command(file, args) {
  const result = spawnSync(file, args, { encoding: 'utf8', timeout: 30000, windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(`验证失败 ${file}: ${result.error?.message || result.stderr}`);
  return result;
}
function inspect(file, rate, measure = false) {
  const probe = JSON.parse(command('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,sample_rate,channels:format=duration', '-of', 'json', file]).stdout);
  assert.equal(probe.streams.length, 1);
  assert.equal(Number(probe.streams[0].sample_rate), rate);
  assert.equal(probe.streams[0].channels, 1);
  const result = command('ffmpeg', ['-nostdin', '-hide_banner', '-v', measure ? 'info' : 'error', '-xerror', '-i', file,
    ...(measure ? ['-af', 'loudnorm=I=-20:TP=-3.5:LRA=7:print_format=json'] : []), '-f', 'null', '-']);
  let loudness;
  if (measure) {
    const json = /\{[\s\S]*?"input_i"[\s\S]*?\}/.exec(result.stderr)?.[0];
    assert.ok(json);
    const data = JSON.parse(json);
    loudness = { integratedLufs: Number(data.input_i), truePeakDbtp: Number(data.input_tp), rangeLu: Number(data.input_lra) };
    assert.ok(Number.isFinite(loudness.integratedLufs));
    assert.ok(loudness.truePeakDbtp < -2.5, `真峰值超标 ${file}`);
  }
  return { durationSeconds: Number(probe.format.duration), sampleRate: rate, channels: 1, bytes: statSync(file).size,
    sha256: createHash('sha256').update(readFileSync(file)).digest('hex'), decode: 'passed', ...(loudness && { loudness }) };
}
const verified = [];
for (const clip of clips) {
  const generated = record.clips.find((item) => item.clipId === clip.clipId);
  assert.ok(generated);
  assert.equal(generated.text, clip.text);
  assert.equal(generated.instruction, clip.instruction);
  assert.equal(generated.voice, 'longanlingxin_v3.1');
  const original = readFileSync(generated.output);
  const normalized = readFileSync(generated.normalized);
  assert.ok(original.subarray(44).equals(normalized.subarray(44)));
  inspect(generated.normalized, 24000);
  const source = generated.output.replace(/\.wav$/, '.ogg');
  const info = inspect(source, 48000, true);
  const destination = `public${clip.runtimePath}`;
  if (existsSync(destination)) {
    assert.equal(createHash('sha256').update(readFileSync(destination)).digest('hex'), info.sha256, `运行文件与已生成源不同，不覆盖：${destination}`);
  } else {
    mkdirSync('public/assets/audio/vo/ending', { recursive: true });
    copyFileSync(source, destination);
  }
  verified.push({ ...clip, ...info, voice: generated.voice, source: generated.output, normalized: generated.normalized, runtime: destination });
}
const effects = [];
for (const effect of sfx.assets) {
  const info = inspect(effect.runtime, 48000, true);
  assert.equal(info.sha256, effect.sha256);
  effects.push({ ...effect, ...info });
}
const report = { verifiedAt: new Date().toISOString(), model: record.model, voice: 'longanlingxin_v3.1',
  voCount: verified.length, sfxCount: effects.length,
  totalVoiceSeconds: verified.reduce((sum, clip) => sum + clip.durationSeconds, 0),
  license: 'Bailian official service output; provider terms and system-voice rights require release review; procedural SFX original project assets',
  listening: 'pending_manual_review', clips: verified, effects };
writeFileSync('assets/audio/vo/vo_ending/verification_production_01.json', JSON.stringify(report, null, 2) + '\n');
writeFileSync('src/content/endingAudioAssets.json', JSON.stringify({
  model: report.model, voice: report.voice,
  clips: verified.map(({ clipId, group, text, runtimePath, durationSeconds }) => ({ clipId, group, text, url: runtimePath, durationSeconds })),
  effects: effects.map(({ id, runtime, durationSeconds }) => ({ id, url: `/${runtime.slice('public/'.length)}`, durationSeconds })),
}, null, 2) + '\n');
console.log(JSON.stringify({ voCount: report.voCount, sfxCount: report.sfxCount, totalVoiceSeconds: report.totalVoiceSeconds }, null, 2));
