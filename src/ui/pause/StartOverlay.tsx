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
        <h2 className="overlay-title">进入午夜别墅</h2>

        <p className="overlay-guidance">先看右上角的「下一步」，跟随小地图路线前进。进入房间后，菱形标记会指出要调查的物品或人物。</p>
        <p className="overlay-guidance">WASD 移动 · 鼠标转向 · E 调查 / 交谈 · Esc 暂停</p>

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
