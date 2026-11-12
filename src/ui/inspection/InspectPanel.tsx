import type { InspectionView } from '../../shared/types/inspection';

export interface InspectPanelProps {
  view: InspectionView;
  onClose: () => void;
}

export function InspectPanel({ view, onClose }: InspectPanelProps) {
  return (
    <div className="inspect-layer">
      <article
        className="inspect-panel"
        role="dialog"
        aria-modal="true"
        aria-label={view.title}
      >
        <header className="inspect-header">
          <div>
            <p className="inspect-category">{view.category}</p>
            <h2 className="inspect-title">{view.title}</h2>
          </div>
          <button
            type="button"
            className="inspect-close"
            onClick={onClose}
            aria-label="收起"
          >
            ×
          </button>
        </header>

        <div className="inspect-body">
          {view.sections.map((section, index) => (
            <section
              key={index}
              className={`inspect-section inspect-section-${section.style}`}
            >
              {section.heading && (
                <h3 className="inspect-section-heading">{section.heading}</h3>
              )}
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <footer className="inspect-footer">
          {view.newClueTitles.length > 0 && (
            <div className="inspect-clue" role="status">
              <span className="inspect-clue-label">记入线索</span>
              {view.newClueTitles.map((title) => (
                <span key={title} className="inspect-clue-item">
                  {title}
                </span>
              ))}
            </div>
          )}
          <button type="button" className="inspect-dismiss" onClick={onClose}>
            <span className="hud-key">E</span>
            <span>收起</span>
          </button>
        </footer>
      </article>
    </div>
  );
}
