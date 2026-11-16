import type { ItemDefinition } from '../../shared/types/content';
import type {
  InventoryItemStatus,
  InventoryItemView,
  InventoryView,
} from '../../shared/types/inventory';
import { isConditionMet, type StoryFlags } from '../story/conditions.ts';

export interface InventorySources {
  items: readonly ItemDefinition[];
  flags: StoryFlags;
  regionNames: ReadonlyMap<string, string>;
  currentRegionId?: string | null;
}

const CATEGORY_ORDER = {
  钥匙: 0,
  机关部件: 1,
  关键证物: 2,
  信件: 3,
} as const;

/**
 * 背包面板数据完全由「物品定义 + 当前剧情标记」实时推导，
 * 与存档中的 `storyFlags` 保持单一数据源。
 */
export function buildInventoryView({
  items,
  flags,
  regionNames,
  currentRegionId = null,
}: InventorySources): InventoryView {
  const held = items
    .filter((item) => flags[item.flag] === true)
    .map((item) => toItemView(item, flags, regionNames, currentRegionId))
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'usable' ? -1 : 1;
      }
      return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    });

  return {
    items: held,
    total: held.length,
    keyCount: held.filter((item) => item.category === '钥匙').length,
    usableCount: held.filter((item) => item.status === 'usable').length,
    usedCount: held.filter((item) => item.status === 'used').length,
  };
}

export function countHeldInventoryItems(
  items: readonly ItemDefinition[],
  flags: StoryFlags,
): number {
  let count = 0;
  for (const item of items) {
    if (flags[item.flag] === true) {
      count += 1;
    }
  }
  return count;
}

function toItemView(
  item: ItemDefinition,
  flags: StoryFlags,
  regionNames: ReadonlyMap<string, string>,
  currentRegionId: string | null,
): InventoryItemView {
  const isUsed = (item.usedWhen ?? []).some((condition) =>
    isConditionMet(flags, condition),
  );
  const status: InventoryItemStatus = isUsed ? 'used' : 'usable';

  return {
    id: item.id,
    title: item.title,
    category: item.category,
    status,
    statusLabel: resolveStatusLabel(item, status),
    sourceLabel:
      item.sourceLocationId === 'player'
        ? '随身携带'
        : regionNames.get(item.sourceLocationId) ?? '未知地点',
    targetLabel: item.targetLabel,
    targetRegionLabel:
      regionNames.get(item.targetLocationId) ?? '未知地点',
    isAtTargetRegion:
      currentRegionId !== null && currentRegionId === item.targetLocationId,
    description: item.description,
    usage: item.usage,
  };
}

function resolveStatusLabel(
  item: ItemDefinition,
  status: InventoryItemStatus,
): string {
  if (item.category === '钥匙') {
    return status === 'used' ? '已开锁' : '可开锁';
  }
  if (item.category === '机关部件') {
    return status === 'used' ? '已安装' : '待安装';
  }
  if (item.category === '关键证物') {
    return status === 'used' ? '已播放' : '待使用';
  }
  return status === 'used' ? '已出示' : '可出示';
}
