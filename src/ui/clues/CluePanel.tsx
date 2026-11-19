import { useEffect, useMemo, useState } from 'react';
import type { CluePriority } from '../../shared/types/content';
import type { ClueJournalView } from '../../shared/types/clueJournal';
import { useDraggablePanel } from '../shared/useDraggablePanel';

const PRIORITY_LABEL: Record<CluePriority, string> = {
  main: '主线',
  supporting: '辅助',
  ambient: '档案',
};

type ClueFilter = 'all' | CluePriority;

const FILTER_OPTIONS: readonly { id: ClueFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'main', label: '主线' },
  { id: 'supporting', label: '辅助' },
  { id: 'ambient', label: '档案' },
];

const seenClueIds = new Set<string>();

export interface CluePanelProps {
  view: ClueJournalView;
  onClose: () => void;
  onSwitchToInventory?: () => void;
}

export function CluePanel({
  view,
  onClose,
  onSwitchToInventory,
}: CluePanelProps) {
  const [filter, setFilter] = useState<ClueFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const firstId = view.entries[0]?.id ?? null;
    if (firstId) {
      seenClueIds.add(firstId);
    }
    return firstId;
  });
  const { panelRef, isDragging, panelStyle, handleProps } =
    useDraggablePanel<HTMLElement>();

  const filteredEntries = useMemo(() => {
    if (filter === 'all') {
      return view.entries;
    }
    return view.entries.filter((entry) => entry.priority === filter);
  }, [view.entries, filter]);

  const counts = useMemo(() => {
    const result: Record<ClueFilter, number> = {
      all: view.entries.length,
      main: 0,
      supporting: 0,
      ambient: 0,
    };
    for (const entry of view.entries) {
      result[entry.priority] += 1;
    }
    return result;
  }, [view.entries]);

  const selected =
    filteredEntries.find((entry) => entry.id === selectedId) ??
    filteredEntries[0] ??
    null;

  const selectEntry = (id: string): void => {
    seenClueIds.add(id);
    setSelectedId(id);
  };

  useEffect(() => {
    if (filteredEntries.length === 0) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
        return;
      }
      event.preventDefault();
      const currentIndex = selected
        ? filteredEntries.findIndex((entry) => entry.id === selected.id)
        : 0;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex =
        (currentIndex + step + filteredEntries.length) % filteredEntries.length;
      const next = filteredEntries[nextIndex];
      if (next) {
        seenClueIds.add(next.id);
        setSelectedId(next.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredEntries, selected]);

  return (
    <div className="clue-layer">
      <section
        ref={panelRef}
        className={`clue-panel${isDragging ? ' is-dragging' : ''}`}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-label="线索"
      >
        <header className="clue-header panel-drag-handle" {...handleProps}>
          <div>
            <h2 className="clue-title">线索</h2>
          </div>
          <div className="panel-header-actions">
            {onSwitchToInventory && (
              <button
                type="button"
                className="panel-switch-btn"
                onClick={onSwitchToInventory}
              >
                背包 (B)
              </button>
            )}
            <button
              type="button"
              className="clue-close"
              onClick={onClose}
              aria-label="收起线索"
            >
              收起
            </button>
          </div>
        </header>

        {view.entries.length === 0 ? (
          <div className="clue-empty">
            <p>尚无线索</p>
          </div>
        ) : (
          <>
            <div className="clue-filters" role="tablist" aria-label="线索分类">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === option.id}
                  className={`clue-filter-tab${filter === option.id ? ' is-active' : ''}`}
                  onClick={() => setFilter(option.id)}
                >
                  <span>{option.label}</span>
                  <span className="clue-filter-count">{counts[option.id]}</span>
                </button>
              ))}
            </div>

            {filteredEntries.length === 0 || !selected ? (
              <div className="clue-empty">
                <p>当前分类下暂无线索</p>
              </div>
            ) : (
              <div className="clue-body">
                <ul className="clue-list">
                  {filteredEntries.map((entry) => {
                    const isUnseen =
                      entry.id !== selected.id && !seenClueIds.has(entry.id);
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          className={`clue-entry${entry.id === selected.id ? ' is-active' : ''}`}
                          onClick={() => selectEntry(entry.id)}
                          aria-pressed={entry.id === selected.id}
                        >
                          <span
                            className={`clue-priority clue-priority-${entry.priority}`}
                          >
                            {PRIORITY_LABEL[entry.priority]}
                          </span>
                          <span className="clue-entry-title">
                            {entry.title}
                            {isUnseen && (
                              <span
                                className="clue-new-dot"
                                aria-label="新线索"
                                title="新线索"
                              />
                            )}
                          </span>
                          <span className="clue-entry-place">
                            {entry.locationLabel}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <article className="clue-detail">
                  <p className="clue-detail-kicker">
                    {PRIORITY_LABEL[selected.priority]} · {selected.locationLabel}
                  </p>
                  <h3 className="clue-detail-title">{selected.title}</h3>
                  <p className="clue-detail-text">{selected.description}</p>
                  {selected.relatedNpcNames.length > 0 && (
                    <p className="clue-detail-npc">
                      相关人物：{selected.relatedNpcNames.join('、')}
                    </p>
                  )}
                </article>
              </div>
            )}
          </>
        )}

        <footer className="clue-footer">
          <span>
            <span className="hud-key">↑↓</span> 切换 ·{' '}
            <span className="hud-key">J</span> 收起
          </span>
        </footer>
      </section>
    </div>
  );
}
