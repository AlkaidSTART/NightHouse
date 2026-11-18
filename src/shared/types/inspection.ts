import type { InspectTextStyle } from './content';

export interface InspectionSectionView {
  heading: string | null;
  style: InspectTextStyle;
  paragraphs: readonly string[];
}

export interface InspectionView {
  id: string;
  title: string;
  category: string;
  sections: readonly InspectionSectionView[];
  /** 本次阅读新记录的线索标题。 */
  newClueTitles: readonly string[];
  /** 留声机蜡筒录音按顺序播放的句级语音路径；其他检视物件为空。 */
  voiceLineUrls: readonly string[];
}
