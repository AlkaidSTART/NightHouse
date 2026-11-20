#!/usr/bin/env node
/**
 * 从本地制作记录生成结局旁白目录。
 *
 * 旁白 OGG 的公开再分发权利尚未确认，因此目录只写在本机
 * `endingVoiceCatalog.local.json`（已忽略），不进入版本库。
 * 生成前逐条校验运行文件、哈希、OggS 头与时长，避免把缺文件或错文件带进演出。
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEndingVoiceCatalog } from '../src/content/endingVoiceCatalogData.ts';

const verificationPath = process.argv[2] ?? 'assets/audio/vo/vo_ending/verification_production_01.json';
const outputPath = 'endingVoiceCatalog.local.json';
const expectedGroups = {
  TruthRecap: 6,
  Signed: 8,
  RefusedStrong: 11,
  RefusedWeak: 7,
  Echo: 12,
};

const verification = JSON.parse(readFileSync(verificationPath, 'utf8'));
if (!Array.isArray(verification.clips)) throw new Error('验证报告缺少 clips。');
const run = typeof verification.run === 'string' ? verification.run : 'production_01';

const clips = verification.clips.map((clip, index) => {
  if (typeof clip.clipId !== 'string' || typeof clip.group !== 'string') throw new Error(`第 ${index + 1} 条记录不完整。`);
  if (!existsSync(clip.runtime)) throw new Error(`${clip.clipId} 缺少运行文件 ${clip.runtime}`);
  const bytes = readFileSync(clip.runtime);
  if (bytes.subarray(0, 4).toString('latin1') !== 'OggS') throw new Error(`${clip.clipId} 不是 OGG 文件。`);
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (digest !== clip.sha256) throw new Error(`${clip.clipId} 的哈希与验证报告不一致，请重新验证。`);
  if (!Number.isFinite(clip.durationSeconds) || clip.durationSeconds <= 0) throw new Error(`${clip.clipId} 缺少有效时长。`);
  return {
    clipId: clip.clipId,
    group: clip.group,
    text: clip.text,
    url: clip.runtimePath,
    durationSeconds: Math.round(clip.durationSeconds * 1000) / 1000,
  };
});

const counts = {};
for (const clip of clips) counts[clip.group] = (counts[clip.group] ?? 0) + 1;
for (const [group, expected] of Object.entries(expectedGroups)) {
  if (counts[group] !== expected) throw new Error(`${group} 应有 ${expected} 段，实际 ${counts[group] ?? 0} 段。`);
}

const catalog = parseEndingVoiceCatalog({ version: 1, run, clips });
writeFileSync(resolve(outputPath), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(JSON.stringify({ output: outputPath, run, clips: catalog.clips.length, groups: counts }));
