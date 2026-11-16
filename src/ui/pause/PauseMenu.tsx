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
        <h2 className="overlay-title">暂停</h2>
        <div className="overlay-actions">
          <button type="button" className="button button-primary" onClick={onResume}>
            继续游戏
          </button>
          <button type="button" className="button" onClick={handleExit}>
            返回首页
          </button>
        </div>
        <div className="pause-controls" aria-label="按键参考">
          <span>WASD 移动</span>
          <span>Shift 奔跑</span>
          <span>空格 跳跃</span>
          <span>C 蹲下</span>
          <span>E 交互</span>
          <span>J 线索</span>
          <span>Esc 暂停</span>
        </div>
      </div>
    </div>
  );
}
