import * as pc from 'playcanvas';
import { villaNavigation } from '../../content/scenes/villaNavigation.ts';
import type { Vec3Tuple } from '../../shared/types/save';
import {
  buildGroundPathGuideGeometry,
  GROUND_PATH_MARKER_SPACING,
} from './groundPathGuideGeometry.ts';
import { findGroundRoute } from './groundRoute.ts';

const PATH_COLOR = new pc.Color(1, 0.88, 0.44);
const REBUILD_DISTANCE = 0.65;

/**
 * 任务目标的动态地面路标。玩家移动约 0.6 米后，从当前脚底重新规划到目标的
 * 路径；箭头间距相位连续，直线路段不会因重算路径而整串滑动。
 *
 * 视觉上只显示玩家附近的一小段低亮路标，并用顶点透明度向远处衰减；
 * 这比整条高亮箭头更接近开放世界导航，也能减少地面闪烁和视觉疲劳。
 */
export class GroundPathGuide {
  private readonly entity: pc.Entity;
  private readonly mesh: pc.Mesh;
  private readonly meshInstance: pc.MeshInstance;
  private readonly material: pc.StandardMaterial;
  private lastBuildTarget: string | null = null;
  private lastBuildRegion: string | null = null;
  private lastPlayerPosition: Vec3Tuple | null = null;
  private distanceSinceRebuild = 0;
  private routeDistanceTravelled = 0;
  private routeDirection: Vec3Tuple = [0, 0, 0];
  private hasAttemptedRoute = false;
  private hasGeometry = false;

  constructor(app: pc.Application) {
    this.mesh = new pc.Mesh(app.graphicsDevice);
    this.material = new pc.StandardMaterial();
    this.material.diffuse = PATH_COLOR;
    this.material.emissive = PATH_COLOR;
    this.material.emissiveIntensity = 0.9;
    this.material.useLighting = false;
    this.material.opacityVertexColor = true;
    this.material.opacityVertexColorChannel = 'a';
    this.material.blendType = pc.BLEND_NORMAL;
    this.material.depthWrite = false;
    this.material.cull = pc.CULLFACE_NONE;
    this.material.update();

    this.meshInstance = new pc.MeshInstance(this.mesh, this.material);
    this.entity = new pc.Entity('ground_path_guide');
    this.entity.addComponent('render', {
      meshInstances: [this.meshInstance],
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
    if (!visible) {
      this.setVisible(false);
      return;
    }
    if (!targetRegionId || !playerRegionId) {
      this.hide();
      return;
    }
    if (playerRegionId === targetRegionId) {
      this.hide();
      return;
    }

    const targetChanged = this.lastBuildTarget !== targetRegionId;
    const regionChanged = this.lastBuildRegion !== playerRegionId;
    const routeChanged =
      targetChanged || regionChanged || this.lastPlayerPosition === null;
    if (routeChanged) {
      this.lastBuildTarget = targetRegionId;
      this.lastBuildRegion = playerRegionId;
      this.distanceSinceRebuild = 0;
      this.routeDistanceTravelled = 0;
      this.routeDirection = [0, 0, 0];
      this.lastPlayerPosition = [
        playerPosition[0],
        playerPosition[1],
        playerPosition[2],
      ];
    } else if (this.lastPlayerPosition) {
      const movedX = playerPosition[0] - this.lastPlayerPosition[0];
      const movedY = playerPosition[1] - this.lastPlayerPosition[1];
      const movedZ = playerPosition[2] - this.lastPlayerPosition[2];
      this.distanceSinceRebuild += Math.hypot(movedX, movedY, movedZ);
      // Signed progress keeps the arrow rhythm steady when the player backs up.
      this.routeDistanceTravelled +=
        movedX * this.routeDirection[0] +
        movedY * this.routeDirection[1] +
        movedZ * this.routeDirection[2];
      this.lastPlayerPosition[0] = playerPosition[0];
      this.lastPlayerPosition[1] = playerPosition[1];
      this.lastPlayerPosition[2] = playerPosition[2];
    }

    if (
      routeChanged ||
      !this.hasAttemptedRoute ||
      this.distanceSinceRebuild >= REBUILD_DISTANCE
    ) {
      this.hasAttemptedRoute = true;
      const route = findGroundRoute({
        graph: villaNavigation,
        targetRegionId,
        playerRegionId,
        playerPosition,
      });
      const routePhase =
        ((this.routeDistanceTravelled % GROUND_PATH_MARKER_SPACING) +
          GROUND_PATH_MARKER_SPACING) %
        GROUND_PATH_MARKER_SPACING;
      if (!route || !this.buildMesh(route, routePhase)) {
        this.hideGeometry();
        this.distanceSinceRebuild = 0;
        return;
      }
      const nextPoint = route[1];
      if (nextPoint) {
        const directionLength = Math.hypot(
          nextPoint[0] - playerPosition[0],
          nextPoint[1] - playerPosition[1],
          nextPoint[2] - playerPosition[2],
        );
        if (directionLength > 1e-6) {
          this.routeDirection = [
            (nextPoint[0] - playerPosition[0]) / directionLength,
            (nextPoint[1] - playerPosition[1]) / directionLength,
            (nextPoint[2] - playerPosition[2]) / directionLength,
          ];
        }
      }
      this.distanceSinceRebuild = 0;
    }

    this.hasGeometry = true;
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
    this.lastBuildTarget = null;
    this.lastBuildRegion = null;
    this.lastPlayerPosition = null;
    this.distanceSinceRebuild = 0;
    this.routeDistanceTravelled = 0;
    this.routeDirection = [0, 0, 0];
    this.hasAttemptedRoute = false;
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

  private buildMesh(route: readonly Vec3Tuple[], routePhase: number): boolean {
    const geometry = buildGroundPathGuideGeometry(route, routePhase);
    if (!geometry) {
      return false;
    }

    this.mesh.clear(true, true);
    this.mesh.setPositions(geometry.positions);
    this.mesh.setNormals(geometry.normals);
    this.mesh.setColors(geometry.colors, 4);
    this.mesh.setIndices(geometry.indices);
    this.mesh.update(pc.PRIMITIVE_TRIANGLES, true);
    // 网格首次更新时新增了顶点颜色流，需要重新挂载以触发着色器布局重建。
    this.meshInstance.mesh = this.mesh;
    return true;
  }

}
