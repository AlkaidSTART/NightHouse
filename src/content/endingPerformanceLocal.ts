import { localVoiceCatalog } from './endingVoiceCatalog';
import { buildEndingPerformance as build } from './endingPerformance';
import effects from './endingAudioAssets.json' with { type: 'json' };
import type { StoryFlagValue } from '../shared/types/content';
import type { EndingView } from '../shared/types/ending';
import type { EndingPerformance } from './endingPerformance';

/** 结局演出的运行入口：字幕来自正文与共享稿，旁白目录只在本机可用时注入。 */
export function buildEndingPerformance(
  ending: EndingView,
  flags: Readonly<Record<string, StoryFlagValue>>,
): EndingPerformance | null {
  return build(ending, flags, localVoiceCatalog, effects.effects);
}
