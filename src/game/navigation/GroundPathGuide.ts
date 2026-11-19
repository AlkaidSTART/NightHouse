import * as pc from 'playcanvas';
import { villaNavigation } from '../../content/scenes/villaNavigation.ts';
import type { Vec3Tuple } from '../../shared/types/save';
import {
  buildGroundPathGuideGeometry,
  getGroundPathProgress,
} from './groundPathGuideGeometry.ts';
import { findGroundRoute } from './groundRoute.ts';

const PATH_COLOR = new pc.Color(1, 0.78, 0.38);
const REBUILD_DISTANCE = 0.9;

/**
 * 任务目标的地面路标。路径复用内容层导航图，并在玩家离开当前路径起点
 * 约半米后只更新玩家前方的可见窗口，箭头位置始终锚定在导航路径上，
 * 避免移动时整串路标滑动。
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
  private lastRoute: Vec3Tuple[] | null = null;
  private lastBuildProgress = 0;
  private hasGeometry = false;

  constructor(app: pc.Application) {
    this.mesh = new pc.Mesh(app.graphicsDevice);
    this.material = new pc.StandardMaterial();
    this.material.diffuse = PATH_COLOR;
    this.material.emissive = PATH_COLOR;
    this.material.emissiveIntensity = 0.65;
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
      targetChanged || regionChanged || this.lastRoute === null;
    if (routeChanged) {
      this.lastRoute = findGroundRoute({
        graph: villaNavigation,
        targetRegionId,
        playerRegionId,
        playerPosition,
      });
      this.lastBuildTarget = targetRegionId;
      this.lastBuildRegion = playerRegionId;
      this.lastBuildProgress = 0;
    }

    if (!this.lastRoute || this.lastRoute.length < 2) {
      this.hideGeometry();
      return;
    }

    const routeProgress = getGroundPathProgress(
      this.lastRoute,
      playerPosition,
      Math.max(0, this.lastBuildProgress - 2.2),
      this.lastBuildProgress + 2.2,
    );
    if (
      routeChanged ||
      !this.hasGeometry ||
      Math.abs(routeProgress - this.lastBuildProgress) >= REBUILD_DISTANCE
    ) {
      if (!this.buildMesh(this.lastRoute, routeProgress)) {
        this.hideGeometry();
        return;
      }
      this.lastBuildProgress = routeProgress;
    }

    this.hasGeometry = true;
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
    this.lastBuildTarget = null;
    this.lastBuildRegion = null;
    this.lastRoute = null;
    this.lastBuildProgress = 0;
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

  private buildMesh(route: readonly Vec3Tuple[], routeProgress: number): boolean {
    const geometry = buildGroundPathGuideGeometry(route, routeProgress);
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
