#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { normalizeProviderWav } from './normalizeProviderWav.mjs';
import {
  buildEndingVoClips, buildEndingVoSamples, ENDING_VO_CANDIDATES, ENDING_VO_MODEL,
  parseTruthRecapDraft,
} from './endingVoPlan.ts';

const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));

function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      execute: { type: 'boolean', default: false },
      voice: { type: 'string' },
      'run-id': { type: 'string' },
      'approved-text-sha256': { type: 'string' },
    },
  });
  const mode = positionals[0] ?? 'samples';
  if (positionals.length > 1 || !['samples', 'production'].includes(mode)) throw new Error('用法：samples | production [--voice 音色] [--execute --run-id 批次名]。默认仅预览。');
  if (values.voice && !ENDING_VO_CANDIDATES.some((candidate) => candidate.voice === values.voice)) throw new Error('请选择制作清单中的候选音色。');
  if (mode === 'samples' && (values.voice || values['approved-text-sha256'])) throw new Error('samples 使用完整三音色对比，不接受 production 参数。');
  const draft = readFileSync(resolve(root, 'docs/plans/audio/ending-vo-truth-recap.md'), 'utf8');
  const clips = buildEndingVoClips(parseTruthRecapDraft(draft));
  const textSha256 = createHash('sha256').update(JSON.stringify({ model: ENDING_VO_MODEL, clips })).digest('hex');
  const runId = values['run-id'] ?? 'preview';
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(runId)) throw new Error('run-id 仅允许小写字母、数字、下划线和连字符，最多 64 字符。');
  if (mode === 'production' && !values.voice) throw new Error('production 需要 --voice，必须先试听并选定音色。');
  const tasks = mode === 'samples'
    ? buildEndingVoSamples(clips).map((sample) => ({ ...sample, output: sample.output.replace('/samples/', `/samples/${runId}/`) }))
    : clips.map((clip) => ({
      clipId: clip.clipId, voice: values.voice, text: clip.text,
      instruction: clip.instruction, estimatedSeconds: clip.estimatedSeconds,
      output: `assets/audio/vo/vo_ending/source/${runId}/${clip.clipId}.wav`,
    }));
  console.log(JSON.stringify({
    mode, execute: values.execute, model: ENDING_VO_MODEL, textSha256,
    calls: tasks.length, characters: tasks.reduce((sum, task) => sum + task.text.length, 0),
    estimatedSeconds: Math.round(tasks.reduce((sum, task) => sum + task.estimatedSeconds, 0) * 10) / 10,
    nativeSampleRate: 24000, runtimeSampleRate: 48000,
    note: '仅估算，生成后需试听与核对授权；24 kHz 源重采样不会增加真实细节。',
    tasks: tasks.map(({ clipId, voice, text, output }) => ({ clipId, voice, text, output })),
  }, null, 2));
  if (!values.execute) return;
  if (!values['run-id']) throw new Error('执行需要独立 --run-id；不覆盖已有批次。');
  if (mode === 'production' && values['approved-text-sha256'] !== textSha256) {
    throw new Error('完整文案仍待确认。先预览并人工确认文案、音色与统一转述方式，再传入对应 --approved-text-sha256。');
  }
  const skillScript = process.env.BAILIAN_TTS_SCRIPT;
  if (!skillScript || !isAbsolute(skillScript) || !existsSync(skillScript)) throw new Error('请设置 BAILIAN_TTS_SCRIPT 为 bailian-tts/scripts/tts.mjs 的绝对路径。');
  if (!process.env['Bailian-KEY']?.trim()) throw new Error('未配置 Bailian-KEY；不要将 Key 写入命令或制作清单。');
  if (!process.env.BAILIAN_TTS_ORIGIN?.trim()) throw new Error('请设置 BAILIAN_TTS_ORIGIN 为已确认的百炼官方业务空间 HTTPS origin。');
  const ffmpegCheck = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (ffmpegCheck.error || ffmpegCheck.status !== 0) throw new Error('找不到可用的 ffmpeg，未发起合成。');
  const recordPath = `assets/audio/vo/vo_ending/generation_${mode}_${runId}.json`;
  // 付费调用前检查整个批次，不允许写到半途才发现目标已存在。
  for (const file of [recordPath, ...tasks.flatMap((task) => [task.output, task.output.replace(/\.wav$/, '_normalized.wav'), task.output.replace(/\.wav$/, '.ogg')])]) {
    ensureLocalParent(file);
    if (existsSync(resolve(root, file))) throw new Error(`目标已存在，不会覆盖：${file}`);
  }
  const record = {
    model: ENDING_VO_MODEL, mode, runId, textSha256,
    startedAt: new Date().toISOString(), status: 'in_progress',
    license: 'pending_review', listening: 'pending_review',
    nativeSampleRate: 24000, renderedSampleRate: 48000,
    processing: 'Provider WAV retained; normalized copy corrects RIFF/data lengths without changing PCM; ffmpeg loudnorm I=-20 TP=-3.5 LRA=7; OGG Vorbis q5 mono; measure final encoded audio before publishing',
    clips: [],
  };
  writeFileSync(resolve(root, recordPath), JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
  try {
    for (const task of tasks) {
      const result = spawnSync(process.execPath, [skillScript,
        'say', '--model', ENDING_VO_MODEL, '--voice', task.voice,
        '--text', task.text, '--instruction', task.instruction, '--out', task.output,
      ], { cwd: root, encoding: 'utf8', timeout: 65_000, windowsHide: true });
      if (result.error || result.status !== 0) throw new Error(`合成失败：${task.clipId}（退出码 ${result.status ?? 'unknown'}）；已停止，检查源文件与记录后使用新批次名。`);
      const receipt = JSON.parse(result.stdout);
      assert.equal(receipt.output, task.output);
      assert.equal(receipt.model, ENDING_VO_MODEL);
      assert.equal(receipt.voice, task.voice);
      const normalized = task.output.replace(/\.wav$/, '_normalized.wav');
      writeFileSync(resolve(root, normalized), normalizeProviderWav(readFileSync(resolve(root, task.output))), { flag: 'wx' });
      record.clips.push({ ...task, normalized, generatedAt: new Date().toISOString(), renderStatus: 'pending' });
      saveRecord(recordPath, record);
      const render = spawnSync('ffmpeg', ['-nostdin', '-n', '-v', 'error', '-xerror', '-i', resolve(root, normalized),
        '-af', 'loudnorm=I=-20:TP=-3.5:LRA=7', '-ar', '48000', '-ac', '1', '-c:a', 'libvorbis', '-q:a', '5',
        resolve(root, task.output.replace(/\.wav$/, '.ogg')),
      ], { encoding: 'utf8', timeout: 30_000, windowsHide: true });
      if (render.error || render.status !== 0) throw new Error(`转码失败：${task.clipId}；WAV 已保留，未继续调用。`);
      record.clips.at(-1).renderStatus = 'rendered_pending_listening';
      saveRecord(recordPath, record);
      console.log(`已生成并转码 ${task.clipId}`);
    }
    record.status = 'generated_pending_listening_and_license_review';
    saveRecord(recordPath, record);
  } catch (error) {
    record.status = 'failed_stopped';
    saveRecord(recordPath, record);
    throw error;
  }
}

function ensureLocalParent(file) {
  let current = root;
  for (const part of file.split('/').slice(0, -1)) {
    if (!/^[a-z0-9][a-z0-9_.-]*$/.test(part) || part === '.' || part === '..') throw new Error('输出目录不合法。');
    current = resolve(current, part);
    if (existsSync(current)) {
      const stat = lstatSync(current);
      if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('输出目录不能经过符号链接或非目录文件。');
    } else {
      mkdirSync(current);
    }
  }
}

function saveRecord(file, record) {
  writeFileSync(resolve(root, file), JSON.stringify(record, null, 2) + '\n');
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : '制作失败。');
  process.exitCode = 1;
}
