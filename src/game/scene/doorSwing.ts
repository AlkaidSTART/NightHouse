/** 门扇从关闭到全开的旋转角度（度）。 */
const FULL_SWING = 90;
/** 跑完整段行程的动画时长（秒）。 */
const SWING_DURATION = 0.62;
/** 中途反向时按剩余行程缩短动画，但不至于短到看不清。 */
const MIN_DURATION_RATIO = 0.3;

export interface DoorSwingState {
  angle: number;
  from: number;
  target: number;
  elapsed: number;
  duration: number;
}

export function createDoorSwingState(angle: number): DoorSwingState {
  return { angle, from: angle, target: angle, elapsed: 0, duration: 0 };
}

/** 设置新的目标角度；已在朝同一目标运动时保留当前进度，避免重复触发时抖动。 */
export function retargetDoorSwing(state: DoorSwingState, target: number): void {
  if (target === state.target) {
    return;
  }
  const travel = Math.abs(target - state.angle);
  state.from = state.angle;
  state.target = target;
  state.elapsed = 0;
  state.duration =
    SWING_DURATION *
    Math.min(1, Math.max(MIN_DURATION_RATIO, travel / FULL_SWING));
}

/** 推进一步。角度有变化时返回新角度，已停在目标角度时返回 null。 */
export function advanceDoorSwing(
  state: DoorSwingState,
  dt: number,
): number | null {
  if (state.angle === state.target) {
    return null;
  }

  state.elapsed = Math.min(state.elapsed + dt, state.duration);
  const t = state.duration <= 0 ? 1 : state.elapsed / state.duration;
  // easeInOutCubic：起步和落位都收着力，像一扇有分量的木门。
  const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const next = t >= 1 ? state.target : state.from + (state.target - state.from) * eased;

  if (next === state.angle) {
    return null;
  }
  state.angle = next;
  return next;
}
