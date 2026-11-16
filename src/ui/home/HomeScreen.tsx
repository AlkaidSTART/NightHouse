import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CharacterArchive } from './CharacterArchive';

export interface HomeScreenProps {
  hasSave?: boolean;
  notice?: string | null;
  onStart?: () => void;
  onContinue?: () => void;
}

export function HomeScreen(props: HomeScreenProps = {}) {
  const storeHasSave = useGameStore((s) => s.hasSave);
  const storeNotice = useGameStore((s) => s.saveNotice);
  const storeStart = useGameStore((s) => s.startNewGame);
  const storeContinue = useGameStore((s) => s.continueGame);

  const hasSave = props.hasSave !== undefined ? props.hasSave : storeHasSave;
  const notice = props.notice !== undefined ? props.notice : storeNotice;
  const onStart = props.onStart ?? storeStart;
  const onContinue = props.onContinue ?? storeContinue;

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [logoBroken, setLogoBroken] = useState(false);

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
            onClick={onStart}
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
    </div>
  );
}
