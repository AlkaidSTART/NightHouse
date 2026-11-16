import { clues, clueFlagForId } from '../../content/clues.ts';
import type { StoryFlagValue } from '../../shared/types/content';
import type { StoryFlags } from '../story/conditions.ts';

export interface ReconciledClueState {
  discoveredClueIds: string[];
  storyFlags: Record<string, StoryFlagValue>;
}

export interface ClueDiscoveryResult extends ReconciledClueState {
  firstDiscovery: boolean;
}

const CLUES_BY_ID = new Map(clues.map((clue) => [clue.id, clue]));

/**
 * 让线索日志与剧情条件共享同一份可恢复状态。
 *
 * 旧存档可能只有 discoveredClueIds，也可能只有 clue.* 标记。加载时双向校准，
 * 避免“日志里找到了，但对话条件仍判定没找到”导致流程永久卡死。
 */
export function reconcileClueState(
  storyFlags: StoryFlags,
  discoveredClueIds: readonly string[],
): ReconciledClueState {
  const discovered = new Set<string>();

  for (const clueId of discoveredClueIds) {
    if (CLUES_BY_ID.has(clueId)) {
      discovered.add(clueId);
    }
  }

  for (const clue of clues) {
    if (storyFlags[clueFlagForId(clue.id)] === true) {
      discovered.add(clue.id);
    }
  }

  const nextFlags: Record<string, StoryFlagValue> = { ...storyFlags };
  for (const clueId of discovered) {
    const clue = CLUES_BY_ID.get(clueId);
    if (!clue) {
      continue;
    }
    nextFlags[clueFlagForId(clue.id)] = true;
    for (const flag of clue.storyFlags ?? []) {
      nextFlags[flag] = true;
    }
  }

  return {
    discoveredClueIds: [...discovered],
    storyFlags: nextFlags,
  };
}

/** 发现一条已知线索；重复发现仍会修复缺失的派生标记，但不算新线索。 */
export function discoverClueState(
  storyFlags: StoryFlags,
  discoveredClueIds: readonly string[],
  clueId: string,
): ClueDiscoveryResult | null {
  if (!CLUES_BY_ID.has(clueId)) {
    return null;
  }

  const firstDiscovery = !discoveredClueIds.includes(clueId);
  const reconciled = reconcileClueState(storyFlags, [
    ...discoveredClueIds,
    clueId,
  ]);
  return {
    ...reconciled,
    firstDiscovery,
  };
}
