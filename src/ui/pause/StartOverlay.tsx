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
