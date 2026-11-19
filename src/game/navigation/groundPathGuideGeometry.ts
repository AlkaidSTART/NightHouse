import type { Vec3Tuple } from '../../shared/types/save';
import { distance3d } from './groundRoute.ts';

/** 地面指引只展示玩家附近的一段，避免长路线在画面中形成密集光带。 */
const START_OFFSET = 1.55;
export const GROUND_PATH_MARKER_SPACING = 1.45;
const MAX_VISIBLE_DISTANCE = 11.5;
const CORE_LENGTH = 0.68;
const CORE_HEAD_HALF_WIDTH = 0.18;
const CORE_SHAFT_HALF_WIDTH = 0.06;
const GLOW_LENGTH = 0.82;
const GLOW_HEAD_HALF_WIDTH = 0.24;
const GLOW_SHAFT_HALF_WIDTH = 0.08;
const SURFACE_OFFSET = 0.028;
const MIN_VISIBLE_DISTANCE = 0.42;
const NEAR_OPACITY = 0.92;
const FAR_OPACITY = 0.2;
const FADE_START_DISTANCE = 1.55;
const FADE_END_DISTANCE = MAX_VISIBLE_DISTANCE;
const CLOSE_FADE_END_DISTANCE = 1.3;

export interface GroundPathGuideGeometry {
  positions: number[];
  normals: number[];
  colors: number[];
  indices: number[];
  markerCount: number;
}

/**
 * 生成完整的细箭杆与实心箭头尖。顶点透明度按路径距离衰减，让玩家先读到最近
 * 一步，而不是同时看见整条长路线。
 */
export function buildGroundPathGuideGeometry(
  route: readonly Vec3Tuple[],
  routePhase = 0,
): GroundPathGuideGeometry | null {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const totalLength = routeLength(route);
  if (totalLength < 0.3) {
    return null;
  }

  // Preserve the marker rhythm when routes are replanned from a moving player.
  let nextMarkerDistance = START_OFFSET - routePhase;
  while (nextMarkerDistance < MIN_VISIBLE_DISTANCE) {
    nextMarkerDistance += GROUND_PATH_MARKER_SPACING;
  }
  let traveled = 0;
  let markerCount = 0;

  for (let index = 1; index < route.length; index += 1) {
    const from = route[index - 1];
    const to = route[index];
    if (!from || !to) {
      continue;
    }
    const segmentLength = distance3d(from, to);
    if (segmentLength < 1e-4) {
      continue;
    }
    const tangent = normalize3d(
      to[0] - from[0],
      to[1] - from[1],
      to[2] - from[2],
    );

    while (nextMarkerDistance <= traveled + segmentLength) {
      const distanceAhead = nextMarkerDistance;
      if (distanceAhead > MAX_VISIBLE_DISTANCE) {
        break;
      }
      const t = (nextMarkerDistance - traveled) / segmentLength;
      const center: Vec3Tuple = [
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
        from[2] + (to[2] - from[2]) * t,
      ];
      appendMarker(
        center,
        tangent,
        opacityAtDistance(distanceAhead),
        positions,
        normals,
        colors,
        indices,
      );
      markerCount += 1;
      nextMarkerDistance += GROUND_PATH_MARKER_SPACING;
    }

    if (nextMarkerDistance > MAX_VISIBLE_DISTANCE) {
      break;
    }
    traveled += segmentLength;
  }

  if (markerCount === 0) {
    return null;
  }
  return { positions, normals, colors, indices, markerCount };
}

function appendMarker(
  center: Vec3Tuple,
  tangent: Vec3Tuple,
  opacity: number,
  positions: number[],
  normals: number[],
  colors: number[],
  indices: number[],
): void {
  const side = normalize3d(
    ...cross([0, 1, 0], tangent),
  );
  const normal = normalize3d(...cross(tangent, side));
  // 先画更宽更淡的外晕，再叠亮金色核心，形成接近开放世界导航的柔光层次。
  appendArrow(
    center,
    tangent,
    side,
    normal,
    GLOW_LENGTH,
    GLOW_HEAD_HALF_WIDTH,
    GLOW_SHAFT_HALF_WIDTH,
    opacity * 0.13,
    positions,
    normals,
    colors,
    indices,
  );
  appendArrow(
    center,
    tangent,
    side,
    normal,
    CORE_LENGTH,
    CORE_HEAD_HALF_WIDTH,
    CORE_SHAFT_HALF_WIDTH,
    opacity,
    positions,
    normals,
    colors,
    indices,
  );
}

function appendArrow(
  center: Vec3Tuple,
  tangent: Vec3Tuple,
  side: Vec3Tuple,
  normal: Vec3Tuple,
  length: number,
  headHalfWidth: number,
  shaftHalfWidth: number,
  opacity: number,
  positions: number[],
  normals: number[],
  colors: number[],
  indices: number[],
): void {
  const tip = offsetPoint(
    center,
    tangent,
    length * 0.58,
    side,
    0,
    normal,
    SURFACE_OFFSET,
  );
  const headLeft = offsetPoint(
    center,
    tangent,
    length * 0.12,
    side,
    headHalfWidth,
    normal,
    SURFACE_OFFSET,
  );
  const shoulderLeft = offsetPoint(
    center,
    tangent,
    -length * 0.08,
    side,
    shaftHalfWidth,
    normal,
    SURFACE_OFFSET,
  );
  const shaftEndLeft = offsetPoint(
    center,
    tangent,
    -length * 0.42,
    side,
    shaftHalfWidth,
    normal,
    SURFACE_OFFSET,
  );
  const shaftEndRight = offsetPoint(
    center,
    tangent,
    -length * 0.42,
    side,
    -shaftHalfWidth,
    normal,
    SURFACE_OFFSET,
  );
  const shoulderRight = offsetPoint(
    center,
    tangent,
    -length * 0.08,
    side,
    -shaftHalfWidth,
    normal,
    SURFACE_OFFSET,
  );
  const headRight = offsetPoint(
    center,
    tangent,
    length * 0.12,
    side,
    -headHalfWidth,
    normal,
    SURFACE_OFFSET,
  );

  const base = positions.length / 3;
  appendVertex(tip, normal, opacity, positions, normals, colors);
  appendVertex(headLeft, normal, opacity * 0.92, positions, normals, colors);
  appendVertex(shoulderLeft, normal, opacity * 0.82, positions, normals, colors);
  appendVertex(shaftEndLeft, normal, opacity * 0.74, positions, normals, colors);
  appendVertex(shaftEndRight, normal, opacity * 0.74, positions, normals, colors);
  appendVertex(shoulderRight, normal, opacity * 0.82, positions, normals, colors);
  appendVertex(headRight, normal, opacity * 0.92, positions, normals, colors);
  // 正面朝上，同时保证从楼梯斜面上看也不会被剔除。
  indices.push(
    base,
    base + 1,
    base + 2,
    base,
    base + 2,
    base + 3,
    base,
    base + 3,
    base + 4,
    base,
    base + 4,
    base + 5,
    base,
    base + 5,
    base + 6,
  );
}

function appendVertex(
  point: Vec3Tuple,
  normal: Vec3Tuple,
  opacity: number,
  positions: number[],
  normals: number[],
  colors: number[],
): void {
  positions.push(point[0], point[1], point[2]);
  normals.push(normal[0], normal[1], normal[2]);
  colors.push(1, 1, 1, opacity);
}

function offsetPoint(
  center: Vec3Tuple,
  forward: Vec3Tuple,
  forwardOffset: number,
  side: Vec3Tuple,
  sideOffset: number,
  normal: Vec3Tuple,
  normalOffset: number,
): Vec3Tuple {
  return [
    center[0] +
      forward[0] * forwardOffset +
      side[0] * sideOffset +
      normal[0] * normalOffset,
    center[1] +
      forward[1] * forwardOffset +
      side[1] * sideOffset +
      normal[1] * normalOffset,
    center[2] +
      forward[2] * forwardOffset +
      side[2] * sideOffset +
      normal[2] * normalOffset,
  ];
}

function opacityAtDistance(distance: number): number {
  const closeT = clamp(
    (distance - MIN_VISIBLE_DISTANCE) /
      (CLOSE_FADE_END_DISTANCE - MIN_VISIBLE_DISTANCE),
    0,
    1,
  );
  const closeFade = closeT * closeT * (3 - 2 * closeT);
  const farT = clamp(
    (distance - FADE_START_DISTANCE) /
      (FADE_END_DISTANCE - FADE_START_DISTANCE),
    0,
    1,
  );
  const farFade = farT * farT * (3 - 2 * farT);
  const distanceOpacity =
    NEAR_OPACITY + (FAR_OPACITY - NEAR_OPACITY) * farFade;
  return closeFade * distanceOpacity;
}

function routeLength(route: readonly Vec3Tuple[]): number {
  let length = 0;
  for (let index = 1; index < route.length; index += 1) {
    const from = route[index - 1];
    const to = route[index];
    if (from && to) {
      length += distance3d(from, to);
    }
  }
  return length;
}

function normalize3d(x: number, y: number, z: number): Vec3Tuple {
  const length = Math.hypot(x, y, z);
  if (length < 1e-6) {
    return [0, 0, -1];
  }
  return [x / length, y / length, z / length];
}

function cross(a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
