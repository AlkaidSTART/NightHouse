import catalog from 'virtual:ending-voice-catalog';
import type { EndingVoiceCatalog } from './endingVoiceCatalogData';

/**
 * 本机旁白目录。公开构建没有 `endingVoiceCatalog.local.json` 时为空目录，
 * 结局回退为完整字幕加原创音效。
 */
export const localVoiceCatalog: EndingVoiceCatalog = catalog;

export const hasLocalVoiceClips = catalog.clips.length > 0;
