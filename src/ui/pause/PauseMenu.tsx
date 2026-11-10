import { useGameStore } from '../../stores/gameStore';

export interface PauseMenuProps {
  onResume: () => void;
  onExit?: () => void;
}

export function PauseMenu({ onResume, onExit }: PauseMenuProps) {
  const storeExit = useGameStore((s) => s.exitToHome);
  const handleExit = onExit ?? storeExit;

  return (
    <div className="overlay">
      <div className="overlay-panel">
        <p className="overlay-eyebrow">已暂停</p>
        <h2 className="overlay-title">暂停</h2>
        <p className="overlay-text">
          当前进度会保存在本地浏览器中。继续游戏将重新锁定鼠标。
        </p>
        <div className="overlay-actions">
          <button type="button" className="button button-primary" onClick={onResume}>
            继续游戏
          </button>
          <button type="button" className="button" onClick={handleExit}>
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
