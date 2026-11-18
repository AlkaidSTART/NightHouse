import { useMemo } from 'react';
import { content } from '../../content';
import { countHeldInventoryItems } from '../../game/inventory/inventory';
import { useStoryStore } from '../../stores/storyStore';
import type { EndingView } from '../../shared/types/ending';

export interface EndingOverlayProps {
  ending: EndingView;
  onExit: () => void;
}

/** 结局演出。文本来自 content/endings.ts，按 choice.midnight 与证据分变体。 */
export function EndingOverlay({ ending, onExit }: EndingOverlayProps) {
  const discoveredClueIds = useStoryStore((s) => s.discoveredClueIds);
  const storyFlags = useStoryStore((s) => s.storyFlags);

  const summary = useMemo(() => {
    const discoveredSet = new Set(discoveredClueIds);
    const keyTotal = content.clues.filter((c) => c.priority !== 'ambient').length;
    const keyFound = content.clues.filter(
      (c) => c.priority !== 'ambient' && discoveredSet.has(c.id),
    ).length;
    const archiveTotal = content.clues.filter(
      (c) => c.priority === 'ambient',
    ).length;
    const archiveFound = content.clues.filter(
      (c) => c.priority === 'ambient' && discoveredSet.has(c.id),
    ).length;
    const itemsHeld = countHeldInventoryItems(content.items, storyFlags);
    return {
      keyFound,
      keyTotal,
      archiveFound,
      archiveTotal,
      itemsHeld,
    };
  }, [discoveredClueIds, storyFlags]);

  return (
    <div className="overlay ending-overlay">
      <div className="overlay-panel ending-panel">
        <p className="overlay-eyebrow">结局 · {ending.title}</p>
        <h2 className="overlay-title">{ending.subtitle}</h2>

        <div className="ending-body">
          {ending.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="ending-summary" aria-label="调查总结">
          <div className="ending-stat">
            <span className="ending-stat-label">关键线索</span>
            <span className="ending-stat-value">
              {summary.keyFound} / {summary.keyTotal}
            </span>
          </div>
          <div className="ending-stat">
            <span className="ending-stat-label">别墅档案</span>
            <span className="ending-stat-value">
              {summary.archiveFound} / {summary.archiveTotal}
            </span>
          </div>
          <div className="ending-stat">
            <span className="ending-stat-label">持有物品</span>
            <span className="ending-stat-value">
              {summary.itemsHeld} / {content.items.length}
            </span>
          </div>
        </div>
        <p className="ending-replay-note">
          返回首页后可重新开始探索不同的抉择与真相分支。
        </p>

        <div className="overlay-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={onExit}
            autoFocus
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
