import { useEffect, useState } from 'react';
import {
  characterArchive,
  type CharacterArchiveEntry,
} from '../../content/characters';

export interface CharacterArchiveProps {
  onClose: () => void;
}

/**
 * 人物档案浮层：从首页主菜单进入，左侧切换人物，右侧查看立绘与档案记录。
 */
export function CharacterArchive({ onClose }: CharacterArchiveProps) {
  const [selectedId, setSelectedId] = useState<CharacterArchiveEntry['id']>(
    characterArchive[0]?.id ?? 'npc_arthur',
  );
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const entry =
    characterArchive.find((item) => item.id === selectedId) ??
    characterArchive[0];

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

  if (!entry) {
    return null;
  }

  const mainSrc = entry.renders.threeQuarter;
  const isMainBroken = brokenImages[mainSrc] === true;

  const markBroken = (src: string): void => {
    setBrokenImages((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  };

  return (
    <div
      className="character-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="人物档案"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="character-viewer-panel">
        <aside className="archive-sidebar" aria-label="人物列表">
          <div className="archive-sidebar-head">
            <p className="character-viewer-eyebrow">人物档案 · 1897</p>
            <button
              type="button"
              className="character-viewer-close"
              onClick={onClose}
              aria-label="返回主菜单"
              autoFocus
            >
              返回
            </button>
          </div>
          <ul className="archive-nav">
            {characterArchive.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`archive-nav-item${item.id === entry.id ? ' is-active' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                  aria-current={item.id === entry.id ? 'true' : undefined}
                >
                  <span className="archive-nav-name">{item.name}</span>
                  <span className="archive-nav-role">{item.role}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <figure className="character-viewer-stage">
          {!isMainBroken ? (
            <img
              src={mainSrc}
              alt={`${entry.name}肖像立绘`}
              onError={() => markBroken(mainSrc)}
            />
          ) : (
            <div className="archive-stage-placeholder">
              <p className="archive-placeholder-name">{entry.name}</p>
              <p className="archive-placeholder-latin">{entry.latin}</p>
            </div>
          )}
        </figure>

        <div className="character-viewer-info">
          <p className="character-viewer-eyebrow">档案记录</p>
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
        </div>
      </div>
    </div>
  );
}
