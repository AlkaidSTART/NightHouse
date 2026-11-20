import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildEndingVoClips,
  buildEndingVoSamples,
  ENDING_VO_CANDIDATES,
  ENDING_VO_MODEL,
  parseTruthRecapDraft,
} from './endingVoPlan.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'assets/audio/vo/ending_manifest');
const clips = buildEndingVoClips(parseDraft());
const samples = buildEndingVoSamples(clips);
const groups = [...new Set(clips.map((clip) => clip.group))];
const rows = groups.map((group) => {
  const groupClips = clips.filter((clip) => clip.group === group);
  return {
    group,
    clips: groupClips.length,
    characters: groupClips.reduce((sum, clip) => sum + clip.text.length, 0),
    estimatedSeconds: Math.round(groupClips.reduce((sum, clip) => sum + clip.estimatedSeconds, 0)),
    runtimeFilesPresent: groupClips.filter((clip) => existsSync(resolve(root, `public${clip.runtimePath}`))).length,
  };
});
const manifest = {
  version: 1,
  status: 'prepared_pending_text_voice_and_synthesis_approval',
  model: ENDING_VO_MODEL,
  sourceFormat: 'WAV; skill default native 24 kHz; do not label resampling as native 48 kHz',
  runtimeFormat: 'OGG Vorbis 48 kHz mono; generation and listening not yet performed',
  candidates: ENDING_VO_CANDIDATES,
  summary: rows,
  clips,
  samples,
};
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'ending_vo.json'), `${JSON.stringify(manifest, null, 2)}\n`);
const csvCell = (value: string | number | null): string => `"${String(value ?? '').replaceAll('"', '""')}"`;
writeFileSync(resolve(outDir, 'ending_vo.csv'), '\uFEFF' + [
  ['clipId', 'group', 'paragraph', 'text', 'instruction', 'review', 'condition', 'estimatedSeconds', 'source', 'runtimePath'],
  ...clips.map((clip) => [clip.clipId, clip.group, clip.paragraph, clip.text, clip.instruction, clip.review, clip.condition, clip.estimatedSeconds, clip.source, clip.runtimePath]),
].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n');
const totalSeconds = samples.reduce((sum, sample) => sum + sample.estimatedSeconds, 0);
writeFileSync(resolve(outDir, 'README.md'), `# 结局配音制作清单\n\n由 \`npm run export:ending-vo\` 生成。不要手改 JSON / CSV；分支文本来自运行数据，共享回收稿来自计划文档。\n\n状态：已准备，尚未合成、试听、确认音色或授权。不得凭清单存在标记音频完成。\n\n| 分组 | 条数 | 字符（含标点） | 预计秒数 | 运行文件存在 |\n|---|---:|---:|---:|---:|\n${rows.map((row) => `| ${row.group} | ${row.clips} | ${row.characters} | ${row.estimatedSeconds} | ${row.runtimeFilesPresent} |`).join('\n')}\n\nSigned 的最后一段仅在 hasAnyEvidence 为 true 时播放。四个分支共享同一套 TruthRecap，不重复制作共享段。\n\n## 试听批次\n\n模型：\`${ENDING_VO_MODEL}\`。3 种音色 × 3 条短句 = ${samples.length} 次付费调用，预计总时长 ${totalSeconds.toFixed(1)} 秒；按每秒 3.5 个非标点字符估算，实际时长以输出为准。\n\n${ENDING_VO_CANDIDATES.map((candidate) => `- ${candidate.name}（\`${candidate.voice}\`）：${candidate.note}。`).join('\n')}\n\n短句覆盖案件因果、克罗斯的名字与年龄、弱拒签收束；每条先控制在 10 秒内。正文与样音均使用同一叙述者转述引语，作为试听方案，仍需听后确认。\n\n## 下一步\n\n1. \`npm run tts:ending -- samples\` 离线预览，不联网。\n2. 用户确认这 9 次调用后，设置 BAILIAN_TTS_SCRIPT 与 BAILIAN_TTS_ORIGIN，再加 \`--execute\` 生成源 WAV。\n3. 试听选定音色、确认完整文案和统一旁白方案后，才执行 production；不能将样音放入运行目录。\n4. 运行文件缺失时继续保留现有结局流程；播放器接入、音效制作与浏览器验证在后续批次完成。\n\n源文件不会提交；生成记录会保存请求正文、音色、指令与完成时间，绝不记录 Key 或带签名的下载 URL。商用许可与署名要求仍待核对。\n`);
console.log(JSON.stringify({ clips: clips.length, groups: rows, samples: samples.length, sampleEstimatedSeconds: Math.round(totalSeconds * 10) / 10 }, null, 2));

function parseDraft(): string[] {
  return parseTruthRecapDraft(readFileSync(resolve(root, 'docs/plans/audio/ending-vo-truth-recap.md'), 'utf8'));
}
