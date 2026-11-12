import type { StoryCondition } from './content';
import type { Vec3Tuple } from './save';

export interface Aabb {
  min: Vec3Tuple;
  max: Vec3Tuple;
}

export type SceneMaterialId =
  | 'wall'
  | 'floor'
  | 'ceiling'
  | 'ground'
  | 'roof'
  | 'wood'
  | 'fabric'
  | 'tile'
  | 'stone'
  | 'metal'
  | 'paper'
  | 'photo'
  | 'mirror'
  | 'foliage'
  | 'sea'
  | 'door'
  | 'windowLit'
  | 'windowDark'
  | 'npcArthur'
  | 'npcHousekeeper'
  | 'npcDoctor';

export interface SceneBox extends Aabb {
  id: string;
  material: SceneMaterialId;
  /** 参与玩家碰撞与交互射线遮挡。 */
  collide: boolean;
  /** 仅碰撞、不渲染的边界盒设为 false。 */
  visible: boolean;
}

/**
 * 可行走面。平面时 y0 === y1；斜坡沿 axis 方向从 min 端的 y0 线性变化到 max 端的 y1。
 * 楼梯的碰撞用斜坡表达，不逐级建台阶（见场景建模方案 §4.3）。
 */
export interface WalkSurface {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y0: number;
  y1: number;
  axis: 'x' | 'z';
}

export interface SceneRegion {
  /** 与故事线 §2.1 的区域 ID 一致。 */
  id: string;
  name: string;
  /** 以玩家脚底位置判定；一个区域可以由多个体积组成（如一层走廊 + 二层走廊）。 */
  volumes: Aabb[];
}

export interface SceneDoor {
  id: string;
  name: string;
  /** 合页底端位置。门扇从这里沿 axis 正方向延伸 width。 */
  hinge: Vec3Tuple;
  axis: 'x' | 'z';
  width: number;
  height: number;
  /** 开门时绕合页旋转的方向。 */
  swing: 1 | -1;
  startsOpen: boolean;
  /** 永久锁闭的装饰门（不可进入的房间）。 */
  sealed: boolean;
  /** 解锁条件：外层为「或」，内层为「且」。缺省表示不上锁。 */
  unlockWhen?: StoryCondition[][];
  lockedMessage: string;
}

export interface SceneInteractable {
  /** `INT_` 前缀的摆放点 ID，后续由 Blender 空物体提供同名位置。 */
  id: string;
  position: Vec3Tuple;
  radius: number;
  prompt: string;
  message: string;
}

export interface SceneNpcSpot {
  /** `NPC_` 前缀的站位 ID。 */
  id: string;
  npcId: 'npc_arthur' | 'npc_housekeeper' | 'npc_doctor';
  label: string;
  /** 脚底位置。 */
  position: Vec3Tuple;
  /** 朝向角度（偏航角 yaw，度数），可选。 */
  yaw?: number;
  /** 取决于尚未裁决的事项时填写，裁决后删除多余站位。 */
  pending?: string;
}

export interface SceneLight {
  id: string;
  position: Vec3Tuple;
  color: Vec3Tuple;
  intensity: number;
  range: number;
}

export interface SceneSpawn {
  id: string;
  /** 脚底位置。 */
  position: Vec3Tuple;
  yaw: number;
}

export interface SceneDefinition {
  id: string;
  /** 整场景 GLB 的静态资源路径；加载成功后替换代码生成的方盒与门扇。 */
  modelUrl?: string;
  /** NPC 角色模型的静态资源路径映射。加载成功后替换方盒占位。 */
  characterModelUrls?: Partial<Record<SceneNpcSpot['npcId'], string>>;
  boxes: SceneBox[];
  surfaces: WalkSurface[];
  regions: SceneRegion[];
  doors: SceneDoor[];
  interactables: SceneInteractable[];
  npcSpots: SceneNpcSpot[];
  lights: SceneLight[];
  spawns: SceneSpawn[];
}
