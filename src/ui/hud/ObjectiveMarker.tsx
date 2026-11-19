import type { ObjectiveMarkerView } from '../../shared/types/guidance';

const directionLabels = {
  onscreen: '当前调查目标',
  left: '向左看',
  right: '向右看',
  up: '抬头看',
  down: '低头看',
  behind: '转身寻找',
};
const symbols = { onscreen: '◇', left: '←', right: '→', up: '↑', down: '↓', behind: '↶' };

export function ObjectiveMarker({ view }: { view: ObjectiveMarkerView }) {
  return (
    <div
      className={`hud-objective-marker is-${view.direction}`}
      style={{ left: `${view.x}%`, top: `${view.y}%` }}
    >
      <span className="hud-objective-marker-symbol" aria-hidden="true">
        {symbols[view.direction]}
      </span>
      <span className="hud-objective-marker-label">
        {view.label} · {Math.max(1, Math.round(view.distance))} 米
      </span>
      <span className="hud-objective-marker-direction">{directionLabels[view.direction]}</span>
    </div>
  );
}
