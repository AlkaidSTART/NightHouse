import { useState } from 'react';
import type { CluePriority } from '../../shared/types/content';
import type { ClueJournalView } from '../../shared/types/clueJournal';
import { useDraggablePanel } from '../shared/useDraggablePanel';

const PRIORITY_LABEL: Record<CluePriority, string> = {
  main: '主线',
  supporting: '辅助',
  ambient: '档案',
};

export interface CluePanelProps {
  view: ClueJournalView;
  onClose: () => void;
}

export function CluePanel({ view, onClose }: CluePanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    view.entries[0]?.id ?? null,
  );
  const { panelRef, isDragging, panelStyle, handleProps } =
    useDraggablePanel<HTMLElement>();
  const selected =
    view.entries.find((entry) => entry.id === selectedId) ??
    view.entries[0] ??
    null;

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
          <button
            type="button"
            className="clue-close"
            onClick={onClose}
            aria-label="收起线索"
          >
            收起
          </button>
        </header>

        {view.entries.length === 0 || !selected ? (
          <div className="clue-empty">
            <p>尚无线索</p>
          </div>
        ) : (
          <div className="clue-body">
            <ul className="clue-list">
              {view.entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={`clue-entry${entry.id === selected.id ? ' is-active' : ''}`}
                    onClick={() => setSelectedId(entry.id)}
                    aria-pressed={entry.id === selected.id}
                  >
                    <span
                      className={`clue-priority clue-priority-${entry.priority}`}
                    >
                      {PRIORITY_LABEL[entry.priority]}
                    </span>
                    <span className="clue-entry-title">{entry.title}</span>
                    <span className="clue-entry-place">
                      {entry.locationLabel}
                    </span>
                  </button>
                </li>
              ))}
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

        <footer className="clue-footer">
          <span>
            <span className="hud-key">J</span> / Esc 收起
          </span>
        </footer>
      </section>
    </div>
  );
}
