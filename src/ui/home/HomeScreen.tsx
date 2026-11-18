import { useEffect, useState } from 'react';
import type { PlayerSettings } from '../../shared/types/save';
import { useGameStore } from '../../stores/gameStore';
import { SettingsPanel } from '../settings/SettingsPanel';
import { CharacterArchive } from './CharacterArchive';

export interface HomeScreenProps {
  hasSave?: boolean;
  notice?: string | null;
  settings?: PlayerSettings;
  onUpdateSettings?: (next: PlayerSettings) => void;
  onStart?: () => void;
  onContinue?: () => void;
}

export function HomeScreen(props: HomeScreenProps = {}) {
  const storeHasSave = useGameStore((s) => s.hasSave);
  const storeNotice = useGameStore((s) => s.saveNotice);
  const storeSettings = useGameStore((s) => s.settings);
  const storeSetSettings = useGameStore((s) => s.setSettings);
  const storeStart = useGameStore((s) => s.startNewGame);
  const storeContinue = useGameStore((s) => s.continueGame);

  const hasSave = props.hasSave !== undefined ? props.hasSave : storeHasSave;
  const notice = props.notice !== undefined ? props.notice : storeNotice;
  const settings = props.settings ?? storeSettings;
  const onUpdateSettings = props.onUpdateSettings ?? storeSetSettings;
  const onStart = props.onStart ?? storeStart;
  const onContinue = props.onContinue ?? storeContinue;

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [logoBroken, setLogoBroken] = useState(false);

  useEffect(() => {
    if (!confirmOverwrite) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setConfirmOverwrite(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmOverwrite]);

  const handleStartClick = (): void => {
    if (hasSave) {
      setConfirmOverwrite(true);
      return;
    }
    onStart();
  };

  return (
    <div className="home-screen">
      <div className="home-atmosphere" aria-hidden="true" />

      <main className="home-panel">
        <header className="home-brand">
          {!logoBroken ? (
            <>
              <h1 className="sr-only">午夜别墅 MIDNIGHT VILLA</h1>
              <img
                className="home-title-art"
                src="/assets/renders/home_title.jpg"
                alt="午夜别墅 MIDNIGHT VILLA"
                onError={() => setLogoBroken(true)}
              />
            </>
          ) : (
            <>
              <h1 className="home-title">午夜别墅</h1>
              <p className="home-subtitle">MIDNIGHT VILLA</p>
            </>
          )}
        </header>

        <nav className="home-menu" aria-label="主菜单">
          <button
            type="button"
            className="home-menu-item is-primary"
            onClick={handleStartClick}
          >
            开始新游戏
          </button>
          <button
            type="button"
            className="home-menu-item"
            onClick={onContinue}
            disabled={!hasSave}
          >
            继续游戏
          </button>
          <button
            type="button"
            className="home-menu-item"
            onClick={() => setArchiveOpen(true)}
            aria-haspopup="dialog"
          >
            人物档案
          </button>
          <button
            type="button"
            className="home-menu-item"
            onClick={() => setSettingsOpen(true)}
            aria-haspopup="dialog"
          >
            设置
          </button>
        </nav>

        {notice && (
          <p className="home-notice" role="status">
            {notice}
          </p>
        )}
      </main>

      {archiveOpen && (
        <CharacterArchive onClose={() => setArchiveOpen(false)} />
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={onUpdateSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {confirmOverwrite && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-label="确认开始新游戏"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setConfirmOverwrite(false);
            }
          }}
        >
          <div className="overlay-panel confirm-panel">
            <p className="overlay-eyebrow">存档提醒</p>
            <h2 className="overlay-title">覆盖当前进度？</h2>
            <p className="confirm-copy">
              当前已有本地探索存档，开始新游戏将在首次自动保存时覆盖原有进度。
            </p>
            <div className="overlay-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setConfirmOverwrite(false);
                  onStart();
                }}
              >
                确认开始新游戏
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setConfirmOverwrite(false)}
                autoFocus
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
