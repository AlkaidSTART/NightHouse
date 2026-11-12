import { villaGreybox } from '../../content/scenes/villaGreybox.ts';
import type { Vec3Tuple } from '../../shared/types/save';
import type { SceneRegion } from '../../shared/types/scene';
import { resolveMinimapLevel, type MinimapLevelId } from './minimapModel.ts';

const OUTDOOR_REGION_IDS: ReadonlySet<string> = new Set([
  'scene_gate',
  'villa_cliff',
]);

/** 指南针方向，索引 0 为正北，顺时针每 45° 一格。 */
const DIRECTIONS = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'] as const;

const FLOOR_LABEL: Record<MinimapLevelId, string> = {
  outdoor: '室外',
  floor1: '一层',
  floor2: '二层',
};

export interface RouteInfo {
  regionName: string;
  floorLabel: string;
  /** 玩家已完成抵达。 */
  arrived: boolean;
  /** 水平直线距离（米）；缺少玩家位置时为 null。 */
  distance: number | null;
  /** 以玩家为原点的八方向。 */
  direction: string | null;
  /** 目标与玩家不在同一层/同一室内外范围时的提示，例如「需上楼」。 */
  levelHint: string | null;
}

export function findRegion(regionId: string): SceneRegion | null {
  return villaGreybox.regions.find((region) => region.id === regionId) ?? null;
}

/** 区域多个体积的联合包围盒中心；单体积房间即房间中心。 */
export function regionCenter(region: SceneRegion): Vec3Tuple {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (const volume of region.volumes) {
    minX = Math.min(minX, volume.min[0]);
    minY = Math.min(minY, volume.min[1]);
    minZ = Math.min(minZ, volume.min[2]);
    maxX = Math.max(maxX, volume.max[0]);
    maxY = Math.max(maxY, volume.max[1]);
    maxZ = Math.max(maxZ, volume.max[2]);
  }

  if (!Number.isFinite(minX)) {
    return [0, 0, 0];
  }
  return [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];
}

/** 北 = −Z，东 = +X；返回玩家面向目标时需要朝哪个八方向走。 */
export function bearingLabel(dx: number, dz: number): string {
  if (dx === 0 && dz === 0) {
    return '此处';
  }
  const angle = (Math.atan2(dx, -dz) * 180) / Math.PI;
  const index = Math.round(((angle + 360) % 360) / 45) % 8;
  return DIRECTIONS[index] ?? '北';
}

export function regionLevel(regionId: string, centerY: number): MinimapLevelId {
  return resolveMinimapLevel(regionId, centerY);
}

export function regionFloorLabel(regionId: string, centerY: number): string {
  if (OUTDOOR_REGION_IDS.has(regionId)) {
    return FLOOR_LABEL.outdoor;
  }
  return FLOOR_LABEL[regionLevel(regionId, centerY)];
}

function levelHintFor(
  playerLevel: MinimapLevelId,
  targetLevel: MinimapLevelId,
): string | null {
  if (playerLevel === targetLevel) {
    return null;
  }
  if (targetLevel === 'floor2') {
    return '需上楼';
  }
  if (targetLevel === 'floor1') {
    return playerLevel === 'outdoor' ? '进入宅内' : '需下楼';
  }
  return playerLevel === 'outdoor' ? null : '走到室外';
}

/**
 * 根据目标区域与玩家当前位置生成路线说明。玩家尚未获得位置时只返回地点名，
 * 面板仍能显示目标与路线提示。
 */
export function describeRoute(
  targetRegionId: string,
  playerRegionId: string | null,
  playerPosition: Vec3Tuple | null,
): RouteInfo | null {
  const region = findRegion(targetRegionId);
  if (!region) {
    return null;
  }

  const center = regionCenter(region);
  const arrived = playerRegionId === targetRegionId;
  const targetLevel = regionLevel(targetRegionId, center[1]);

  let distance: number | null = null;
  let direction: string | null = null;
  let levelHint: string | null = null;

  if (playerPosition) {
    const dx = center[0] - playerPosition[0];
    const dz = center[2] - playerPosition[2];
    distance = Math.hypot(dx, dz);
    direction = bearingLabel(dx, dz);
    const playerLevel = regionLevel(playerRegionId ?? '', playerPosition[1]);
    levelHint = levelHintFor(playerLevel, targetLevel);
  }

  return {
    regionName: region.name,
    floorLabel: regionFloorLabel(targetRegionId, center[1]),
    arrived,
    distance,
    direction,
    levelHint,
  };
}
