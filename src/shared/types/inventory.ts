import type { ItemCategory } from './content';

export type InventoryItemStatus = 'usable' | 'used';

export interface InventoryItemView {
  id: string;
  title: string;
  category: ItemCategory;
  status: InventoryItemStatus;
  statusLabel: string;
  sourceLabel: string;
  targetLabel: string;
  targetRegionLabel: string;
  isAtTargetRegion: boolean;
  description: string;
  usage: string;
}

export interface InventoryView {
  items: readonly InventoryItemView[];
  total: number;
  keyCount: number;
  usableCount: number;
  usedCount: number;
}
