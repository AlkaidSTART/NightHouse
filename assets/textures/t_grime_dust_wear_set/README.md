# T_Grime_DustWear_Set_01 · 灰尘 / 污渍 / 磨损叠加贴图

> 资产类型：PBR 贴图 / 2D 图像 ｜ 优先级：P2 ｜ 状态：暂缓

| 项目 | 内容 |
|---|---|
| 使用位置 | 墙面、地板、家具边缘的叠加细节 |
| 依赖 / 复用 | 无 |

## 快速使用

复制提示词 → 生成无缝 PBR 贴图 → 检查接缝和通道 → 导出 PNG / WebP → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
A set of seamless tileable grime and dust overlay textures, including soft dust film, wall stains, floor scuffs and edge wear, alpha masks, neutral grey and brown tones, seamless tileable PBR texture, top-down orthographic view, even diffuse lighting, no shadow, no perspective, no object, realistic old villa surface, subtle age and wear, muted desaturated palette, high detail.
```

**负向提示词（Negative prompt）**

```text
shadows, lighting, perspective, horizon, object, furniture, text, words, watermark, logo, seams, visible tiling repetition, blurry, low detail, cartoon, stylized
```

## 2. 用途

用少量叠加层提升写实感，避免为每个物体单独制作污渍。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 分辨率 | 1K（关键近景 2K） |
| 贴图通道 | BaseColor / Alpha（可选 Normal） |
| 平铺 | 可平铺 + 若干非平铺贴花 |
| 色彩空间 | BaseColor 使用 sRGB；Normal / Roughness / AO 使用线性 |
| 导出格式 | PNG / WebP（按通道） |
| 运行路径 | public/assets/textures/T_Grime_DustWear_Set_01_*.png |

## 4. 生成后检查

- [ ] 分辨率、比例和色彩空间符合规格
- [ ] 可无缝平铺（如要求），四边接缝无明显重复
- [ ] 未烘焙光照、阴影或环境光遮蔽
- [ ] Normal / Roughness / AO 使用线性空间
- [ ] 在 PlayCanvas 中按实际尺寸平铺测试
- [ ] 文件已压缩，体积符合预算
- [ ] 来源与许可证已记录

## 5. 授权与来源记录

| 字段 | 内容 |
|---|---|
| 来源 / 工具 | 待填写 |
| 作者 / 生成者 | 待填写 |
| 许可证 | 待填写 |
| 是否允许商用 | 待确认 |
| 署名要求 | 待确认 |
| 下载 / 生成日期 | 待填写 |
| 修改说明 | 待填写 |

## 6. 备注

先用材质参数和少量叠加层验证效果，不要一开始就堆叠大量污渍贴图。
