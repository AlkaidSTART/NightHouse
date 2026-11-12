import type {
  Aabb,
  SceneDefinition,
  SceneDoor,
  SceneRegion,
} from '../../shared/types/scene';

export type MinimapLevelId = 'outdoor' | 'floor1' | 'floor2';

/** 与区域数据一致的一层/二层分界；玩家脚底高于它就算在二层。 */
export const MINIMAP_FLOOR_BASE = 3.3;
export const MINIMAP_SIZE = 200;

const OUTDOOR_REGION_IDS: ReadonlySet<string> = new Set([
  'scene_gate',
  'villa_cliff',
]);
/** 地图四周留白（米），避免房间轮廓贴边。 */
const PADDING = 1.1;
const LEVEL_LABEL: Record<MinimapLevelId, string> = {
  outdoor: '室外',
  floor1: '一层',
  floor2: '二层',
};

export interface MinimapPoint {
  x: number;
  y: number;
}

export interface MinimapRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** 室外视图里作为宅邸轮廓的次要房间。 */
  muted: boolean;
}

export interface MinimapDoor {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface MinimapViewport {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  size: number;
}

export interface MinimapLevelModel {
  id: MinimapLevelId;
  label: string;
  size: number;
  viewport: MinimapViewport;
  rooms: MinimapRoom[];
  doors: MinimapDoor[];
}

interface VolumeEntry {
  region: SceneRegion;
  volume: Aabb;
  muted: boolean;
}

/** 根据当前区域和脚底高度决定显示哪一层平面。 */
export function resolveMinimapLevel(
  regionId: string | null,
  feetY: number,
): MinimapLevelId {
  if (regionId !== null && OUTDOOR_REGION_IDS.has(regionId)) {
    return 'outdoor';
  }
  // 前院、崖边和门廊台阶都在宅邸地坪以下，室内不存在这个高度。
  if (feetY < -0.4) {
    return 'outdoor';
  }
  return feetY >= MINIMAP_FLOOR_BASE ? 'floor2' : 'floor1';
}

export function buildMinimapLevel(
  scene: SceneDefinition,
  level: MinimapLevelId,
): MinimapLevelModel {
  const volumes = collectVolumes(scene, level);
  const viewport = createViewport(collectBounds(volumes));

  return {
    id: level,
    label: LEVEL_LABEL[level],
    size: MINIMAP_SIZE,
    viewport,
    rooms: volumes.map((entry) => toRoom(entry, viewport)),
    doors: scene.doors
      .filter((door) => doorLevel(door) === level)
      .map((door) => toDoor(door, viewport)),
  };
}

export function worldToMinimap(
  viewport: MinimapViewport,
  x: number,
  z: number,
): MinimapPoint {
  return {
    x: viewport.offsetX + (x - viewport.minX) * viewport.scale,
    // 北 = −Z，映射到屏幕上方。
    y: viewport.offsetY + (z - viewport.minZ) * viewport.scale,
  };
}

function collectVolumes(
  scene: SceneDefinition,
  level: MinimapLevelId,
): VolumeEntry[] {
  const entries: VolumeEntry[] = [];

  if (level === 'outdoor') {
    // 先画宅邸轮廓，再把前后院与露台叠在上面。
    for (const region of scene.regions) {
      if (OUTDOOR_REGION_IDS.has(region.id)) {
        continue;
      }
      for (const volume of region.volumes) {
        if (volume.min[1] < MINIMAP_FLOOR_BASE) {
          entries.push({ region, volume, muted: true });
        }
      }
    }
  }

  for (const region of scene.regions) {
    const outdoor = OUTDOOR_REGION_IDS.has(region.id);
    if (level === 'outdoor' ? !outdoor : outdoor) {
      continue;
    }
    for (const volume of region.volumes) {
      if (level === 'outdoor') {
        entries.push({ region, volume, muted: false });
        continue;
      }
      const upper = volume.min[1] >= MINIMAP_FLOOR_BASE;
      if (upper === (level === 'floor2')) {
        entries.push({ region, volume, muted: false });
      }
    }
  }

  return entries;
}

function collectBounds(entries: readonly VolumeEntry[]): Aabb {
  let minX = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (const { volume } of entries) {
    minX = Math.min(minX, volume.min[0]);
    minZ = Math.min(minZ, volume.min[2]);
    maxX = Math.max(maxX, volume.max[0]);
    maxZ = Math.max(maxZ, volume.max[2]);
  }

  if (!Number.isFinite(minX)) {
    return { min: [-1, 0, -1], max: [1, 3.4, 1] };
  }
  return { min: [minX, 0, minZ], max: [maxX, 3.4, maxZ] };
}

function createViewport(bounds: Aabb): MinimapViewport {
  const minX = bounds.min[0] - PADDING;
  const maxX = bounds.max[0] + PADDING;
  const minZ = bounds.min[2] - PADDING;
  const maxZ = bounds.max[2] + PADDING;
  const spanX = Math.max(maxX - minX, 0.001);
  const spanZ = Math.max(maxZ - minZ, 0.001);
  const scale = Math.min(MINIMAP_SIZE / spanX, MINIMAP_SIZE / spanZ);

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    scale,
    offsetX: (MINIMAP_SIZE - spanX * scale) / 2,
    offsetY: (MINIMAP_SIZE - spanZ * scale) / 2,
    size: MINIMAP_SIZE,
  };
}

function toRoom(entry: VolumeEntry, viewport: MinimapViewport): MinimapRoom {
  const topLeft = worldToMinimap(
    viewport,
    entry.volume.min[0],
    entry.volume.min[2],
  );
  const bottomRight = worldToMinimap(
    viewport,
    entry.volume.max[0],
    entry.volume.max[2],
  );
  return {
    id: entry.region.id,
    name: entry.region.name,
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
    muted: entry.muted,
  };
}

function doorLevel(door: SceneDoor): MinimapLevelId {
  if (door.hinge[1] < -0.4) {
    return 'outdoor';
  }
  return door.hinge[1] >= MINIMAP_FLOOR_BASE ? 'floor2' : 'floor1';
}

function toDoor(door: SceneDoor, viewport: MinimapViewport): MinimapDoor {
  const [x, , z] = door.hinge;
  const endX = door.axis === 'x' ? x + door.width : x;
  const endZ = door.axis === 'z' ? z + door.width : z;
  const start = worldToMinimap(viewport, x, z);
  const end = worldToMinimap(viewport, endX, endZ);
  return {
    id: door.id,
    x1: start.x,
    y1: start.y,
    x2: end.x,
    y2: end.y,
  };
}
