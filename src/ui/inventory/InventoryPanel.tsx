import { useState } from 'react';
import type { ItemCategory } from '../../shared/types/content';
import type {
  InventoryItemView,
  InventoryView,
} from '../../shared/types/inventory';
import { useDraggablePanel } from '../shared/useDraggablePanel';

const CATEGORY_CLASS: Record<ItemCategory, string> = {
  钥匙: 'key',
  机关部件: 'part',
  关键证物: 'evidence',
  信件: 'letter',
};

export interface InventoryPanelProps {
  view: InventoryView;
  onClose: () => void;
  onSwitchToClues?: () => void;
}

export function InventoryPanel({
  view,
  onClose,
  onSwitchToClues,
}: InventoryPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    view.items[0]?.id ?? null,
  );
  const [inspectNote, setInspectNote] = useState<string | null>(null);
  const { panelRef, isDragging, panelStyle, handleProps } =
    useDraggablePanel<HTMLElement>();

  const selected: InventoryItemView | null =
    view.items.find((item) => item.id === selectedId) ??
    view.items[0] ??
    null;

  const handleSelect = (id: string): void => {
    setSelectedId(id);
    setInspectNote(null);
  };

  const handleCheckUsage = (item: InventoryItemView): void => {
    if (item.status === 'used') {
      setInspectNote(
        `「${item.title}」已完成核心用途（${item.targetRegionLabel} · ${item.targetLabel}），仍保留在背包中供随时核对。`,
      );
      return;
    }
    if (item.isAtTargetRegion) {
      setInspectNote(
        `你当前就在「${item.targetRegionLabel}」。收起背包后走近「${item.targetLabel}」按 E 即可使用「${item.title}」。`,
      );
      return;
    }
    setInspectNote(
      `请前往「${item.targetRegionLabel}」，对准「${item.targetLabel}」按 E 即可使用「${item.title}」。`,
    );
  };

  return (
    <div className="clue-layer inventory-layer">
      <section
        ref={panelRef}
        className={`clue-panel inventory-panel${isDragging ? ' is-dragging' : ''}`}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-label="随身背包"
      >
        <header className="clue-header panel-drag-handle" {...handleProps}>
          <div>
            <p className="clue-kicker">随身行囊</p>
            <h2 className="clue-title">背包</h2>
          </div>
          <div className="clue-summary" aria-label="背包统计">
            <span>共 {view.total} 件</span>
            <span>钥匙 {view.keyCount}</span>
            <span>可用 {view.usableCount}</span>
            <span>已用 {view.usedCount}</span>
          </div>
          <div className="panel-header-actions">
            {onSwitchToClues && (
              <button
                type="button"
                className="panel-switch-btn"
                onClick={onSwitchToClues}
              >
                线索 (J)
              </button>
            )}
            <button
              type="button"
              className="clue-close"
              onClick={onClose}
              aria-label="收起背包"
            >
              收起
            </button>
          </div>
        </header>

        {view.items.length === 0 || !selected ? (
          <div className="clue-empty">
            <p>背包里还没有任何可交互物品。</p>
            <p>与霍尔太太交谈或搜查房间抽屉、衣帽钩时获得的钥匙与证物会存放在这里。</p>
          </div>
        ) : (
          <div className="clue-body">
            <ul className="clue-list">
              {view.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`clue-entry${item.id === selected.id ? ' is-active' : ''}`}
                    onClick={() => handleSelect(item.id)}
                    aria-pressed={item.id === selected.id}
                  >
                    <span
                      className={`clue-priority inventory-cat-${CATEGORY_CLASS[item.category]}`}
                    >
                      {item.category}
                    </span>
                    <span className="clue-entry-title">{item.title}</span>
                    <span
                      className={`inventory-status inventory-status-${item.status}`}
                    >
                      {item.statusLabel}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <article className="clue-detail inventory-detail">
              <p className="clue-detail-kicker">
                {selected.category} · 来源：{selected.sourceLabel} ·{' '}
                <span
                  className={`inventory-status inventory-status-${selected.status}`}
                >
                  {selected.statusLabel}
                </span>
              </p>
              <h3 className="clue-detail-title">{selected.title}</h3>
              <p className="clue-detail-text">{selected.description}</p>

              <div className="inventory-usage-box">
                <p className="inventory-usage-heading">
                  交互目标：{selected.targetRegionLabel} · {selected.targetLabel}
                  {selected.isAtTargetRegion && (
                    <span className="inventory-here-badge">当前所在区域</span>
                  )}
                </p>
                <p className="inventory-usage-text">{selected.usage}</p>
                <div className="inventory-actions">
                  <button
                    type="button"
                    className="inventory-use-btn"
                    onClick={() => handleCheckUsage(selected)}
                  >
                    检视使用方式
                  </button>
                </div>
                {inspectNote && (
                  <p className="inventory-inspect-note" role="status">
                    {inspectNote}
                  </p>
                )}
              </div>
            </article>
          </div>
        )}

        <footer className="clue-footer">
          <span>
            <span className="hud-key">B</span> / Esc 收起
          </span>
        </footer>
      </section>
    </div>
  );
}
