import type { Vec3Tuple } from '../../shared/types/save';
import type {
  SceneBox,
  SceneDefinition,
  SceneDoor,
  SceneInteractable,
  SceneLight,
  SceneMaterialId,
  SceneNpcSpot,
  SceneRegion,
  WalkSurface,
} from '../../shared/types/scene';

/**
 * 全宅灰盒（M1）。尺寸与布局依据《场景建模方案 V0.2》§2–§3。
 * 坐标：北 = −Z，南 = +Z，东 = +X，西 = −X；原点在门厅地面。
 * 这里只有方盒与摆放点，用来验证动线、视线和步行时间；
 * 交互点的文字是占位说明，不是剧情文本。
 */

const F2 = 3.4;
/** 前院地面标高：宅邸坐在 0.75 m 的台基上，门廊前 5 级踏步（4 个踏面）下到前院。 */
const YARD = -0.75;
/** 台基南缘（柱廊平台外沿）与台阶底端的 z。 */
const PLINTH_EDGE_Z = 9.45;
const PORCH_STEPS_END_Z = 10.65;
const F2_TOP = 6.6;
const SLAB_BOTTOM = 3.1;
const ROOF_TOP = 9.4;
const HALF_WALL = 0.1;
const LOCKED_MESSAGE = '门锁着。';

interface Opening {
  from: number;
  to: number;
  /** 洞口顶部的绝对高度。 */
  top: number;
}

interface BoxOptions {
  collide?: boolean;
  visible?: boolean;
}

const boxes: SceneBox[] = [];

function box(
  id: string,
  min: Vec3Tuple,
  max: Vec3Tuple,
  material: SceneMaterialId,
  options: BoxOptions = {},
): void {
  boxes.push({
    id,
    min,
    max,
    material,
    collide: options.collide ?? true,
    visible: options.visible ?? true,
  });
}

/** 家具与陈设：由平面范围和高度给出，y 为底面高度。 */
function prop(
  id: string,
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  y: number,
  height: number,
  material: SceneMaterialId,
  options: BoxOptions = {},
): void {
  box(id, [x0, y, z0], [x1, y + height, z1], material, options);
}

/** 沿某条直线的墙，在洞口处断开并补上门楣。 */
function wall(
  id: string,
  axis: 'x' | 'z',
  fixed: number,
  from: number,
  to: number,
  y0: number,
  y1: number,
  openings: Opening[] = [],
  material: SceneMaterialId = 'wall',
): void {
  const span = (a: number, b: number, bottom: number, suffix: string): void => {
    if (b - a < 1e-6 || y1 - bottom < 1e-6) {
      return;
    }
    const min: Vec3Tuple =
      axis === 'x'
        ? [a, bottom, fixed - HALF_WALL]
        : [fixed - HALF_WALL, bottom, a];
    const max: Vec3Tuple =
      axis === 'x' ? [b, y1, fixed + HALF_WALL] : [fixed + HALF_WALL, y1, b];
    box(`${id}_${suffix}`, min, max, material);
  };

  let cursor = from;
  [...openings]
    .sort((a, b) => a.from - b.from)
    .forEach((opening, index) => {
      span(cursor, opening.from, y0, `seg${index}`);
      span(opening.from, opening.to, opening.top, `lintel${index}`);
      cursor = opening.to;
    });
  span(cursor, to, y0, 'end');
}

// ───────────────────────── 建筑外壳：一层 ─────────────────────────

wall('ext_south_1f', 'x', 7, -11, 11, 0, F2, [{ from: -0.8, to: 0.8, top: 2.4 }]);
wall('ext_west_1f', 'z', -11, -8, 7, 0, F2, [{ from: -1.8, to: -0.2, top: 2.4 }]);
wall('ext_east_1f', 'z', 11, 0, 7, 0, F2);
wall('study_north', 'x', -8, -11, -6, 0, F2);
wall('study_east', 'z', -6, -8, -2, 0, F2);
wall('storage_north', 'x', -6, -6, -3, 0, F2);
wall('storage_east', 'z', -3, -6, -2, 0, F2);
wall('corridor_north_1f', 'x', -2, -11, 4, 0, F2, [
  { from: -9, to: -8, top: 2.2 },
  { from: -5.5, to: -4.5, top: 2.2 },
]);
wall('corridor_south_1f', 'x', 0, -11, -4, 0, F2);
wall('hall_west_1f', 'z', -4, -2, 7, 0, F2, [
  { from: -1.8, to: -0.2, top: 2.6 },
  { from: 2.7, to: 4.3, top: 2.4 },
]);
wall('hall_east_1f', 'z', 4, -2, 7, 0, F2, [{ from: 2.7, to: 4.3, top: 2.4 }]);
// 一层东北服务区：不可进入，用实体体量表示。
box('mass_service_1f', [4, 0, -7], [11, F2, 0], 'wall');

// ───────────────────────── 建筑外壳：二层与屋顶 ─────────────────────────

wall('ext_south_2f', 'x', 7, -11, 11, F2, F2_TOP);
wall('ext_west_2f', 'z', -11, -8, 7, F2, F2_TOP);
wall('bathroom_north', 'x', -6, -6, -3, F2, F2_TOP, [], 'tile');
wall('bathroom_east', 'z', -3, -6, -2, F2, F2_TOP, [], 'tile');
wall('corridor_north_2f', 'x', -2, -6, 4, F2, F2_TOP, [
  { from: -5.2, to: -4.2, top: F2 + 2.2 },
]);
wall('corridor_south_2f', 'x', 0, -11, -4, F2, F2_TOP, [
  { from: -10, to: -9, top: F2 + 2.2 },
]);
// 二层不可进入的房间与东翼。
box('mass_room_nw_2f', [-11, F2, -8], [-6, F2_TOP, -2], 'wall');
box('mass_room_mid_2f', [-6, F2, 0], [-4, F2_TOP, 7], 'wall');
box('mass_east_wing_2f', [4, F2, -7], [11, F2_TOP, 7], 'wall');
// 三层与屋顶只做外观；它的底面同时是二层房间和门厅挑空的天花。
box('mass_roof', [-11.3, F2_TOP, -8.3], [11.3, ROOF_TOP, 7.3], 'roof');

// 楼板与地面（只渲染，行走高度由 surfaces 决定）。
const visualOnly: BoxOptions = { collide: false };
box('slab_parlor', [-11, SLAB_BOTTOM, 0], [-4, F2, 7], 'ceiling', visualOnly);
box('slab_corridor', [-11, SLAB_BOTTOM, -2], [-4, F2, 0], 'ceiling', visualOnly);
box('slab_gallery', [-4, SLAB_BOTTOM, -2], [0, F2, 0], 'ceiling', visualOnly);
box('slab_study', [-11, SLAB_BOTTOM, -8], [-6, F2, -2], 'ceiling', visualOnly);
box('slab_storage', [-6, SLAB_BOTTOM, -6], [-3, F2, -2], 'ceiling', visualOnly);
box('ground', [-17, -0.3, -12], [14, 0, PLINTH_EDGE_Z], 'ground', visualOnly);
box('ground_yard', [-17, YARD - 0.3, PLINTH_EDGE_Z], [14, YARD, 44], 'ground', visualOnly);
box('floor_house', [-11, 0, -8], [11, 0.02, 7], 'floor', visualOnly);
box('floor_gallery_2f', [-4, F2, -2], [0, F2 + 0.02, 0], 'floor', visualOnly);
box('floor_corridor_2f', [-11, F2, -2], [-4, F2 + 0.02, 0], 'floor', visualOnly);
box('floor_evelyn_2f', [-11, F2, 0], [-6, F2 + 0.02, 7], 'floor', visualOnly);
box('floor_bathroom_2f', [-6, F2, -6], [-3, F2 + 0.02, -2], 'tile', visualOnly);
box('floor_terrace', [-17, 0, -4], [-11, 0.03, 4], 'stone', visualOnly);
box('floor_driveway', [-2.5, YARD, PORCH_STEPS_END_Z], [2.5, YARD + 0.02, 40], 'stone', visualOnly);

// ───────────────────────── 主楼梯与回廊 ─────────────────────────

const STEPS_PER_FLIGHT = 10;
const LANDING_Y = F2 / 2;
for (let index = 0; index < STEPS_PER_FLIGHT; index += 1) {
  const rise = LANDING_Y / STEPS_PER_FLIGHT;
  // 第一跑：沿东墙向北上行。
  const z1 = 2 - (2.5 / STEPS_PER_FLIGHT) * index;
  const z0 = z1 - 2.5 / STEPS_PER_FLIGHT;
  box(`stair_a_step${index}`, [2.6, 0, z0], [4, rise * (index + 1), z1], 'wood', visualOnly);
  // 第二跑：沿北墙向西上行。
  const x1 = 2.6 - (2.6 / STEPS_PER_FLIGHT) * index;
  const x0 = x1 - 2.6 / STEPS_PER_FLIGHT;
  box(
    `stair_b_step${index}`,
    [x0, LANDING_Y + rise * index, -2],
    [x1, LANDING_Y + rise * (index + 1), -0.6],
    'wood',
    visualOnly,
  );
}
box('stair_landing', [2.6, LANDING_Y - 0.2, -2], [4, LANDING_Y, -0.5], 'wood', visualOnly);
// 楼梯下方封死，栏杆兼作侧向阻挡；这些盒子的高度都低于在梯面上行走的玩家。
box('stair_under_landing', [2.6, 0, -2], [4, LANDING_Y - 0.2, -0.5], 'wood');
box('stair_under_flight_b', [0, 0, -2], [2.6, LANDING_Y - 0.1, -0.6], 'wood');
box('stair_rail_a', [2.5, 0, -0.5], [2.6, LANDING_Y + 1, 2], 'wood');
box('stair_rail_b', [0, 0, -0.6], [2.6, F2 + 1, -0.5], 'wood');
box('gallery_rail_south', [-4, F2, -0.08], [0, F2 + 1, 0], 'wood');
box('gallery_rail_east', [0, F2, -0.6], [0.08, F2 + 1, 0], 'wood');

const surfaces: WalkSurface[] = [
  { id: 'ground', minX: -17, maxX: 14, minZ: -12, maxZ: PLINTH_EDGE_Z, y0: 0, y1: 0, axis: 'x' },
  // 台基比前院高 0.75 m，超过 MAX_DROP / STEP_UP，只能经门廊台阶上下。
  { id: 'yard', minX: -17, maxX: 14, minZ: PLINTH_EDGE_Z, maxZ: 44, y0: YARD, y1: YARD, axis: 'x' },
  { id: 'porch_steps', minX: -2.5, maxX: 2.5, minZ: PLINTH_EDGE_Z, maxZ: PORCH_STEPS_END_Z, y0: 0, y1: YARD, axis: 'z' },
  { id: 'stair_a', minX: 2.6, maxX: 4, minZ: -0.5, maxZ: 2, y0: LANDING_Y, y1: 0, axis: 'z' },
  { id: 'stair_landing', minX: 2.6, maxX: 4, minZ: -2, maxZ: -0.5, y0: LANDING_Y, y1: LANDING_Y, axis: 'x' },
  { id: 'stair_b', minX: 0, maxX: 2.6, minZ: -2, maxZ: -0.6, y0: F2, y1: LANDING_Y, axis: 'x' },
  { id: 'gallery', minX: -4, maxX: 0, minZ: -2, maxZ: 0, y0: F2, y1: F2, axis: 'x' },
  { id: 'corridor_2f', minX: -11, maxX: -4, minZ: -2, maxZ: 0, y0: F2, y1: F2, axis: 'x' },
  { id: 'evelyn_room', minX: -11, maxX: -6, minZ: 0, maxZ: 7, y0: F2, y1: F2, axis: 'x' },
  { id: 'bathroom', minX: -6, maxX: -3, minZ: -6, maxZ: -2, y0: F2, y1: F2, axis: 'x' },
  { id: 'cliff_steps', minX: -19, maxX: -17, minZ: -1.5, maxZ: 0.5, y0: -1.2, y1: 0, axis: 'x' },
  { id: 'cliff_platform', minX: -23, maxX: -19, minZ: -6, maxZ: 4, y0: -1.2, y1: -1.2, axis: 'x' },
];

// ───────────────────────── 室外抵达段 scene_gate ─────────────────────────

// 前院按鸟瞰参考图改为开阔的环形喷泉前院：树篱围在外圈（x = ±12），
// 北端用短折返接到柱廊前栏（veranda_bound_front_*），院子保持封闭。
prop('hedge_west', -12.2, -12, 9.2, 40.2, YARD, 1.8 - YARD, 'foliage');
prop('hedge_east', 12, 12.2, 9.2, 40.2, YARD, 1.8 - YARD, 'foliage');
prop('hedge_south', -12.2, 12.2, 40, 40.2, YARD, 1.8 - YARD, 'foliage');
prop('hedge_return_west', -12.2, -11.05, 9, PLINTH_EDGE_Z, YARD, 1.8 - YARD, 'foliage');
prop('hedge_return_east', 11.05, 12.2, 9, PLINTH_EDGE_Z, YARD, 1.8 - YARD, 'foliage');
prop('gate_fence_west', -12, -2, 35.95, 36.05, YARD, 2.2, 'metal');
prop('gate_fence_east', 2, 12, 35.95, 36.05, YARD, 2.2, 'metal');
prop('gate_pier_west', -2, -1.5, 35.75, 36.25, YARD, 2.6, 'stone');
prop('gate_pier_east', 1.5, 2, 35.75, 36.25, YARD, 2.6, 'stone');
prop('fountain', -1.5, 1.5, 20, 23, YARD, 0.8, 'stone');
prop('porch_roof', -2.5, 2.5, 7.1, 9.2, 2.7, 0.2, 'stone', visualOnly);
prop('porch_pillar_west', -2.5, -2.2, 8.9, 9.2, 0, 2.7, 'stone');
prop('porch_pillar_east', 2.2, 2.5, 8.9, 9.2, 0, 2.7, 'stone');

// 南立面柱廊（只在 Blender 精模里有几何）的栏杆与柱列碰撞：入口两柱之间留空，
// 两端侧栏封住柱廊，只能从车道正面进出。前栏 z 范围同时罩住柱础（半宽 0.2 m）。
const verandaBound: BoxOptions = { visible: false };
box('veranda_bound_front_west', [-11.05, 0, 8.8], [-2.5, 1.2, 9.2], 'stone', verandaBound);
box('veranda_bound_front_east', [2.5, 0, 8.8], [11.05, 1.2, 9.2], 'stone', verandaBound);

// 门廊台阶：5 级踏步、4 个踏面，每级 0.15 m × 0.3 m；两侧挡墙（含末端墩柱，故比台阶长 0.4 m）防止从台阶侧面跨出。
for (let index = 0; index < 4; index += 1) {
  const z0 = PLINTH_EDGE_Z + 0.3 * index;
  box(
    `porch_step${index}`,
    [-2.5, YARD, z0],
    [2.5, -0.15 * (index + 1), z0 + 0.3],
    'stone',
    visualOnly,
  );
}
box('porch_steps_wall_west', [-2.8, YARD, PLINTH_EDGE_Z], [-2.5, 0.45, PORCH_STEPS_END_Z + 0.4], 'stone');
box('porch_steps_wall_east', [2.5, YARD, PLINTH_EDGE_Z], [2.8, 0.45, PORCH_STEPS_END_Z + 0.4], 'stone');
box('veranda_bound_side_west', [-10.91, 0, 7.1], [-10.79, 1.2, 8.8], 'stone', verandaBound);
box('veranda_bound_side_east', [10.79, 0, 7.1], [10.91, 1.2, 8.8], 'stone', verandaBound);

// 南立面的窗：只做发光面片。二层西南那一扇是伊芙琳卧室，不亮（故事线 §1.5）。
const windowOptions: BoxOptions = { collide: false };
const litWindows: [string, number, number, number, number][] = [
  ['parlor_a', -9.6, -8.2, 0.9, 2.6],
  ['parlor_b', -6.8, -5.4, 0.9, 2.6],
  ['dining_a', 5.4, 6.8, 0.9, 2.6],
  ['dining_b', 8.2, 9.6, 0.9, 2.6],
  ['hall_upper', -0.7, 0.7, F2 + 0.8, F2 + 2.6],
  ['room_mid_2f', -5.6, -4.4, F2 + 0.8, F2 + 2.4],
  ['east_wing_a', 5.4, 6.8, F2 + 0.8, F2 + 2.4],
  ['east_wing_b', 8.2, 9.6, F2 + 0.8, F2 + 2.4],
];
for (const [name, x0, x1, y0, y1] of litWindows) {
  box(`window_${name}`, [x0, y0, 7.1], [x1, y1, 7.13], 'windowLit', windowOptions);
}
box('window_evelyn', [-9.3, F2 + 0.8, 7.1], [-7.7, F2 + 2.4, 7.13], 'windowDark', windowOptions);

// ───────────────────────── 门厅 villa_hall ─────────────────────────

prop('hall_longcase_clock', -2.8, -2.2, -1.9, -1.45, 0, 2.3, 'wood');
prop('hall_coat_hooks', -3.9, -3.8, 5, 6.2, 1.5, 0.3, 'wood', visualOnly);
prop('hall_entry_cabinet', 3.4, 3.9, 5, 6.4, 0, 0.9, 'wood');
prop('hall_signing_table', -0.9, 0.9, 3.6, 4.4, 0, 0.78, 'wood');
prop('hall_telephone', -3.9, -3.8, 0.4, 0.7, 1.3, 0.4, 'metal', visualOnly);
prop('hall_chandelier', -0.4, 0.4, 2.6, 3.4, 5.2, 0.6, 'metal', visualOnly);

// ───────────────────────── 客厅 villa_parlor ─────────────────────────

prop('parlor_fireplace', -10.9, -10.4, 2.6, 4.4, 0, 1.25, 'stone');
prop('parlor_mantel_clock', -10.75, -10.55, 3.4, 3.6, 1.25, 0.25, 'metal', visualOnly);
prop('parlor_family_portrait', -10.9, -10.85, 2.8, 4.2, 1.7, 0.9, 'photo', visualOnly);
// 帆船油画离墙留出缝隙，背面的题字只能从侧面看到（故事线 §3.2）。
prop('parlor_ship_painting', -6.2, -5, 0.34, 0.38, 1.3, 0.8, 'paper');
prop('parlor_sofa', -8.5, -6.5, 4.6, 5.5, 0, 0.8, 'fabric');
prop('parlor_coffee_table', -8.2, -6.8, 3.2, 3.9, 0, 0.45, 'wood');
prop('parlor_armchair_a', -9.9, -9.1, 1.6, 2.4, 0, 0.9, 'fabric');
prop('parlor_armchair_b', -9.9, -9.1, 4.6, 5.4, 0, 0.9, 'fabric');
prop('parlor_side_cabinet', -4.6, -4.1, 5, 6.6, 0, 0.9, 'wood');
prop('parlor_piano', -7.2, -5.6, 6.3, 6.9, 0, 1.3, 'wood');

// ───────────────────────── 一层走廊 villa_corridor ─────────────────────────

prop('corridor_mirror', -8, -7.2, -0.16, -0.1, 1, 1.2, 'mirror', visualOnly);

// ───────────────────────── 书房 villa_study ─────────────────────────

prop('study_fireplace', -10.9, -10.4, -5.9, -4.1, 0, 1.25, 'stone');
prop('study_hearth_rug', -10.3, -8.6, -6, -4, 0.02, 0.02, 'fabric', visualOnly);
prop('study_desk', -8.2, -6.8, -5.6, -4.8, 0, 0.78, 'wood');
prop('study_desk_chair', -7.8, -7.2, -6.5, -6, 0, 0.9, 'wood');
prop('study_desk_lamp', -7, -6.85, -5.5, -5.35, 0.78, 0.4, 'metal', visualOnly);
prop('study_safe', -8.3, -7.6, -7.9, -7.4, 0, 0.9, 'metal');
prop('study_bookshelf_north_a', -10.9, -8.5, -7.9, -7.5, 0, 2.6, 'wood');
prop('study_bookshelf_north_b', -7.4, -6.1, -7.9, -7.5, 0, 2.6, 'wood');
prop('study_bookshelf_east', -6.5, -6.1, -7.4, -5.2, 0, 2.6, 'wood');
prop('study_phonograph_table', -6.7, -6.1, -3.9, -3.2, 0, 0.7, 'wood');
prop('study_phonograph', -6.6, -6.2, -3.75, -3.35, 0.7, 0.5, 'metal', visualOnly);
prop('study_tide_table', -7.6, -6.9, -2.16, -2.1, 1.2, 0.7, 'paper', visualOnly);

// ───────────────────────── 储物间 villa_storage ─────────────────────────

prop('storage_cabinet', -5.9, -4.2, -5.9, -5.4, 0, 2, 'wood');
prop('storage_luggage', -3.9, -3.2, -3.6, -3, 0, 0.45, 'fabric');
prop('storage_newspapers', -3.6, -3.1, -5.3, -4.7, 0, 0.4, 'paper');
prop('storage_old_items_box', -5.9, -5.3, -4.6, -4, 0, 0.5, 'wood');
prop('storage_shelf', -3.5, -3.1, -4.4, -3.9, 0, 1.2, 'wood');
prop('storage_ship_model', -3.45, -3.15, -4.35, -3.95, 1.2, 0.3, 'paper', visualOnly);

// ───────────────────────── 餐厅 villa_dining ─────────────────────────

prop('dining_table', 5.9, 10.3, 2.95, 4.05, 0, 0.76, 'wood');
prop('dining_chair_head', 5.35, 5.8, 3.275, 3.725, 0, 0.9, 'wood');
const SEAT_PITCH = 4.4 / 6;
for (let index = 0; index < 6; index += 1) {
  const center = 5.9 + SEAT_PITCH * (index + 0.5);
  prop(`dining_chair_north_${index}`, center - 0.22, center + 0.22, 2.4, 2.85, 0, 0.9, 'wood');
  // 主位朝东，右手边是南侧；南侧最靠主位的一席是第十三席，椅背搭着披肩。
  prop(
    `dining_chair_south_${index}`,
    center - 0.22,
    center + 0.22,
    4.15,
    4.6,
    0,
    0.9,
    index === 0 ? 'fabric' : 'wood',
  );
}
prop('dining_sideboard', 7, 9, 0.1, 0.6, 0, 0.95, 'wood');
prop('dining_candelabra', 8, 8.2, 3.4, 3.6, 0.76, 0.5, 'metal', visualOnly);

// ───────────────────────── 伊芙琳卧室 villa_evelyn_room ─────────────────────────

prop('evelyn_bed', -8.4, -6.9, 0.2, 2.3, F2, 0.6, 'fabric');
prop('evelyn_nightstand', -6.8, -6.2, 0.2, 0.7, F2, 0.6, 'wood');
prop('evelyn_wardrobe', -6.7, -6.1, 3.2, 4.8, F2, 2.1, 'wood');
prop('evelyn_vanity', -10.9, -10.3, 3, 4.3, F2, 0.8, 'wood');
// 梳妆镜离墙留缝，镜框背面只能从侧面看到（故事线 §3.3）。
prop('evelyn_vanity_mirror', -10.62, -10.58, 3.2, 4.1, F2 + 0.9, 0.8, 'mirror');
prop('evelyn_curtain', -9.3, -7.7, 6.8, 6.9, F2 + 0.8, 1.8, 'fabric', visualOnly);

// ───────────────────────── 浴室 villa_bathroom ─────────────────────────

prop('bathroom_tub', -5.8, -4.1, -5.9, -5.1, F2, 0.6, 'stone');
prop('bathroom_basin', -3.5, -3.1, -4.6, -3.6, F2, 0.85, 'stone');
prop('bathroom_medicine_cabinet', -3.3, -3.1, -4.5, -3.7, F2 + 1.2, 0.7, 'wood', visualOnly);
prop('bathroom_towel_rack', -5.9, -5.8, -4.4, -3.4, F2 + 0.9, 0.4, 'metal', visualOnly);

// ───────────────────────── 二层走廊 ─────────────────────────

prop('corridor_family_photos', -7.6, -6.6, -1.99, -1.95, F2 + 1.3, 0.6, 'photo', visualOnly);

// ───────────────────────── 西侧露台 / 崖边 villa_cliff ─────────────────────────

prop('terrace_rail_north', -17, -11, -4, -3.9, 0, 1, 'stone');
prop('terrace_rail_south', -17, -11, 3.9, 4, 0, 1, 'stone');
prop('terrace_rail_west_a', -17, -16.9, -4, -1.5, 0, 1, 'stone');
prop('terrace_rail_west_b', -17, -16.9, 0.5, 4, 0, 1, 'stone');
for (let index = 0; index < 6; index += 1) {
  const x1 = -17 - (2 / 6) * index;
  box(
    `cliff_step${index}`,
    [x1 - 2 / 6, -1.5, -1.5],
    [x1, -0.2 * (index + 1), 0.5],
    'stone',
    visualOnly,
  );
}
box('cliff_platform', [-23, -1.5, -6], [-19, -1.2, 4], 'stone', visualOnly);
box('cliff_memorial_stone', [-21.8, -1.2, -0.3], [-21.2, -0.3, 0.3], 'stone');
box('sea', [-80, -6.2, -50], [-23, -6, 50], 'sea', visualOnly);
// 崖边与石阶两侧的不可见边界，防止坠落。
const boundary: BoxOptions = { visible: false };
box('cliff_bound_steps_north', [-19, -1.5, -1.6], [-17, 2, -1.5], 'stone', boundary);
box('cliff_bound_steps_south', [-19, -1.5, 0.5], [-17, 2, 0.6], 'stone', boundary);
box('cliff_bound_north', [-23, -1.5, -6.1], [-19, 2, -6], 'stone', boundary);
box('cliff_bound_south', [-23, -1.5, 4], [-19, 2, 4.1], 'stone', boundary);
box('cliff_bound_west', [-23.1, -1.5, -6], [-23, 2, 4], 'stone', boundary);
box('cliff_bound_east_a', [-19, -1.5, -6], [-18.9, 2, -1.5], 'stone', boundary);
box('cliff_bound_east_b', [-19, -1.5, 0.5], [-18.9, 2, 4], 'stone', boundary);

// ───────────────────────── 门 ─────────────────────────

function door(
  id: string,
  name: string,
  hinge: Vec3Tuple,
  axis: 'x' | 'z',
  width: number,
  height: number,
  extra: Partial<Pick<SceneDoor, 'unlockWhen' | 'sealed' | 'startsOpen' | 'swing'>> = {},
): SceneDoor {
  return {
    id,
    name,
    hinge,
    axis,
    width,
    height,
    swing: extra.swing ?? 1,
    startsOpen: extra.startsOpen ?? false,
    sealed: extra.sealed ?? false,
    unlockWhen: extra.unlockWhen,
    lockedMessage: LOCKED_MESSAGE,
  };
}

// 解锁条件取自故事线 §2.1 的「开放条件」列。
const doors: SceneDoor[] = [
  door('DOOR_gate', '铁门', [-1.5, YARD, 36], 'x', 3, 2.2),
  door('DOOR_front', '正门', [-0.8, 0, 7], 'x', 1.6, 2.4),
  door('DOOR_parlor', '客厅门', [-4, 0, 2.7], 'z', 1.6, 2.4, { startsOpen: true }),
  door('DOOR_dining', '餐厅门', [4, 0, 2.7], 'z', 1.6, 2.4, {
    unlockWhen: [[{ flag: 'story.met_arthur' }]],
    swing: -1,
  }),
  door('DOOR_study', '书房门', [-9, 0, -2], 'x', 1, 2.2, {
    unlockWhen: [[{ flag: 'story.met_arthur' }]],
  }),
  door('DOOR_storage', '储物间门', [-5.5, 0, -2], 'x', 1, 2.2, {
    unlockWhen: [[{ flag: 'item.storage_key' }]],
  }),
  door('DOOR_terrace', '露台门', [-11, 0, -1.8], 'z', 1.6, 2.4, {
    unlockWhen: [
      [{ flag: 'story.heard_recording' }],
      [{ flag: 'clue.hall_testimony' }],
    ],
  }),
  door('DOOR_evelyn_room', '卧室门', [-10, F2, 0], 'x', 1, 2.2, {
    unlockWhen: [[{ flag: 'story.housekeeper_key' }]],
    swing: -1,
  }),
  door('DOOR_bathroom', '浴室门', [-5.2, F2, -2], 'x', 1, 2.2, {
    unlockWhen: [[{ flag: 'story.met_doctor' }]],
  }),
  // 不可进入的房间：只有锁闭的门（场景建模方案 D7）。
  door('DOOR_sealed_service', '房门', [5, 0, 0], 'x', 1, 2.2, { sealed: true }),
  door('DOOR_sealed_2f_north', '房门', [-9, F2, -2], 'x', 1, 2.2, { sealed: true }),
  door('DOOR_sealed_2f_south', '房门', [-5.5, F2, 0], 'x', 1, 2.2, { sealed: true }),
];

// ───────────────────────── 交互点（占位） ─────────────────────────

function interact(
  id: string,
  position: Vec3Tuple,
  radius: number,
  prompt: string,
  message: string,
): SceneInteractable {
  return { id, position, radius, prompt, message: `占位：${message}` };
}

const interactables: SceneInteractable[] = [
  // 室外
  interact('INT_prop_gate_plaque', [1.75, 1.5 + YARD, 36.31], 0.25, '查看铜牌', '铁门铜牌。'),
  // 门厅
  interact('INT_prop_longcase_clock', [-2.5, 1.4, -1.38], 0.45, '查看落地钟', '落地钟，puzzle_clock 的操作位置。'),
  interact('INT_prop_cloak', [-3.74, 1.5, 6], 0.25, '查看最里侧的斗篷', '衣帽架最里侧的旧斗篷。'),
  interact('INT_prop_storage_key_ring', [-3.74, 1.6, 5.2], 0.2, '取下钥匙串', '储物间钥匙串（item.storage_key）。'),
  interact('INT_prop_telephone', [-3.74, 1.5, 0.55], 0.25, '查看壁挂电话', '断线的壁挂电话。'),
  interact('INT_prop_signing_table', [0, 0.9, 4], 0.5, '查看签字桌', 'B10 的遗嘱、墨水瓶和笔出现在这里。'),
  // 客厅
  interact('INT_prop_family_portrait', [-10.79, 2.15, 3.5], 0.5, '查看全家福', '全家福（clue_family_photo）。'),
  interact('INT_prop_motto', [-10.34, 1.05, 3], 0.25, '查看壁炉上的刻字', '家族箴言刻字。'),
  interact('INT_prop_mantel_clock', [-10.49, 1.38, 3.5], 0.2, '查看小座钟', '客厅小座钟，落地钟校时的参照。'),
  interact('INT_prop_ship_painting', [-5.75, 1.7, 0.44], 0.35, '查看帆船油画', '帆船油画正面（clue_ship_painting）。'),
  interact('INT_prop_ship_painting_back', [-5.25, 1.7, 0.2], 0.1, '查看画框背面', '帆船油画背面的题字（clue_ship_painting）。'),
  interact('INT_prop_piano', [-6.4, 1, 6.2], 0.4, '查看钢琴', '钢琴，echo_piano_note 的位置。'),
  // 一层走廊
  interact('INT_prop_corridor_mirror', [-7.6, 1.6, -0.22], 0.35, '查看走廊镜', '走廊镜，echo_mirror_delay 的位置。'),
  // 书房
  interact('INT_prop_tide_table', [-7.25, 1.55, -2.22], 0.35, '查看潮汐表', '潮汐表（clue_tide_table）。'),
  interact('INT_prop_study_desk_drawer', [-7.5, 0.35, -4.74], 0.3, '搜索书桌抽屉', '书桌最下层抽屉（clue_clock_key、clue_medical_record）。'),
  interact('INT_prop_study_hearth', [-10.34, 0.55, -5.4], 0.25, '查看壁炉石沿', '壁炉石沿（clue_burned_pages）。'),
  interact('INT_prop_study_ashes', [-10.34, 0.25, -4.5], 0.2, '查看壁炉灰烬', '壁炉灰烬里的账页（clue_burned_pages）。'),
  interact('INT_prop_study_rug', [-9.4, 0.12, -5], 0.4, '查看炉前地毯', '炉前地毯（clue_burned_pages）。'),
  interact('INT_prop_safe', [-7.95, 0.6, -7.34], 0.35, '查看保险箱', '保险箱，puzzle_safe 的操作位置。'),
  interact('INT_prop_phonograph', [-6.4, 0.95, -3.14], 0.3, '查看留声机', '蜡筒留声机（clue_gramophone_cylinder 的播放位置）。'),
  // 储物间
  interact('INT_prop_luggage', [-3.55, 0.55, -3.3], 0.35, '查看行李箱', '行李箱（clue_evelyn_luggage）。'),
  interact('INT_prop_newspaper_stack', [-3.35, 0.5, -5], 0.3, '翻看旧报纸', '旧报纸堆（clue_newspaper）。'),
  interact('INT_prop_old_items_box', [-5.6, 0.6, -4.3], 0.3, '查看旧物箱', '旧物箱里的裁纸剪（clue_evelyn_luggage）。'),
  interact('INT_prop_ship_model', [-3.56, 1.35, -4.15], 0.25, '查看船模', '船模。'),
  // 餐厅
  interact('INT_prop_thirteenth_setting', [6.27, 0.86, 3.85], 0.22, '查看第十三副餐具', '第十三副餐具（clue_dinner_seating）。'),
  interact('INT_prop_shawl', [6.27, 1, 4.66], 0.25, '查看椅背上的披肩', '椅背上的披肩（clue_dinner_seating）。'),
  interact('INT_prop_will_copy', [7.4, 0.86, 3.5], 0.3, '阅读桌上的遗嘱', '遗嘱副本（clue_will_clause）。'),
  // 二层走廊
  interact('INT_prop_family_photos', [-7.1, F2 + 1.6, -1.89], 0.35, '查看家族照片', '二层走廊的家族照片。'),
  // 伊芙琳卧室
  interact('INT_prop_nightstand', [-6.5, F2 + 0.7, 0.76], 0.3, '查看床头柜', '床头柜（clue_evelyn_diary）。'),
  interact('INT_prop_wardrobe', [-6.76, F2 + 1.1, 4], 0.4, '打开衣柜', '衣柜里的羊毛外套与摆锤（clue_pendulum）。'),
  interact('INT_prop_vanity_drawer', [-10.24, F2 + 0.5, 3.65], 0.3, '打开梳妆台抽屉', '梳妆台抽屉（clue_gramophone_cylinder、clue_evelyn_old_letters）。'),
  interact('INT_prop_vanity_mirror_back', [-10.76, F2 + 1.3, 3.65], 0.1, '查看镜框背面', '梳妆镜背面的半张照片（clue_family_photo）。'),
  // 浴室
  interact('INT_prop_medicine_cabinet', [-3.36, F2 + 1.55, -4.1], 0.3, '打开药柜', '药柜（clue_bathroom_trace）。'),
  interact('INT_prop_towel_rack', [-5.74, F2 + 1.1, -3.9], 0.3, '查看毛巾架', '毛巾架最里侧的旧毛巾（clue_bathroom_trace）。'),
  interact('INT_prop_tile_stain', [-4.6, F2 + 0.06, -3.6], 0.3, '查看地砖缝', '地砖缝里的暗痕（clue_bathroom_trace）。'),
  // 崖边
  interact('INT_prop_terrace_railing', [-16.84, 0.9, 2.5], 0.4, '靠近栏杆', '露台栏杆，echo_cliff_song 的位置。'),
  interact('INT_prop_memorial_stone', [-21.14, -0.7, 0], 0.4, '查看纪念石', '纪念石。'),
];

// ───────────────────────── NPC 站位（占位） ─────────────────────────

/** 格雷医生的到场时间尚未裁决（场景建模方案 D2），两种情况的站位都保留。 */
const D2_EARLY = 'D2 待裁决：仅当格雷开场即在场时使用';
const D2_LATE = 'D2 待裁决：仅当格雷 B4 才到场时使用';

const npcSpots: SceneNpcSpot[] = [
  { id: 'NPC_housekeeper_front_door', npcId: 'npc_housekeeper', label: '正门内侧（B1）', position: [1.3, 0, 6.2], yaw: 190 },
  { id: 'NPC_housekeeper_corridor_mouth', npcId: 'npc_housekeeper', label: '走廊口（十三下之后）', position: [-3.4, 0, 0.5], yaw: 45 },
  { id: 'NPC_housekeeper_hall_door_b10', npcId: 'npc_housekeeper', label: '门边（B10）', position: [-1.6, 0, 6.3], yaw: 210 },
  { id: 'NPC_housekeeper_dining_door', npcId: 'npc_housekeeper', label: '餐厅门边（B3）', position: [4.6, 0, 2.2], yaw: -90 },
  { id: 'NPC_arthur_parlor_fireplace', npcId: 'npc_arthur', label: '客厅壁炉旁（B2）', position: [-9, 0, 3], yaw: 90 },
  { id: 'NPC_arthur_dining_head', npcId: 'npc_arthur', label: '餐厅主位（B3）', position: [5.57, 0, 3.5], yaw: -90 },
  { id: 'NPC_arthur_gallery_rail', npcId: 'npc_arthur', label: '二楼栏杆边（十三下之后）', position: [-2.5, F2, -0.5], yaw: 160 },
  { id: 'NPC_arthur_study_desk', npcId: 'npc_arthur', label: '书桌椅（B9 对质）', position: [-7.5, 0, -6.25], yaw: 180 },
  { id: 'NPC_arthur_signing_table', npcId: 'npc_arthur', label: '签字桌边（B10）', position: [1.4, 0, 3.7], yaw: -45 },
  { id: 'NPC_doctor_dining_door', npcId: 'npc_doctor', label: '餐厅门口（十三下之后）', position: [3.3, 0, 3.5], yaw: -90 },
  { id: 'NPC_doctor_study_door_outside', npcId: 'npc_doctor', label: '书房门外（保险箱三次失败）', position: [-8.5, 0, -1.1], yaw: 0 },
  { id: 'NPC_doctor_stair_foot', npcId: 'npc_doctor', label: '楼梯口（B10）', position: [2.1, 0, 2.6], yaw: -135 },
  { id: 'NPC_doctor_parlor_armchair', npcId: 'npc_doctor', label: '客厅扶手椅（B2）', position: [-8.7, 0, 5], pending: D2_EARLY, yaw: 20 },
  { id: 'NPC_doctor_dining_side', npcId: 'npc_doctor', label: '餐厅侧席（B3）', position: [7, 0, 2.62], pending: D2_EARLY, yaw: -90 },
  { id: 'NPC_doctor_front_door_b4', npcId: 'npc_doctor', label: '正门内侧（B4 到访）', position: [-0.9, 0, 6.2], pending: D2_LATE, yaw: 0 },
];

// ───────────────────────── 区域 ─────────────────────────

const FLOOR_SPLIT = 3.3;

const regions: SceneRegion[] = [
  { id: 'villa_hall', name: '门厅', volumes: [{ min: [-4, -1, -2], max: [4, FLOOR_SPLIT, 7] }] },
  { id: 'villa_parlor', name: '客厅', volumes: [{ min: [-11, -1, 0], max: [-4, FLOOR_SPLIT, 7] }] },
  {
    id: 'villa_corridor',
    name: '走廊',
    volumes: [
      { min: [-11, -1, -2], max: [-4, FLOOR_SPLIT, 0] },
      { min: [-11, FLOOR_SPLIT, -2], max: [4, 7, 0] },
    ],
  },
  { id: 'villa_study', name: '书房', volumes: [{ min: [-11, -1, -8], max: [-6, FLOOR_SPLIT, -2] }] },
  { id: 'villa_storage', name: '储物间', volumes: [{ min: [-6, -1, -6], max: [-3, FLOOR_SPLIT, -2] }] },
  { id: 'villa_dining', name: '餐厅', volumes: [{ min: [4, -1, 0], max: [11, FLOOR_SPLIT, 7] }] },
  { id: 'villa_evelyn_room', name: '伊芙琳的卧室', volumes: [{ min: [-11, FLOOR_SPLIT, 0], max: [-6, 7, 7] }] },
  { id: 'villa_bathroom', name: '浴室', volumes: [{ min: [-6, FLOOR_SPLIT, -6], max: [-3, 7, -2] }] },
  { id: 'villa_cliff', name: '西侧露台', volumes: [{ min: [-24, -2, -7], max: [-11, 3, 5] }] },
  { id: 'scene_gate', name: '车道', volumes: [{ min: [-12.5, -1, 7], max: [12.5, 3, 41] }] },
];

// ───────────────────────── 灯光（占位，不投影） ─────────────────────────

const WARM: Vec3Tuple = [1, 0.8, 0.58];
const FIRE: Vec3Tuple = [1, 0.6, 0.32];
const ELECTRIC: Vec3Tuple = [1, 0.92, 0.78];
const COLD: Vec3Tuple = [0.62, 0.74, 0.95];

function light(
  id: string,
  position: Vec3Tuple,
  color: Vec3Tuple,
  intensity: number,
  range: number,
): SceneLight {
  return { id, position, color, intensity, range };
}

const lights: SceneLight[] = [
  light('LIGHT_gate_lamp', [1.75, 2.9 + YARD, 36.4], WARM, 1, 9),
  light('LIGHT_porch_lantern', [0, 2.4, 8.3], WARM, 1.5, 11),
  light('LIGHT_hall_chandelier', [0, 5, 3], ELECTRIC, 1.5, 14),
  light('LIGHT_hall_under_gallery', [-2, 2.6, -1], WARM, 0.6, 6),
  light('LIGHT_gallery', [-2, 6, -1], WARM, 0.45, 6),
  light('LIGHT_parlor_fire', [-9.8, 1.1, 3.5], FIRE, 1.4, 8),
  light('LIGHT_parlor_lamp', [-5.2, 2.3, 5.4], WARM, 0.8, 7),
  light('LIGHT_corridor_1f_west', [-9.5, 2.5, -1], WARM, 0.7, 5),
  light('LIGHT_corridor_1f_east', [-6, 2.5, -1], WARM, 0.7, 5),
  light('LIGHT_study_desk_lamp', [-7.2, 1.5, -5], [0.82, 1, 0.8], 0.9, 5.5),
  light('LIGHT_study_fire', [-9.8, 1, -5], FIRE, 1.2, 7),
  light('LIGHT_storage', [-4.5, 2.6, -4], WARM, 0.6, 5),
  light('LIGHT_dining_candles', [8.1, 1.9, 3.5], FIRE, 1.3, 9),
  light('LIGHT_corridor_2f_west', [-9.5, F2 + 2.5, -1], WARM, 0.6, 5),
  light('LIGHT_corridor_2f_east', [-6, F2 + 2.5, -1], WARM, 0.6, 5),
  // 伊芙琳的房间是全宅唯一没人住的房间，照度明显更低。
  light('LIGHT_evelyn_room', [-8.5, F2 + 2.2, 3.5], COLD, 0.35, 7),
  light('LIGHT_bathroom', [-4.5, F2 + 2.5, -4], COLD, 0.8, 5),
  light('LIGHT_terrace', [-12, 2.4, -1], WARM, 0.8, 8),
];

export const DEFAULT_CHARACTER_MODELS: Record<SceneNpcSpot['npcId'], string> = {
  npc_arthur: '/assets/models/characters/SK_NPC_Arthur_01.glb',
  npc_housekeeper: '/assets/models/characters/SK_NPC_Housekeeper_01.glb',
  npc_doctor: '/assets/models/characters/SK_NPC_Grey_01.glb',
};

export const villaGreybox: SceneDefinition = {
  id: 'villa_greybox',
  modelUrl: '/assets/scenes/scene_villa_full.glb',
  characterModelUrls: DEFAULT_CHARACTER_MODELS,
  boxes,
  surfaces,
  regions,
  doors,
  interactables,
  npcSpots,
  lights,
  spawns: [{ id: 'SPAWN_gate_start', position: [0, YARD, 38.5], yaw: 0 }],
};
