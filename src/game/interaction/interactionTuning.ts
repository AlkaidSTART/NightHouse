/** 玩家到交互点的最大距离（米）。 */
export const INTERACTION_DISTANCE = 3.6;

/**
 * 场景配置中的 radius 按物体体量给出，直接作为瞄准球时，低矮或小件物品
 * 需要非常精确地对准锚点。统一放宽选择容差，但不改变遮挡判定。
 */
export const PROP_INTERACTION_RADIUS_SCALE = 1.75;

export function getPropInteractionRadius(sceneRadius: number): number {
  return sceneRadius * PROP_INTERACTION_RADIUS_SCALE;
}
