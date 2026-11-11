import * as pc from 'playcanvas';

/**
 * 导出 GLB 里的 `INT_` / `NPC_` / `SPAWN_` / `LIGHT_` / `COL_` 空物体只是给 Blender 阶段
 * 对接用的摆放点；游戏里这些位置、灯光和碰撞仍由内容数据驱动，所以加载后整组丢掉，
 * 避免出现重复的灯光（GLB 的灯光强度语义与运行时不同）。
 */
export const MARKER_GROUPS = ['INT', 'NPC', 'SPAWN', 'LIGHT', 'COL'] as const;

/** 加载 GLB 只需要资源注册表，便于在没有 WebGL 的环境里测试。 */
export interface AssetHost {
  assets: {
    add(asset: pc.Asset): void;
    load(asset: pc.Asset): void;
    remove(asset: pc.Asset): boolean;
  };
}

export function stripMarkerGroups(root: pc.Entity): void {
  for (const name of MARKER_GROUPS) {
    root.findByName(name)?.destroy();
  }
}

/** 已加载并实例化的场景模型。`dispose` 释放实体和容器资源（网格、材质、贴图），可重复调用。 */
export class SceneModel {
  readonly root: pc.Entity;
  private readonly host: AssetHost;
  private readonly asset: pc.Asset;
  private disposed = false;

  constructor(host: AssetHost, asset: pc.Asset, root: pc.Entity) {
    this.host = host;
    this.asset = asset;
    this.root = root;
  }

  /** 门扇节点；缺失时返回 null，由调用方决定是否放弃整个模型。 */
  findDoorLeaf(doorId: string): pc.Entity | null {
    const node = this.root.findByName(`${doorId}_leaf`);
    return node instanceof pc.Entity ? node : null;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.root.destroy();
    releaseAsset(this.host, this.asset);
  }
}

export interface ContainerLikeResource {
  instantiateRenderEntity(options?: {
    castShadows?: boolean;
    receiveShadows?: boolean;
  }): pc.Entity;
  renders?: pc.Asset[];
  materials?: pc.Asset[];
  textures?: pc.Asset[];
  animations?: pc.Asset[];
  gsplats?: pc.Asset[];
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

function releaseAsset(host: AssetHost, asset: pc.Asset): void {
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
 * 加载场景 GLB 并实例化为实体树（尚未挂到场景里）。
 * 失败或被 `signal` 取消时会释放已创建的资源并 reject，调用方不必再清理。
 */
export function loadSceneModel(
  host: AssetHost,
  url: string,
  signal: AbortSignal,
): Promise<SceneModel> {
  return new Promise<SceneModel>((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error('场景模型加载已取消。'));
      return;
    }

    const asset = new pc.Asset(url, 'container', { url });
    let settled = false;

    const finish = (action: () => void): void => {
      if (settled) {
        return;
      }
      settled = true;
      signal.removeEventListener('abort', onAbort);
      asset.off('load', onLoad);
      asset.off('error', onError);
      action();
    };

    const onAbort = (): void => {
      finish(() => {
        releaseAsset(host, asset);
        reject(new Error('场景模型加载已取消。'));
      });
    };

    const onError = (error: unknown): void => {
      finish(() => {
        releaseAsset(host, asset);
        reject(new Error(`场景模型加载失败：${String(error)}`));
      });
    };

    const onLoad = (): void => {
      finish(() => {
        const resource: unknown = asset.resource;
        if (!isContainerResource(resource)) {
          releaseAsset(host, asset);
          reject(new Error('场景模型不是有效的 GLB 容器。'));
          return;
        }
        try {
          const root = resource.instantiateRenderEntity({
            castShadows: false,
            receiveShadows: false,
          });
          stripMarkerGroups(root);
          resolve(new SceneModel(host, asset, root));
        } catch (error) {
          releaseAsset(host, asset);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    };

    signal.addEventListener('abort', onAbort);
    asset.on('load', onLoad);
    asset.on('error', onError);
    host.assets.add(asset);
    host.assets.load(asset);
  });
}
