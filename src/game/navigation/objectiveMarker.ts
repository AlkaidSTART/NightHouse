import type { ObjectiveMarkerView } from '../../shared/types/guidance';

/** 将相机投影约束在可读的视野内；屏幕边缘箭头只指方向，不伪装成交互提示。 */
export function buildObjectiveMarker(
  id: string,
  label: string,
  x: number,
  y: number,
  inFront: boolean,
  distance: number,
): ObjectiveMarkerView | null {
  if (![x, y, distance].every(Number.isFinite) || distance < 0) return null;
  let direction: ObjectiveMarkerView['direction'] = 'onscreen';
  if (!inFront) direction = 'behind';
  else if (x < 10) direction = 'left';
  else if (x > 90) direction = 'right';
  else if (y < 20) direction = 'up';
  else if (y > 78) direction = 'down';
  return {
    id,
    label,
    x: inFront ? Math.max(10, Math.min(90, x)) : 50,
    y: inFront ? Math.max(20, Math.min(78, y)) : 78,
    distance,
    direction,
  };
}
