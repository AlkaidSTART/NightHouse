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

  return (
    <div className="home-screen">
      <div className="home-atmosphere" aria-hidden="true" />
      <main className="home-panel">
        <p className="home-eyebrow">单人第一人称悬疑探索</p>
        <h1 className="home-title">午夜别墅</h1>
        <p className="home-subtitle">MIDNIGHT VILLA</p>

        <div className="home-actions">
          <button type="button" className="button button-primary" onClick={onStart}>
            开始新游戏
          </button>
          <button
            type="button"
            className="button"
            onClick={onContinue}
            disabled={!hasSave}
          >
            继续游戏
          </button>
        </div>

        {!hasSave && (
          <p className="home-hint">暂无本地存档，开始新游戏后会自动保存进度。</p>
        )}
        {notice && (
          <p className="home-notice" role="status">
            {notice}
          </p>
        )}

        <div className="home-controls">
          <span>W A S D 移动</span>
          <span>鼠标 环视</span>
          <span>Shift 奔跑</span>
          <span>空格 跳跃</span>
          <span>C / Ctrl 蹲下</span>
          <span>E 交互</span>
          <span>Esc 暂停</span>
        </div>

        <p className="home-version">MVP 脚手架 · v0.1</p>
      </main>
      <CharacterArchive />
    </div>
  );
}
