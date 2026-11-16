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

  return (
    <div className="home-screen">
      <div className="home-atmosphere" aria-hidden="true" />

      <main className="home-panel">
        <header className="home-brand">
          <p className="home-eyebrow">单人第一人称悬疑探索 · 1897</p>
          <h1 className="home-title">午夜别墅</h1>
          <p className="home-subtitle">MIDNIGHT VILLA</p>
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

        {!hasSave && (
          <p className="home-hint">暂无本地存档，开始新游戏后将自动保存。</p>
        )}
        {notice && (
          <p className="home-notice" role="status">
            {notice}
          </p>
        )}
      </main>

      <footer className="home-footer">
        <div className="home-controls">
          <span>W A S D 移动</span>
          <span>鼠标 环视</span>
          <span>Shift 奔跑</span>
          <span>空格 跳跃</span>
          <span>C / Ctrl 蹲下</span>
          <span>E 交互</span>
          <span>J 线索</span>
          <span>Esc 暂停</span>
        </div>
        <p className="home-version">v0.1</p>
      </footer>

      {archiveOpen && (
        <CharacterArchive onClose={() => setArchiveOpen(false)} />
      )}
    </div>
  );
}
