import * as pc from 'playcanvas';
import type { AssetHost, ContainerLikeResource } from '../scene/SceneModelLoader.ts';

const HANDS_GLB_URL = '/assets/models/characters/sk_player_hands.glb';
const INTERACT_DURATION = 0.45;
/** 手指绕骨骼局部 X 轴负向旋转即向掌心弯曲，用来形成放松的自然手型。 */
const RELAXED_FINGER_01 = -6;
const RELAXED_FINGER_02 = -10;
const RELAXED_THUMB = -5;
const INTERACT_FINGER_01 = -16;
const INTERACT_FINGER_02 = -20;
/**
 * 双手整体下移、前移并略微收窄：模型本身按较宽的肩距摆放，
 * 直接使用会像张开双臂的僵直姿势，这里把手臂拉回身体两侧。
 */
const ROOT_POSITION = { x: 0, y: -0.06, z: -0.03 };
const ROOT_SCALE_X = 0.85;

interface BonePose {
  entity: pc.Entity;
  restPos: pc.Vec3;
  restRot: pc.Quat;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function isContainerResource(
  resource: unknown,
): resource is ContainerLikeResource {
  if (resource instanceof pc.ContainerResource) {
    return true;
  }
  return (
    typeof resource === 'object' &&
    resource !== null &&
    typeof (resource as ContainerLikeResource).instantiateRenderEntity ===
      'function'
  );
}

function releaseContainerAsset(host: AssetHost, asset: pc.Asset): void {
  const resource: unknown = asset.resource;
  if (isContainerResource(resource)) {
    const groups = [
      resource.renders,
      resource.materials,
      resource.textures,
      resource.animations,
      resource.gsplats,
    ];
    for (const group of groups) {
      if (!Array.isArray(group)) {
        continue;
      }
      for (const subAsset of group) {
        if (subAsset instanceof pc.Asset) {
          host.assets.remove(subAsset);
          subAsset.unload();
        }
      }
    }
  }
  host.assets.remove(asset);
  asset.unload();
}

/**
 * 第一人称玩家双手控制器：加载骨骼绑定的 `sk_player_hands.glb`，
 * 挂载到相机节点下，并在待机与交互时驱动细腻的骨骼微动。
 */
export class PlayerHands {
  private readonly host: AssetHost;
  private readonly parent: pc.Entity;
  private readonly reducedMotion: boolean;
  private readonly abortController = new AbortController();
  private readonly bones = new Map<string, BonePose>();
  private readonly deltaQuat = new pc.Quat();
  private readonly targetQuat = new pc.Quat();
  private readonly targetPos = new pc.Vec3();

  private asset: pc.Asset | null = null;
  private root: pc.Entity | null = null;
  private idleTime = 0;
  private interactElapsed = -1;
  private disposed = false;

  constructor(host: AssetHost, camera: pc.Entity, url = HANDS_GLB_URL) {
    this.host = host;
    this.parent = camera;
    this.reducedMotion = prefersReducedMotion();
    void this.load(url);
  }

  triggerInteract(): void {
    if (this.disposed || this.reducedMotion) {
      return;
    }
    this.interactElapsed = 0;
  }

  update(dt: number, isMoving = false): void {
    if (this.disposed || !this.root) {
      return;
    }

    if (this.reducedMotion) {
      return;
    }

    this.idleTime += dt * (isMoving ? 2.2 : 1.0);
    const breath = Math.sin(this.idleTime * 2.1);
    const sway = Math.cos(this.idleTime * 1.4);

    let interactWeight = 0;
    if (this.interactElapsed >= 0) {
      this.interactElapsed += dt;
      if (this.interactElapsed >= INTERACT_DURATION) {
        this.interactElapsed = -1;
      } else {
        const t = this.interactElapsed / INTERACT_DURATION;
        interactWeight = Math.pow(Math.sin(t * Math.PI), 0.85);
      }
    }

    // 左手：轻柔呼吸与微幅平衡摆动
    this.applyBoneOffset(
      'forearm_L',
      0,
      breath * 0.0025 + (isMoving ? sway * 0.002 : 0),
      -breath * 0.002,
      breath * 1.1,
      0,
      sway * 0.8,
    );
    this.applyBoneOffset('hand_L', 0, 0, 0, breath * 1.4, 0, -sway * 0.6);

    // 右手：呼吸摆动 + 交互时向上前探与微倾
    this.applyBoneOffset(
      'forearm_R',
      -0.03 * interactWeight,
      breath * 0.0025 + 0.12 * interactWeight + (isMoving ? -sway * 0.002 : 0),
      -breath * 0.002 + 0.05 * interactWeight,
      breath * 1.1 + 10.0 * interactWeight,
      -6.0 * interactWeight,
      -sway * 0.8 + 5.0 * interactWeight,
    );
    this.applyBoneOffset(
      'hand_R',
      0,
      0,
      0,
      breath * 1.4 - 10.0 * interactWeight,
      6.0 * interactWeight,
      sway * 0.6,
    );

    // 静息时手指保持轻微弯曲，交互时右手进一步收拢形成抓握感
    const fingerCurl =
      RELAXED_FINGER_01 + INTERACT_FINGER_01 * interactWeight + breath * 1.2;
    const tipCurl = RELAXED_FINGER_02 + INTERACT_FINGER_02 * interactWeight;
    this.applyBoneOffset(
      'thumb_01_R',
      0,
      0,
      0,
      RELAXED_THUMB - 5.0 * interactWeight,
      -5.0 * interactWeight,
      0,
    );
    for (const finger of ['index', 'middle', 'ring', 'pinky'] as const) {
      this.applyBoneOffset(`${finger}_01_R`, 0, 0, 0, fingerCurl, 0, 0);
      this.applyBoneOffset(`${finger}_02_R`, 0, 0, 0, tipCurl, 0, 0);
      this.applyBoneOffset(
        `${finger}_01_L`,
        0,
        0,
        0,
        RELAXED_FINGER_01 + breath * 1.2,
        0,
        0,
      );
      this.applyBoneOffset(`${finger}_02_L`, 0, 0, 0, RELAXED_FINGER_02, 0, 0);
    }
    this.applyBoneOffset('thumb_01_L', 0, 0, 0, RELAXED_THUMB, 0, 0);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.abortController.abort();
    this.bones.clear();
    if (this.root) {
      this.root.destroy();
      this.root = null;
    }
    if (this.asset) {
      releaseContainerAsset(this.host, this.asset);
      this.asset = null;
    }
  }

  private async load(url: string): Promise<void> {
    try {
      const { asset, root } = await this.loadContainer(
        url,
        this.abortController.signal,
      );
      if (this.disposed) {
        root.destroy();
        releaseContainerAsset(this.host, asset);
        return;
      }
      this.asset = asset;
      this.root = root;
      root.setLocalPosition(ROOT_POSITION.x, ROOT_POSITION.y, ROOT_POSITION.z);
      root.setLocalScale(ROOT_SCALE_X, 1, 1);
      this.parent.addChild(root);
      this.cacheBones(root);
      this.applyRelaxedPose();
    } catch (error) {
      if (!this.disposed) {
        console.warn('玩家双手模型加载失败，已降级为无手部模型显示。', error);
      }
    }
  }

  private loadContainer(
    url: string,
    signal: AbortSignal,
  ): Promise<{ asset: pc.Asset; root: pc.Entity }> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error('玩家双手模型加载已取消。'));
        return;
      }

      const asset = new pc.Asset('sk_player_hands', 'container', { url });
      let settled = false;

      const cleanup = (): void => {
        signal.removeEventListener('abort', onAbort);
        asset.off('load', onLoad);
        asset.off('error', onError);
      };

      const onAbort = (): void => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        releaseContainerAsset(this.host, asset);
        reject(new Error('玩家双手模型加载已取消。'));
      };

      const onLoad = (): void => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        const resource: unknown = asset.resource;
        if (!isContainerResource(resource)) {
          releaseContainerAsset(this.host, asset);
          reject(new Error('玩家双手模型资源无效。'));
          return;
        }
        const root = resource.instantiateRenderEntity({
          castShadows: false,
          receiveShadows: true,
        });
        resolve({ asset, root });
      };

      const onError = (message: string): void => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        releaseContainerAsset(this.host, asset);
        reject(new Error(`无法加载玩家双手模型：${message}`));
      };

      signal.addEventListener('abort', onAbort, { once: true });
      asset.once('load', onLoad);
      asset.once('error', onError);
      this.host.assets.add(asset);
      this.host.assets.load(asset);
    });
  }

  private cacheBones(root: pc.Entity): void {
    const names = [
      'forearm_L',
      'hand_L',
      'forearm_R',
      'hand_R',
      'thumb_01_L',
      'thumb_01_R',
      'index_01_L',
      'index_01_R',
      'index_02_L',
      'index_02_R',
      'middle_01_L',
      'middle_01_R',
      'middle_02_L',
      'middle_02_R',
      'ring_01_L',
      'ring_01_R',
      'ring_02_L',
      'ring_02_R',
      'pinky_01_L',
      'pinky_01_R',
      'pinky_02_L',
      'pinky_02_R',
    ];
    for (const name of names) {
      const node = root.findByName(name);
      if (node instanceof pc.Entity) {
        this.bones.set(name, {
          entity: node,
          restPos: node.getLocalPosition().clone(),
          restRot: node.getLocalRotation().clone(),
        });
      }
    }
  }

  /** 模型加载后先摆出放松手型；开启“减少动态效果”时 update 不再叠加微动。 */
  private applyRelaxedPose(): void {
    for (const side of ['L', 'R'] as const) {
      for (const finger of ['index', 'middle', 'ring', 'pinky'] as const) {
        this.applyBoneOffset(`${finger}_01_${side}`, 0, 0, 0, RELAXED_FINGER_01, 0, 0);
        this.applyBoneOffset(`${finger}_02_${side}`, 0, 0, 0, RELAXED_FINGER_02, 0, 0);
      }
      this.applyBoneOffset(`thumb_01_${side}`, 0, 0, 0, RELAXED_THUMB, 0, 0);
    }
  }

  private applyBoneOffset(
    name: string,
    dx: number,
    dy: number,
    dz: number,
    rxDeg: number,
    ryDeg: number,
    rzDeg: number,
  ): void {
    const bone = this.bones.get(name);
    if (!bone) {
      return;
    }
    this.targetPos.set(
      bone.restPos.x + dx,
      bone.restPos.y + dy,
      bone.restPos.z + dz,
    );
    bone.entity.setLocalPosition(this.targetPos);

    this.deltaQuat.setFromEulerAngles(rxDeg, ryDeg, rzDeg);
    this.targetQuat.mul2(bone.restRot, this.deltaQuat);
    bone.entity.setLocalRotation(this.targetQuat);
  }
}
