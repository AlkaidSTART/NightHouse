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
}
