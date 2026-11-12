import type { CluePriority } from './content';

export interface ClueJournalEntryView {
  id: string;
  title: string;
  description: string;
  priority: CluePriority;
  /** 发现地点；随身线索显示为「随身」。 */
  locationLabel: string;
  relatedNpcNames: readonly string[];
}

export interface ClueJournalView {
  entries: readonly ClueJournalEntryView[];
  total: number;
  mainCount: number;
  supportingCount: number;
  ambientCount: number;
}
