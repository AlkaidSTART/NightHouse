/**
 * 目标中心比遮挡物远出这个距离以上才算被挡住。
 * 贴在家具或墙面上的交互点离表面只有几厘米，需要这点余量才不会被自己依附的物体挡住；
 * 余量又必须小于墙厚，否则隔墙也能触发交互。
 */
export const OCCLUSION_TOLERANCE = 0.12;

/**
 * @param hitDistance 视线命中最近障碍的距离，未命中为 null
 * @param targetDistance 视线方向上到交互点中心的距离
 */
export function isOccluded(
  hitDistance: number | null,
  targetDistance: number,
): boolean {
  return (
    hitDistance !== null && hitDistance < targetDistance - OCCLUSION_TOLERANCE
  );
}
