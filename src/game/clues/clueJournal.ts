import type { ClueDefinition } from '../../shared/types/content';
import type {
  ClueJournalEntryView,
  ClueJournalView,
} from '../../shared/types/clueJournal';

export interface ClueJournalSources {
  clues: readonly ClueDefinition[];
  discoveredClueIds: readonly string[];
  regionNames: ReadonlyMap<string, string>;
  npcNames: ReadonlyMap<string, string>;
}

const PRIORITY_ORDER = { main: 0, supporting: 1, ambient: 2 } as const;

/**
 * 线索面板数据完全由「内容定义 + 存档里的已发现线索 ID」推导，
 * 不在 UI 里保存副本，因此读档、发现新线索后不会出现两份状态。
 */
export function buildClueJournalView({
  clues,
  discoveredClueIds,
  regionNames,
  npcNames,
}: ClueJournalSources): ClueJournalView {
  const discovered = new Set(discoveredClueIds);
  const entries = clues
    .filter((clue) => discovered.has(clue.id))
    .map((clue) => toEntry(clue, regionNames, npcNames))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return {
    entries,
    total: entries.length,
    mainCount: entries.filter((entry) => entry.priority === 'main').length,
    supportingCount: entries.filter((entry) => entry.priority === 'supporting')
      .length,
    ambientCount: entries.filter((entry) => entry.priority === 'ambient')
      .length,
  };
}

function toEntry(
  clue: ClueDefinition,
  regionNames: ReadonlyMap<string, string>,
  npcNames: ReadonlyMap<string, string>,
): ClueJournalEntryView {
  return {
    id: clue.id,
    title: clue.title,
    description: clue.description,
    priority: clue.priority,
    locationLabel:
      clue.locationId === 'player'
        ? '随身'
        : regionNames.get(clue.locationId) ?? '未知地点',
    relatedNpcNames: (clue.relatedNpcIds ?? [])
      .map((npcId) => npcNames.get(npcId))
      .filter((name): name is string => Boolean(name)),
  };
}
