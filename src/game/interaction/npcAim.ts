/**
 * NPC 交互锚点的高度与瞄准半径。
 *
 * 玩家眼高 1.7 m。锚点放在 0.85 m 时，平视的射线到锚点的垂直偏差超过瞄准半径，
 * 必须低头约 30° 才会出现交谈提示；抬到胸口高度并放宽半径后，平视即可选中。
 */
export const NPC_ANCHOR_HEIGHT = 1.15;
export const NPC_INTERACTION_RADIUS = 0.7;
