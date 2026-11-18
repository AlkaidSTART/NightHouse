import * as pc from 'playcanvas';
import { villaNavigation } from '../../content/scenes/villaNavigation.ts';
import type { Vec3Tuple } from '../../shared/types/save';
import { distance3d, findGroundRoute } from './groundRoute.ts';

const PATH_COLOR = new pc.Color(0.9, 0.69, 0.32);
const ARROW_SPACING = 1.15;
const ARROW_START_OFFSET = 0.7;
const ARROW_LENGTH = 0.52;
const ARROW_HALF_WIDTH = 0.19;
const SURFACE_OFFSET = 0.035;
const REBUILD_DISTANCE = 0.9;

/**
 * 任务目标的地面箭头路径。路径复用内容层导航图，并在玩家离开当前路径起点
 * 约一米后重建，避免每帧创建几何或分配临时对象。
 */
export class GroundPathGuide {
  private readonly entity: pc.Entity;
  private readonly mesh: pc.Mesh;
  private readonly material: pc.StandardMaterial;
  private lastBuildTarget: string | null = null;
  private lastBuildRegion: string | null = null;
  private lastBuildPosition: Vec3Tuple | null = null;
  private hasGeometry = false;

  constructor(app: pc.Application) {
    this.mesh = new pc.Mesh(app.graphicsDevice);
    this.material = new pc.StandardMaterial();
    this.material.diffuse = PATH_COLOR;
    this.material.emissive = PATH_COLOR;
    this.material.emissiveIntensity = 1.35;
    this.material.useLighting = false;
    this.material.opacity = 0.72;
    this.material.blendType = pc.BLEND_NORMAL;
    this.material.depthWrite = false;
    this.material.cull = pc.CULLFACE_NONE;
    this.material.update();

    this.entity = new pc.Entity('ground_path_guide');
    this.entity.addComponent('render', {
      meshInstances: [new pc.MeshInstance(this.mesh, this.material)],
      castShadows: false,
      receiveShadows: false,
    });
    this.entity.enabled = false;
    app.root.addChild(this.entity);
  }

  update(
    playerPosition: Vec3Tuple,
    playerRegionId: string | null,
    targetRegionId: string | null,
    visible: boolean,
  ): void {
    if (!visible || !targetRegionId || !playerRegionId) {
      this.hide();
      return;
    }
    if (playerRegionId === targetRegionId) {
      this.hide();
      return;
    }

    const targetChanged = this.lastBuildTarget !== targetRegionId;
    const regionChanged = this.lastBuildRegion !== playerRegionId;
    const movedEnough =
      this.lastBuildPosition === null ||
      distance3d(this.lastBuildPosition, playerPosition) >= REBUILD_DISTANCE;
    if (!targetChanged && !regionChanged && !movedEnough) {
      this.setVisible(true);
      return;
    }

    const route = findGroundRoute({
      graph: villaNavigation,
      targetRegionId,
      playerRegionId,
      playerPosition,
    });
    this.lastBuildTarget = targetRegionId;
    this.lastBuildRegion = playerRegionId;
    this.lastBuildPosition = [
      playerPosition[0],
      playerPosition[1],
      playerPosition[2],
    ];

    if (!route || route.length < 2) {
      this.hideGeometry();
      return;
    }

    if (!this.buildMesh(route)) {
      this.hideGeometry();
      return;
    }
    this.hasGeometry = true;
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
    this.lastBuildTarget = null;
    this.lastBuildRegion = null;
    this.lastBuildPosition = null;
  }

  destroy(): void {
    this.entity.destroy();
    this.mesh.destroy();
    this.material.destroy();
    this.hasGeometry = false;
  }

  private setVisible(visible: boolean): void {
    if (!this.hasGeometry) {
      this.entity.enabled = false;
      return;
    }
    this.entity.enabled = visible;
  }

  private hideGeometry(): void {
    this.hasGeometry = false;
    this.setVisible(false);
  }

  private buildMesh(route: readonly Vec3Tuple[]): boolean {
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    const totalLength = routeLength(route);
    if (totalLength < 0.3) {
      return false;
    }

    const firstMarker = Math.min(ARROW_START_OFFSET, totalLength * 0.35);
    let nextMarker = firstMarker;
    let traveled = 0;
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
      while (nextMarker <= traveled + segmentLength) {
        const t = (nextMarker - traveled) / segmentLength;
        const center: Vec3Tuple = [
          from[0] + (to[0] - from[0]) * t,
          from[1] + (to[1] - from[1]) * t,
          from[2] + (to[2] - from[2]) * t,
        ];
        appendArrow(center, tangent, positions, normals, indices);
        nextMarker += ARROW_SPACING;
      }
      traveled += segmentLength;
    }

    if (indices.length === 0) {
      return false;
    }

    this.mesh.clear(true, true);
    this.mesh.setPositions(positions);
    this.mesh.setNormals(normals);
    this.mesh.setIndices(indices);
    this.mesh.update(pc.PRIMITIVE_TRIANGLES, true);
    return true;
  }
}

function appendArrow(
  center: Vec3Tuple,
  tangent: Vec3Tuple,
  positions: number[],
  normals: number[],
  indices: number[],
): void {
  const up = new pc.Vec3(0, 1, 0);
  const forward = new pc.Vec3(tangent[0], tangent[1], tangent[2]).normalize();
  const side = new pc.Vec3().cross(up, forward);
  if (side.lengthSq() < 1e-5) {
    side.set(1, 0, 0);
  } else {
    side.normalize();
  }
  const normal = new pc.Vec3().cross(side, forward).normalize();

  const tip = offsetPoint(
    center,
    forward,
    ARROW_LENGTH * 0.62,
    side,
    0,
    normal,
    SURFACE_OFFSET,
  );
  const backLeft = offsetPoint(
    center,
    forward,
    -ARROW_LENGTH * 0.38,
    side,
    ARROW_HALF_WIDTH,
    normal,
    SURFACE_OFFSET,
  );
  const backRight = offsetPoint(
    center,
    forward,
    -ARROW_LENGTH * 0.38,
    side,
    -ARROW_HALF_WIDTH,
    normal,
    SURFACE_OFFSET,
  );

  const base = positions.length / 3;
  for (const point of [tip, backLeft, backRight]) {
    positions.push(point[0], point[1], point[2]);
    normals.push(normal.x, normal.y, normal.z);
  }
  // 侧向量为 up × forward 时，该顺序让三角形正面朝上。
  indices.push(base, base + 2, base + 1);
}

function offsetPoint(
  center: Vec3Tuple,
  forward: pc.Vec3,
  forwardOffset: number,
  side: pc.Vec3,
  sideOffset: number,
  normal: pc.Vec3,
  normalOffset: number,
): Vec3Tuple {
  return [
    center[0] +
      forward.x * forwardOffset +
      side.x * sideOffset +
      normal.x * normalOffset,
    center[1] +
      forward.y * forwardOffset +
      side.y * sideOffset +
      normal.y * normalOffset,
    center[2] +
      forward.z * forwardOffset +
      side.z * sideOffset +
      normal.z * normalOffset,
  ];
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
