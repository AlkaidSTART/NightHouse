import type { EndingView } from '../../shared/types/ending';

export interface EndingOverlayProps {
  ending: EndingView;
  onExit: () => void;
}

/** 结局演出。文本来自 content/endings.ts，按 choice.midnight 与证据分变体。 */
export function EndingOverlay({ ending, onExit }: EndingOverlayProps) {
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
