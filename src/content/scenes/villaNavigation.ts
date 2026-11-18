import type { Vec3Tuple } from '../../shared/types/save';

export interface GroundNavigationNode {
  id: string;
  /** 节点所在区域；楼梯平台等过渡点不属于某个可判定区域时为 null。 */
  regionId: string | null;
  position: Vec3Tuple;
  /** 区域内的目的地节点。路径只在这些节点结束，避免停在房门口。 */
  focus?: boolean;
}

export interface GroundNavigationGraph {
  nodes: readonly GroundNavigationNode[];
  /** 无向边；每条边必须引用两个已登记节点。 */
  edges: readonly (readonly [string, string])[];
}

function node(
  id: string,
  regionId: string | null,
  position: Vec3Tuple,
  focus = false,
): GroundNavigationNode {
  return { id, regionId, position, focus };
}

/**
 * 别墅主路线导航图。节点沿实际门洞、走廊和楼梯布置，不替代碰撞系统，
 * 仅用于把“当前任务区域”转换成不会穿墙的地面路径。
 *
 * 坐标约定与场景一致：北 = −Z，东 = +X；楼梯节点保留真实高度。
 */
export const villaNavigation: GroundNavigationGraph = {
  nodes: [
    // 前院与正门
    node('gate_start', 'scene_gate', [0, -0.75, 38.5], true),
    node('yard_turn', 'scene_gate', [3.5, -0.75, 21.5]),
    node('yard_approach', 'scene_gate', [3.5, -0.75, 17.8]),
    node('porch_bottom', 'scene_gate', [0, -0.75, 10.65]),
    node('porch_top', 'scene_gate', [0, 0, 9.45]),
    node('front_door', 'scene_gate', [0, 0, 7.4]),
    node('hall_entry', 'villa_hall', [0, 0, 6.2]),

    // 门厅
    node('hall_center', 'villa_hall', [0, 0, 3.4], true),
    node('hall_parlor', 'villa_hall', [-3.3, 0, 3.5]),
    node('hall_dining', 'villa_hall', [3.3, 0, 3.5]),
    node('hall_corridor', 'villa_hall', [-3.3, 0, -1]),
    node('hall_stair', 'villa_hall', [3.3, 0, 1.8]),

    // 客厅
    node('parlor_door', 'villa_parlor', [-4.7, 0, 3.5]),
    node('parlor_center', 'villa_parlor', [-7.5, 0, 3.5], true),
    node('parlor_terrace', 'villa_parlor', [-10.7, 0, -1]),

    // 餐厅
    node('dining_door', 'villa_dining', [4.7, 0, 3.5]),
    node('dining_center', 'villa_dining', [7.5, 0, 3.5], true),

    // 一层走廊、书房与储物间
    node('corridor_mouth', 'villa_corridor', [-4.3, 0, -1]),
    node('corridor_center', 'villa_corridor', [-7.5, 0, -1], true),
    node('study_door', 'villa_corridor', [-8.5, 0, -1.7]),
    node('storage_door', 'villa_corridor', [-5, 0, -1.7]),
    node('study_entry', 'villa_study', [-8.5, 0, -2.3]),
    node('study_center', 'villa_study', [-8.5, 0, -5], true),
    node('storage_entry', 'villa_storage', [-5, 0, -2.3]),
    node('storage_center', 'villa_storage', [-4.5, 0, -4], true),

    // 主楼梯与二层走廊
    node('stair_a_top', null, [3.3, 1.7, -0.5]),
    node('stair_landing', null, [3.3, 1.7, -1.3]),
    node('stair_b_mid', null, [2.5, 2, -1.3]),
    node('stair_b_top', 'villa_corridor', [0.4, 3.4, -1.3]),
    node('gallery_center', 'villa_corridor', [-3.3, 3.4, -1]),
    node('corridor2_center', 'villa_corridor', [-7.5, 3.4, -1], true),
    node('evelyn_door_corridor', 'villa_corridor', [-9.5, 3.4, -0.6]),
    node('evelyn_door_room', 'villa_evelyn_room', [-9.5, 3.4, 0.6]),
    node('evelyn_center', 'villa_evelyn_room', [-8.5, 3.4, 3.5], true),
    node('bathroom_door_corridor', 'villa_corridor', [-4.7, 3.4, -1.4]),
    node('bathroom_door_room', 'villa_bathroom', [-4.7, 3.4, -2.6]),
    node('bathroom_center', 'villa_bathroom', [-4.5, 3.4, -4], true),

    // 西侧露台
    node('terrace_outside', 'villa_cliff', [-11.6, 0, -1]),
    node('cliff_steps_top', 'villa_cliff', [-17, 0, -0.5]),
    node('cliff_steps_bottom', 'villa_cliff', [-19, -1.2, -0.5]),
    node('cliff_center', 'villa_cliff', [-21, -1.2, -1], true),
  ],
  edges: [
    ['gate_start', 'yard_turn'],
    ['yard_turn', 'yard_approach'],
    ['yard_approach', 'porch_bottom'],
    ['porch_bottom', 'porch_top'],
    ['porch_top', 'front_door'],
    ['front_door', 'hall_entry'],
    ['hall_entry', 'hall_center'],
    ['hall_center', 'hall_parlor'],
    ['hall_parlor', 'parlor_door'],
    ['parlor_door', 'parlor_center'],
    ['parlor_center', 'parlor_terrace'],
    ['parlor_terrace', 'terrace_outside'],
    ['terrace_outside', 'cliff_steps_top'],
    ['cliff_steps_top', 'cliff_steps_bottom'],
    ['cliff_steps_bottom', 'cliff_center'],
    ['hall_center', 'hall_dining'],
    ['hall_dining', 'dining_door'],
    ['dining_door', 'dining_center'],
    ['hall_center', 'hall_corridor'],
    ['hall_corridor', 'corridor_mouth'],
    ['corridor_mouth', 'corridor_center'],
    ['corridor_center', 'study_door'],
    ['study_door', 'study_entry'],
    ['study_entry', 'study_center'],
    ['corridor_center', 'storage_door'],
    ['storage_door', 'storage_entry'],
    ['storage_entry', 'storage_center'],
    ['hall_center', 'hall_stair'],
    ['hall_stair', 'stair_a_top'],
    ['stair_a_top', 'stair_landing'],
    ['stair_landing', 'stair_b_mid'],
    ['stair_b_mid', 'stair_b_top'],
    ['stair_b_top', 'gallery_center'],
    ['gallery_center', 'corridor2_center'],
    ['corridor2_center', 'evelyn_door_corridor'],
    ['evelyn_door_corridor', 'evelyn_door_room'],
    ['evelyn_door_room', 'evelyn_center'],
    ['corridor2_center', 'bathroom_door_corridor'],
    ['bathroom_door_corridor', 'bathroom_door_room'],
    ['bathroom_door_room', 'bathroom_center'],
  ],
};
