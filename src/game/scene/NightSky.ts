import * as pc from 'playcanvas';

/**
 * 夜空、月亮和海雾：室外氛围的运行时部分（GLB 只含几何）。
 *
 * 天穹与月亮跟随摄像机平移，始终处在远裁剪面以内；它们不受光照和雾影响。
 * 天穹贴图用 canvas 现场绘制，不引入外部图片资源。
 */

/** 雾色与天穹地平线同色，远处地形才能自然融进天空。 */
const HORIZON: readonly [number, number, number] = [0.05, 0.065, 0.095];
const ZENITH: readonly [number, number, number] = [0.012, 0.016, 0.03];
const FOG_DENSITY = 0.011;
/** 天穹半径必须小于摄像机 farClip（160）。 */
const DOME_RADIUS = 150;
const MOON_DISTANCE = 135;
/** 月亮方向：从铁门望向宅邸时位于屋顶右上方（东北偏高）。 */
const MOON_DIRECTION = new pc.Vec3(0.42, 0.5, -0.76).normalize();

export const NIGHT_CLEAR_COLOR = new pc.Color(HORIZON[0], HORIZON[1], HORIZON[2]);

function toCss(color: readonly [number, number, number], scale = 1): string {
  // 贴图按 sRGB 采样，这里把线性色近似转成显示色。
  const channel = (value: number): number =>
    Math.round(255 * Math.min(1, Math.pow(value * scale, 1 / 2.2)));
  return `rgb(${channel(color[0])}, ${channel(color[1])}, ${channel(color[2])})`;
}

/** 等距柱状天穹图：上下两极暗、赤道（地平线）亮，再叠几层低透明度的云。 */
function drawSkyCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) {
    return canvas;
  }
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, toCss(ZENITH));
  gradient.addColorStop(0.5, toCss(HORIZON));
  gradient.addColorStop(1, toCss(ZENITH));
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 固定种子的伪随机，保证每次启动云层一致。
  let seed = 1897;
  const random = (): number => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let index = 0; index < 90; index += 1) {
    const x = random() * canvas.width;
    const y = canvas.height * (0.14 + random() * 0.72);
    const radiusX = 60 + random() * 150;
    const radiusY = 10 + random() * 26;
    const bright = random() > 0.45;
    context.fillStyle = bright ? 'rgba(96, 110, 140, 0.05)' : 'rgba(2, 3, 6, 0.09)';
    // 在左右两侧各补画一次，避免经线接缝。
    for (const offset of [-canvas.width, 0, canvas.width]) {
      context.beginPath();
      context.ellipse(x + offset, y, radiusX, radiusY, 0, 0, Math.PI * 2);
      context.fill();
    }
  }
  return canvas;
}

/** 月晕：中心亮、向外平滑衰减到全黑（加色混合下黑色即透明）。 */
function drawHaloCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) {
    return canvas;
  }
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgb(120, 132, 160)');
  gradient.addColorStop(0.12, 'rgb(70, 80, 104)');
  gradient.addColorStop(0.4, 'rgb(22, 27, 38)');
  gradient.addColorStop(1, 'rgb(0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  return canvas;
}

function unlitMaterial(color: pc.Color): pc.StandardMaterial {
  const material = new pc.StandardMaterial();
  material.useLighting = false;
  material.useFog = false;
  material.diffuse = new pc.Color(0, 0, 0);
  material.emissive = color;
  return material;
}

export class NightSky {
  private readonly app: pc.Application;
  private readonly camera: pc.Entity;
  private readonly root: pc.Entity;
  private readonly materials: pc.StandardMaterial[] = [];
  private readonly texture: pc.Texture;
  private readonly haloTexture: pc.Texture;
  private destroyed = false;

  constructor(app: pc.Application, camera: pc.Entity) {
    this.app = app;
    this.camera = camera;

    const fog = app.scene.fog;
    fog.type = pc.FOG_EXP2;
    fog.color = new pc.Color(HORIZON[0], HORIZON[1], HORIZON[2]);
    fog.density = FOG_DENSITY;

    this.texture = new pc.Texture(app.graphicsDevice, {
      name: 'night_sky',
      srgb: true,
      mipmaps: false,
      minFilter: pc.FILTER_LINEAR,
      magFilter: pc.FILTER_LINEAR,
      addressU: pc.ADDRESS_REPEAT,
      addressV: pc.ADDRESS_CLAMP_TO_EDGE,
    });
    this.texture.setSource(drawSkyCanvas());

    this.root = new pc.Entity('night_sky');

    const domeMaterial = unlitMaterial(new pc.Color(1, 1, 1));
    domeMaterial.emissiveMap = this.texture;
    // 摄像机在球内，只画内表面；不写深度，保证场景物体总在天穹之前。
    domeMaterial.cull = pc.CULLFACE_FRONT;
    domeMaterial.depthWrite = false;
    domeMaterial.update();
    this.root.addChild(this.createSphere('night_sky_dome', domeMaterial, DOME_RADIUS * 2));

    const moonMaterial = unlitMaterial(new pc.Color(0.92, 0.95, 1));
    moonMaterial.update();
    const moon = this.createSphere('night_sky_moon', moonMaterial, 9);
    moon.setLocalPosition(MOON_DIRECTION.clone().mulScalar(MOON_DISTANCE));
    this.root.addChild(moon);

    // 月晕：朝向摄像机的面片 + 径向渐变贴图。天穹只跟随平移，所以朝向固定即可。
    this.haloTexture = new pc.Texture(app.graphicsDevice, {
      name: 'night_sky_halo',
      srgb: true,
      mipmaps: false,
      minFilter: pc.FILTER_LINEAR,
      magFilter: pc.FILTER_LINEAR,
      addressU: pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: pc.ADDRESS_CLAMP_TO_EDGE,
    });
    this.haloTexture.setSource(drawHaloCanvas());
    const haloMaterial = unlitMaterial(new pc.Color(1, 1, 1));
    haloMaterial.emissiveMap = this.haloTexture;
    haloMaterial.blendType = pc.BLEND_ADDITIVE;
    haloMaterial.depthWrite = false;
    haloMaterial.cull = pc.CULLFACE_NONE;
    haloMaterial.update();
    this.materials.push(haloMaterial);
    const halo = new pc.Entity('night_sky_moon_halo');
    halo.addComponent('render', {
      type: 'plane',
      material: haloMaterial,
      castShadows: false,
      receiveShadows: false,
    });
    halo.setLocalPosition(MOON_DIRECTION.clone().mulScalar(MOON_DISTANCE + 6));
    // lookAt 让 -Z 指向原点（摄像机），再把面片法线 +Y 转到 -Z 方向。
    halo.lookAt(pc.Vec3.ZERO);
    halo.rotateLocal(-90, 0, 0);
    halo.setLocalScale(70, 1, 70);
    this.root.addChild(halo);

    app.root.addChild(this.root);
    app.on('update', this.follow);
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.app.off('update', this.follow);
    this.root.destroy();
    for (const material of this.materials) {
      material.destroy();
    }
    this.materials.length = 0;
    this.texture.destroy();
    this.haloTexture.destroy();
  }

  private createSphere(
    name: string,
    material: pc.StandardMaterial,
    diameter: number,
  ): pc.Entity {
    this.materials.push(material);
    const entity = new pc.Entity(name);
    entity.addComponent('render', {
      type: 'sphere',
      material,
      castShadows: false,
      receiveShadows: false,
    });
    entity.setLocalScale(diameter, diameter, diameter);
    return entity;
  }

  private readonly follow = (): void => {
    this.root.setPosition(this.camera.getPosition());
  };
}
