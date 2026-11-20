/**
 * 结局旁白目录的类型与校验。
 *
 * 旁白 OGG 的公开再分发权利尚未确认，因此运行目录只作为本地资产：
 * `endingVoiceCatalog.local.json` 不进入版本库，构建时由 Vite 插件注入。
 * 缺少目录时结局仍显示完整字幕并播放原创音效。
 */

export const ENDING_VOICE_GROUPS = [
  'TruthRecap',
  'Signed',
  'RefusedStrong',
  'RefusedWeak',
  'Echo',
] as const;

export type EndingVoiceGroup = (typeof ENDING_VOICE_GROUPS)[number];

export interface EndingVoiceClipRecord {
  clipId: string;
  group: EndingVoiceGroup;
  text: string;
  url: string;
  durationSeconds: number;
}

export interface EndingVoiceCatalog {
  version: 1;
  run: string;
  clips: readonly EndingVoiceClipRecord[];
}

export const EMPTY_VOICE_CATALOG: EndingVoiceCatalog = {
  version: 1,
  run: 'none',
  clips: [],
};

const CLIP_ID = /^VO_Ending_[A-Za-z]+_P\d{2}$/;
const VOICE_URL = /^\/assets\/audio\/vo\/ending\/[A-Za-z0-9_]+\.ogg$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readClip(value: unknown, index: number): EndingVoiceClipRecord {
  if (!isRecord(value)) throw new Error(`旁白目录第 ${index + 1} 条不是对象。`);
  const { clipId, group, text, url, durationSeconds } = value;
  if (typeof clipId !== 'string' || !CLIP_ID.test(clipId)) {
    throw new Error(`旁白目录第 ${index + 1} 条的 clipId 不合法。`);
  }
  if (typeof group !== 'string' || !(ENDING_VOICE_GROUPS as readonly string[]).includes(group)) {
    throw new Error(`${clipId} 的 group 不合法。`);
  }
  if (typeof text !== 'string' || text.trim().length === 0 || text.length > 600) {
    throw new Error(`${clipId} 的正文为空或超过单次合成上限。`);
  }
  if (typeof url !== 'string' || !VOICE_URL.test(url)) {
    throw new Error(`${clipId} 的运行路径不在 /assets/audio/vo/ending/ 下。`);
  }
  if (typeof durationSeconds !== 'number' || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error(`${clipId} 的时长必须是正数。`);
  }
  return { clipId, group: group as EndingVoiceGroup, text, url, durationSeconds };
}

/** 运行时校验外部或本地目录；损坏的数据直接报错，不带着半份目录播放。 */
export function parseEndingVoiceCatalog(value: unknown): EndingVoiceCatalog {
  if (!isRecord(value)) throw new Error('旁白目录必须是对象。');
  if (value.version !== 1) throw new Error('旁白目录版本不受支持。');
  if (typeof value.run !== 'string' || value.run.length === 0) throw new Error('旁白目录缺少批次名。');
  if (!Array.isArray(value.clips)) throw new Error('旁白目录缺少 clips 数组。');
  const clips = value.clips.map(readClip);
  const ids = new Set<string>();
  for (const clip of clips) {
    if (ids.has(clip.clipId)) throw new Error(`旁白目录重复的 clipId：${clip.clipId}`);
    ids.add(clip.clipId);
  }
  return { version: 1, run: value.run, clips };
}
