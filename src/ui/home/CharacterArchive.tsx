import { useEffect, useState } from 'react';
import {
  characterArchive,
  characterViewLabels,
  type CharacterArchiveEntry,
  type CharacterViewKey,
} from '../../content/characters';

interface CharacterViewerProps {
  entry: CharacterArchiveEntry;
  onClose: () => void;
}

function CharacterViewer({ entry, onClose }: CharacterViewerProps) {
  const [view, setView] = useState<CharacterViewKey>('threeQuarter');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="character-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`${entry.name} 人物档案`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="character-viewer-panel">
        <figure className="character-viewer-stage">
          <img
            src={entry.renders[view]}
            alt={`${entry.name}${characterViewLabels.find((item) => item.key === view)?.label ?? ''}渲染图`}
          />
        </figure>
        <div className="character-viewer-info">
          <button
            type="button"
            className="character-viewer-close"
            onClick={onClose}
            aria-label="关闭人物档案"
            autoFocus
          >
            ×
          </button>
          <p className="character-viewer-eyebrow">人物档案 · 1897</p>
          <h3 className="character-viewer-name">{entry.name}</h3>
          <p className="character-viewer-latin">{entry.latin}</p>
          <dl className="character-viewer-facts">
            <div>
              <dt>身份</dt>
              <dd>{entry.role}</dd>
            </div>
            <div>
              <dt>年龄</dt>
              <dd>{entry.age}</dd>
            </div>
            <div>
              <dt>身高</dt>
              <dd>{entry.heightM.toFixed(2)} m</dd>
            </div>
          </dl>
          <p className="character-viewer-note">{entry.note}</p>
          <ul className="character-viewer-details">
            {entry.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
          <div className="character-viewer-views" role="group" aria-label="切换视图">
            {characterViewLabels.map((item) => (
              <button
                key={item.key}
                type="button"
                className="character-viewer-thumb"
                aria-pressed={view === item.key}
                onClick={() => setView(item.key)}
              >
                <img src={entry.renders[item.key]} alt="" loading="lazy" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CharacterArchive() {
  const [selectedId, setSelectedId] = useState<CharacterArchiveEntry['id'] | null>(null);
  const selected = characterArchive.find((entry) => entry.id === selectedId) ?? null;

  return (
    <section className="character-archive" aria-labelledby="character-archive-title">
      <div className="character-archive-heading">
        <h2 id="character-archive-title">人物档案</h2>
        <span>CHARACTER ARCHIVE · 1897</span>
      </div>
      <ul className="character-archive-list">
        {characterArchive.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className="character-card"
              onClick={() => setSelectedId(entry.id)}
              aria-haspopup="dialog"
            >
              <img
                className="character-card-portrait"
                src={entry.renders.portrait}
                alt=""
                loading="lazy"
                width={800}
                height={1000}
              />
              <span className="character-card-body">
                <span className="character-card-name">{entry.name}</span>
                <span className="character-card-latin">{entry.latin}</span>
                <span className="character-card-meta">
                  {entry.age} 岁 · {entry.heightM.toFixed(2)} m
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <CharacterViewer
          key={selected.id}
          entry={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}
