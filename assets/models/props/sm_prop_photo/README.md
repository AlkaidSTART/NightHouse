# SM_Prop_Photo_01 · 照片

> 资产类型：静态 3D 模型 ｜ 优先级：P0 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 客厅、卧室、书桌、相框 |
| 依赖 / 复用 | 无 |

## 快速使用

复制提示词 → 在生成工具中生成 → 按技术规格清理和缩放 → 在 Blender 中检查 → 导出 GLB → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
A small vintage photograph, 0.1 m by 0.15 m, slightly curled paper with a white border, image area left blank for a replaceable texture, no readable text, photorealistic, realistic old villa, muted desaturated palette, subtle age and wear, game-ready topology, clean UVs, physically based material, no baked lighting, isolated object, no scene, real-world scale.
```

**负向提示词（Negative prompt）**

```text
text, words, letters, handwriting, watermark, logo, signature, background scene, room, floor plane, multiple separate objects, people, hands, cartoon, stylized, anime, low detail, blurry, high-poly sculpt, dense triangulation, shiny plastic, pristine unused surfaces, bright saturated colors, baked shadows, baked lighting
```

## 2. 用途

提供人物关系或事件背景的视觉线索。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 尺寸 | 0.1 m × 0.15 m × 0.001 m |
| 单位 | 米；Y 轴向上；1 单位 = 1 m |
| 面数预算 | 4–60 tris |
| 材质槽 | 1 |
| 贴图 | 2K 照片贴图；内容由 `TEX_Document_*` 替换 |
| 碰撞体 | 不需要 |
| 原点 / 朝向 | 中心；正面朝 +Z |
| 导出格式 | GLB / glTF |
| 运行路径 | public/assets/models/props/SM_Prop_Photo_01.glb |

## 4. 生成后检查

- [ ] 尺寸与真实比例一致（1 单位 = 1 m）
- [ ] 原点、朝向和枢轴符合规格
- [ ] 法线方向正确，无明显穿插和重复面
- [ ] UV 已展开，贴图路径完整
- [ ] 材质槽数量符合预算
- [ ] 提供简化碰撞体或确认使用盒体代理
- [ ] 未在网格上烘焙剧情文字或不可替换内容
- [ ] 在 PlayCanvas 场景中按目标路径加载测试通过
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

- 本资产作为可替换照片载体，尺寸 0.1 m × 0.15 m，适合桌面、相框和抽屉。
- **被剪半张照片**（`clue_family_photo`）使用本模型的变体：伊芙琳单人像，右侧留出剪痕，衬硬纸板，藏在梳妆镜框背面；贴图使用 `TEX_Document_CutPhoto`。
- **全家福** 是大幅横框，使用独立资产 `SM_Prop_FamilyPortrait_01`，不要用本模型放大替代。
- 照片内容属于剧情信息，正文通过贴图或 UI 呈现，不烘焙进网格。
