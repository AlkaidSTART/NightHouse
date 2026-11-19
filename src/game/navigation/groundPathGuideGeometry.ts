import type { Vec3Tuple } from '../../shared/types/save';
import { distance3d } from './groundRoute.ts';

/** 只在玩家前方显示一个低干扰圆点，路线本身交给小地图展示。 */
const DOT_DISTANCE = 2.2;
const DOT_RADIUS = 0.2;
const HALO_RADIUS = 0.42;
const SURFACE_OFFSET = 0.028;
const SEGMENTS = 16;

export interface GroundPathGuideGeometry {
  positions: number[];
  normals: number[];
  colors: number[];
  indices: number[];
  markerCount: number;
}

/**
 * 在路线的第一个可见位置生成单个圆点。圆点只表达“朝下一个目标走”，
 * 不再把中间路径拆成一串箭头，避免地面指引抢占视线。
 */
export function buildGroundPathGuideGeometry(
  route: readonly Vec3Tuple[],
): GroundPathGuideGeometry | null {
  if (route.length < 2 || routeLength(route) < 0.3) {
    return null;
  }

  const center = pointAtDistance(route, DOT_DISTANCE);
  if (!center) {
    return null;
  }
  const direction = normalize3d(
    center[0] - route[0]![0],
    center[1] - route[0]![1],
    center[2] - route[0]![2],
  );
  const side = normalize3d(-direction[2], 0, direction[0]);
  const normal: Vec3Tuple = [0, 1, 0];
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  appendDisk(
    center,
    side,
    normal,
    HALO_RADIUS,
    0.18,
    positions,
    normals,
    colors,
    indices,
  );
  appendDisk(
    center,
    side,
    normal,
    DOT_RADIUS,
    0.95,
    positions,
    normals,
    colors,
    indices,
  );

  return {
    positions,
    normals,
    colors,
    indices,
    markerCount: 1,
  };
}

function appendDisk(
  center: Vec3Tuple,
  side: Vec3Tuple,
  normal: Vec3Tuple,
  radius: number,
  opacity: number,
  positions: number[],
  normals: number[],
  colors: number[],
  indices: number[],
): void {
  const base = positions.length / 3;
  const liftedCenter: Vec3Tuple = [
    center[0] + normal[0] * SURFACE_OFFSET,
    center[1] + normal[1] * SURFACE_OFFSET,
    center[2] + normal[2] * SURFACE_OFFSET,
  ];
  appendVertex(liftedCenter, normal, opacity, positions, normals, colors);
  for (let index = 0; index < SEGMENTS; index += 1) {
    const angle = (index / SEGMENTS) * Math.PI * 2;
    const point: Vec3Tuple = [
      center[0] + side[0] * Math.cos(angle) * radius,
      center[1] + side[1] * Math.cos(angle) * radius,
      center[2] + side[2] * Math.cos(angle) * radius,
    ];
    point[0] += normal[0] * SURFACE_OFFSET;
    point[1] += normal[1] * SURFACE_OFFSET;
    point[2] += normal[2] * SURFACE_OFFSET;
    appendVertex(point, normal, opacity, positions, normals, colors);
  }
  for (let index = 0; index < SEGMENTS; index += 1) {
    indices.push(
      base,
      base + 1 + index,
      base + 1 + ((index + 1) % SEGMENTS),
    );
  }
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

function pointAtDistance(
  route: readonly Vec3Tuple[],
  distance: number,
): Vec3Tuple | null {
  let traveled = 0;
  for (let index = 1; index < route.length; index += 1) {
    const from = route[index - 1];
    const to = route[index];
    if (!from || !to) {
      continue;
    }
    const segment = distance3d(from, to);
    if (segment < 1e-4) {
      continue;
    }
    if (traveled + segment >= distance) {
      const t = (distance - traveled) / segment;
      return [
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
        from[2] + (to[2] - from[2]) * t,
      ];
    }
    traveled += segment;
  }
  const last = route.at(-1);
  return last ? [last[0], last[1], last[2]] : null;
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
  return length < 1e-6 ? [1, 0, 0] : [x / length, y / length, z / length];
}
