import { useGameStore } from '../../stores/gameStore';

export interface StartOverlayProps {
  ready?: boolean;
  onStart: () => void;
}

export function StartOverlay({ ready: readyProp, onStart }: StartOverlayProps) {
  const storeReady = useGameStore((s) => s.ready);
  const ready = readyProp !== undefined ? readyProp : storeReady;

  return (
    <div className="overlay">
      <div className="overlay-panel">
        <p className="overlay-eyebrow">别墅入口</p>
        <h2 className="overlay-title">进入午夜别墅</h2>
        <p className="overlay-text">
          进入后浏览器会锁定鼠标，使用 W A S D 移动、鼠标环视、E 交互。
          按 Esc 随时暂停。
        </p>
        <div className="overlay-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={onStart}
            disabled={!ready}
          >
            {ready ? '开始探索' : '场景载入中…'}
          </button>
        </div>
      </div>
    </div>
  );
}
