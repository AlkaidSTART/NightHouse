#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const sampleRate = 48000;
const sourceDir = 'assets/audio/sfx/ending/source/procedural_01';
const runtimeDir = 'public/assets/audio/sfx/ending';
mkdirSync(sourceDir, { recursive: true });
mkdirSync(runtimeDir, { recursive: true });
let seed = 18971113;
function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; }
function buffer(seconds) { return new Float64Array(Math.ceil(seconds * sampleRate)); }
function add(out, start, duration, signal) {
  const offset = Math.round(start * sampleRate);
  for (let i = 0; i < Math.ceil(duration * sampleRate) && offset + i < out.length; i++) out[offset + i] += signal(i / sampleRate);
}
function bell(out, start, altered = false, gain = 0.33) {
  const duration = altered ? 6 : 3.6;
  const partials = [1, 2.01, 2.76, 4.03, 5.4];
  add(out, start, duration, (t) => {
    const envelope = (1 - Math.exp(-t * 380)) * Math.exp(-t / (altered ? 1.9 : 1.05));
    const fade = Math.min(1, (duration - t) / 0.12);
    return gain * envelope * fade * partials.reduce((sum, partial, index) => sum + Math.sin(2 * Math.PI * 220 * partial * (altered ? 0.993 : 1) * t) / (index + 1) ** 1.8, 0);
  });
}
function clock(count, distant = false) {
  const out = buffer((count - 1) * 1.35 + (count === 13 ? 6 : 3.6));
  for (let i = 0; i < count; i++) bell(out, i * 1.35, i === 12, distant ? 0.10 : 0.33);
  return out;
}
function rustle(seconds, intensity, taps = false) {
  const out = buffer(seconds); let last = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / sampleRate;
    const noise = random();
    const high = noise - last; last = noise;
    const movement = Math.max(0, Math.sin(t * 12)) ** 5;
    out[i] = high * intensity * movement * Math.sin(Math.PI * t / seconds) ** 2;
    if (taps) out[i] += intensity * Math.sin(t * 2 * Math.PI * 155) * Math.exp(-(t % 0.7) * 55);
  }
  return out;
}
function steps(wet) {
  const out = buffer(4.2);
  for (let step = 0; step < 6; step++) {
    const gain = (wet ? 0.15 : 0.21) * (1 - step * 0.11);
    add(out, step * 0.6, 0.4, (t) => gain * (1 - Math.exp(-t * 600)) * Math.exp(-t * 24) * (Math.sin(t * Math.PI * 2 * (wet ? 100 : 78)) + random() * (wet ? 0.7 : 0.12)));
  }
  return out;
}
function latch() {
  const out = buffer(0.9);
  for (const [start, frequency, gain] of [[0.02, 330, 0.17], [0.15, 125, 0.28]]) add(out, start, 0.45, (t) => gain * (1 - Math.exp(-t * 900)) * Math.exp(-t * 30) * (Math.sin(t * 2 * Math.PI * frequency) + random() * 0.2));
  return out;
}
function bed(gramophone) {
  const out = buffer(12); let low = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / sampleRate; const n = random(); low = low * 0.98 + n * 0.02;
    // 周期包络与短淡入淡出使独立文件可循环，不在边缘留下咔哒。
    const edge = Math.min(1, t / 0.15, (12 - t) / 0.15);
    out[i] = edge * (gramophone ? n * 0.011 + low * 0.05 + 0.002 * Math.sin(2 * Math.PI * 34 * t) : low * 0.13 + n * 0.003);
  }
  return out;
}
const lastBell = buffer(6); bell(lastBell, 0, true);
const assets = [
  { id: 'clock_standard', data: clock(1), strikes: [0] },
  { id: 'clock_thirteenth', data: lastBell, strikes: [0] },
  { id: 'clock_twelve', data: clock(12), strikes: Array.from({ length: 12 }, (_, i) => i * 1.35) },
  { id: 'clock_thirteen', data: clock(13), strikes: Array.from({ length: 13 }, (_, i) => i * 1.35) },
  { id: 'clock_thirteen_distant', data: clock(13, true), strikes: Array.from({ length: 13 }, (_, i) => i * 1.35) },
  { id: 'signed_pen', data: rustle(1.9, 0.045) },
  { id: 'signed_fold', data: rustle(1.5, 0.08) },
  { id: 'refused_evidence', data: rustle(2.1, 0.075, true) },
  { id: 'refused_stairs', data: steps(false) },
  { id: 'refused_latch', data: latch() },
  { id: 'refused_departure', data: steps(true) },
  { id: 'room_rain', data: bed(false), loop: true },
  { id: 'gramophone_hiss', data: bed(true), loop: true },
];
const records = [];
for (const asset of assets) {
  const source = `${sourceDir}/${asset.id}.wav`;
  const runtime = `${runtimeDir}/${asset.id}.ogg`;
  if (existsSync(source) || existsSync(runtime)) throw new Error(`拒绝覆盖 ${asset.id}`);
  const wav = Buffer.alloc(44 + asset.data.length * 2);
  wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(asset.data.length * 2, 40);
  let peak = 0;
  for (let i = 0; i < asset.data.length; i++) { peak = Math.max(peak, Math.abs(asset.data[i])); wav.writeInt16LE(Math.round(Math.max(-0.95, Math.min(0.95, asset.data[i])) * 32767), 44 + i * 2); }
  if (peak >= 0.95) throw new Error(`峰值过大 ${asset.id}`);
  writeFileSync(source, wav, { flag: 'wx' });
  const result = spawnSync('ffmpeg', ['-nostdin', '-n', '-v', 'error', '-xerror', '-i', source, '-c:a', 'libvorbis', '-q:a', '5', runtime], { encoding: 'utf8', timeout: 30000, windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(`转码失败 ${asset.id}`);
  records.push({ id: asset.id, source, runtime, durationSeconds: asset.data.length / sampleRate, peakDbfs: 20 * Math.log10(peak), strikes: asset.strikes ?? [], loop: asset.loop ?? false, sha256: createHash('sha256').update(readFileSync(runtime)).digest('hex') });
}
writeFileSync('assets/audio/sfx/ending/generation_procedural_01.json', JSON.stringify({ generatedAt: new Date().toISOString(), generator: 'scripts/generateEndingSfx.mjs', seed: 18971113, source: 'Original procedural synthesis: additive decaying bell partials, seeded filtered noise and transient envelopes. No samples or third-party recordings.', license: 'Project-authored original assets; same usage terms as this repository. No third-party attribution required.', quality: 'Technically checked; subjective realism requires listening. No claim of historical field recording.', sampleRate, assets: records }, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(records.map(({ id, durationSeconds, strikes }) => ({ id, durationSeconds, strikes: strikes.length })), null, 2));
