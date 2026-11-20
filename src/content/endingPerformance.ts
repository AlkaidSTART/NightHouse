import truthRecap from './endingTruthRecap.json' with { type: 'json' };
import { isStrongRefusal } from './endings.ts';
import type { StoryFlagValue } from '../shared/types/content';
import type { EndingView } from '../shared/types/ending';
import type { EndingVoiceCatalog, EndingVoiceGroup } from './endingVoiceCatalogData';

export interface EndingParagraph {
  id: string;
  text: string;
  section: 'truth' | 'ending';
}

export type EndingAudioStep =
  | { kind: 'voice'; url: string; durationSeconds: number; paragraphId: string; accentUrl?: string }
  | { kind: 'effect'; url: string; durationSeconds: number; gain: number; label: string }
  | { kind: 'silence'; milliseconds: number; quiet: boolean };

export interface EndingEffectRecord {
  id: string;
  url: string;
  durationSeconds: number;
}

export interface EndingPerformance {
  paragraphs: readonly EndingParagraph[];
  steps: readonly EndingAudioStep[];
  roomUrl: string;
  gramophoneUrl: string | null;
  /** 旁白缺失或不匹配时为 false：完整字幕照常显示，只播放原创音效。 */
  voiceAvailable: boolean;
}

function resolveGroup(ending: EndingView, flags: Readonly<Record<string, StoryFlagValue>>): EndingVoiceGroup | null {
  if (ending.id === 'ending_signed') return 'Signed';
  if (ending.id === 'ending_echo') return 'Echo';
  if (ending.id === 'ending_refused') return isStrongRefusal(flags) ? 'RefusedStrong' : 'RefusedWeak';
  return null;
}

/**
 * 把字幕与音频步骤对齐。
 *
 * 旁白目录只在本机存在；没有目录、正文改动或目录缺段时，
 * 复用已确认的共享回收稿和运行正文生成完整字幕，并退化为音效演出。
 */
export function buildEndingPerformance(
  ending: EndingView,
  flags: Readonly<Record<string, StoryFlagValue>>,
  catalog: EndingVoiceCatalog,
  effects: readonly EndingEffectRecord[],
): EndingPerformance | null {
  const group = resolveGroup(ending, flags);
  if (!group) return null;

  const recordedTruth = catalog.clips.filter((clip) => clip.group === 'TruthRecap');
  const recordedBranch = catalog.clips.filter((clip) => clip.group === group).slice(0, ending.paragraphs.length);
  const truthRecorded = recordedTruth.length === truthRecap.length
    && recordedTruth.every((clip, index) => clip.text === truthRecap[index]?.text);
  const branchRecorded = recordedBranch.length === ending.paragraphs.length
    && recordedBranch.every((clip, index) => clip.text === ending.paragraphs[index]);
  const voiceAvailable = truthRecorded && branchRecorded;

  const truthParagraphs: EndingParagraph[] = truthRecorded
    ? recordedTruth.map((clip) => ({ id: clip.clipId, text: clip.text, section: 'truth' }))
    : truthRecap.map((clip) => ({ id: clip.id, text: clip.text, section: 'truth' }));
  const branchParagraphs: EndingParagraph[] = branchRecorded
    ? recordedBranch.map((clip) => ({ id: clip.clipId, text: clip.text, section: 'ending' }))
    : ending.paragraphs.map((text, index) => ({
      id: `VO_Ending_${group}_P${String(index + 1).padStart(2, '0')}`,
      text,
      section: 'ending',
    }));
  const paragraphs = [...truthParagraphs, ...branchParagraphs];

  const effect = (id: string, gain = 0.65, label = '钟声'): EndingAudioStep => {
    const asset = effects.find((item) => item.id === id);
    if (!asset) throw new Error(`缺少结局音效定义 ${id}`);
    return { kind: 'effect', url: asset.url, durationSeconds: asset.durationSeconds, gain, label };
  };
  const effectUrl = (id: string): string => {
    const asset = effects.find((item) => item.id === id);
    if (!asset) throw new Error(`缺少结局音效定义 ${id}`);
    return asset.url;
  };

  const steps: EndingAudioStep[] = [];
  if (voiceAvailable) {
    for (const clip of [...recordedTruth, ...recordedBranch]) {
      const inBranch = clip.group !== 'TruthRecap';
      let accentUrl: string | undefined;
      if (inBranch) {
        if (group === 'Signed' && clip.clipId.endsWith('P01')) accentUrl = effectUrl('signed_pen');
        if (group === 'Signed' && clip.clipId.endsWith('P02')) accentUrl = effectUrl('signed_fold');
        if (group === 'RefusedStrong' && clip.clipId.endsWith('P03')) accentUrl = effectUrl('refused_evidence');
        if (group === 'RefusedStrong' && clip.clipId.endsWith('P04')) accentUrl = effectUrl('refused_stairs');
        if (group === 'RefusedWeak' && clip.clipId.endsWith('P04')) accentUrl = effectUrl('refused_latch');
        if (group === 'RefusedWeak' && clip.clipId.endsWith('P05')) accentUrl = effectUrl('refused_departure');
      }
      steps.push({ kind: 'voice', url: clip.url, durationSeconds: clip.durationSeconds, paragraphId: clip.clipId, ...(accentUrl && { accentUrl }) });
      if (inBranch && group === 'Echo' && clip.clipId.endsWith('P05')) {
        // 点名后全静音再敲钟；P06–P09 继续原文回述现场，不重复敲第二次。
        steps.push({ kind: 'silence', milliseconds: 1000, quiet: true }, effect('clock_thirteen'));
      } else if (inBranch && group === 'Signed' && clip.clipId.endsWith('P03')) {
        steps.push(effect('clock_thirteen_distant', 0.5));
      } else if (inBranch && group === 'RefusedWeak' && clip.clipId.endsWith('P04')) {
        steps.push(effect('clock_twelve', 0.5));
      } else {
        steps.push({ kind: 'silence', milliseconds: 650, quiet: false });
      }
    }
    // 权威拒签文档 §9：变卖后的收尾回响是单独的第十三下，不改写原正文。
    if (group === 'RefusedStrong') steps.push(effect('clock_thirteenth', 0.5));
    steps.push({ kind: 'silence', milliseconds: 2500, quiet: false });
  } else {
    // 无旁白时保留该分支的标志性钟声与房间底噪，不伪造旁白时间轴。
    const clock = group === 'Signed' ? 'clock_thirteen_distant'
      : group === 'RefusedWeak' ? 'clock_twelve'
        : group === 'Echo' ? 'clock_thirteen' : 'clock_thirteenth';
    steps.push({ kind: 'silence', milliseconds: 400, quiet: false }, effect(clock, 0.5), { kind: 'silence', milliseconds: 2500, quiet: false });
  }

  return {
    paragraphs,
    steps,
    roomUrl: effectUrl('room_rain'),
    gramophoneUrl: group === 'Echo' ? effectUrl('gramophone_hiss') : null,
    voiceAvailable,
  };
}
