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
  /** 跨层时路过的出入口，例如「正门」「主楼梯」。 */
  via: string | null;
}

/**
 * 跨层时先指向出入口而不是房间中心。院墙、护墙和楼板都不在直线路径上，
 * 直接指向房间中心会把玩家带进花坛或楼梯下方。
 */
const FRONT_STEPS_AIM: Vec3Tuple = [0, 0, 10.1];
const FRONT_DOOR_AIM: Vec3Tuple = [-0.8, 0, 7.4];
const STAIR_FOOT_AIM: Vec3Tuple = [3.3, 0, 2.6];
const STAIR_LANDING_AIM: Vec3Tuple = [3.3, 0, -1.3];
const STAIR_TOP_AIM: Vec3Tuple = [0.4, 0, -1.3];

interface RouteAim {
  point: Vec3Tuple;
  via: string;
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
    return playerLevel === 'outdoor' ? '进入宅内上楼' : '需上楼';
  }
  if (targetLevel === 'floor1') {
    return playerLevel === 'outdoor' ? '进入宅内' : '需下楼';
  }
  return playerLevel === 'outdoor' ? null : '走到室外';
}

function routeAimPoint(
  targetLevel: MinimapLevelId,
  playerLevel: MinimapLevelId,
  playerPosition: Vec3Tuple,
): RouteAim | null {
  if (playerLevel === targetLevel) {
    return null;
  }

  if (playerLevel === 'floor2') {
    // 下楼先走到楼梯平台，再沿第一段梯面向南；到一层后下一帧改指正门。
    return playerPosition[0] > 2.4
      ? { point: STAIR_FOOT_AIM, via: '主楼梯' }
      : { point: STAIR_LANDING_AIM, via: '主楼梯' };
  }

  if (playerLevel === 'outdoor') {
    const [x, , z] = playerPosition;
    // 喷泉正好压在车道中线。八方向提示只会取整到一格，绕行点必须明显偏到
    // 侧面，否则仍会显示「北」并把玩家顶在喷泉南沿。
    const side = x < -0.2 ? -3.5 : 3.5;
    if (z > 24) {
      return { point: [side, 0, 21.5], via: '正门' };
    }
    if (z > 18.5) {
      return { point: [side, 0, 18], via: '正门' };
    }
    // 走上台阶后再对准门；斜穿院子会被护墙挡住。
    return z > 11
      ? { point: FRONT_STEPS_AIM, via: '正门' }
      : { point: FRONT_DOOR_AIM, via: '正门' };
  }

  if (targetLevel === 'floor2') {
    const [x, y, z] = playerPosition;
    if (y >= 1.2 && x > 2.4) {
      return {
        point: z < -0.4 ? STAIR_TOP_AIM : STAIR_LANDING_AIM,
        via: '主楼梯',
      };
    }
    return { point: STAIR_FOOT_AIM, via: '主楼梯' };
  }

  return { point: FRONT_STEPS_AIM, via: '正门' };
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
  let via: string | null = null;

  if (playerPosition) {
    const playerLevel = regionLevel(playerRegionId ?? '', playerPosition[1]);
    levelHint = levelHintFor(playerLevel, targetLevel);
    const aim = routeAimPoint(targetLevel, playerLevel, playerPosition);
    // 跨层时距离与方向指向出入口，而不是藏在墙后的房间中心。
    const point = arrived ? center : aim?.point ?? center;
    via = arrived ? null : aim?.via ?? null;
    const dx = point[0] - playerPosition[0];
    const dz = point[2] - playerPosition[2];
    distance = Math.hypot(dx, dz);
    direction = bearingLabel(dx, dz);
  }

  return {
    regionName: region.name,
    floorLabel: regionFloorLabel(targetRegionId, center[1]),
    arrived,
    distance,
    direction,
    levelHint,
    via,
  };
}
