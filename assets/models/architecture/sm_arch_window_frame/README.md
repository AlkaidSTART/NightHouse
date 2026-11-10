# SM_Arch_WindowFrame_01 · 窗框

> 资产类型：静态 3D 模型 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 客厅、书房、卧室外墙 |
| 依赖 / 复用 | 无 |

## 快速使用

复制提示词 → 在生成工具中生成 → 按技术规格清理和缩放 → 在 Blender 中检查 → 导出 GLB → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
A weathered white wooden window frame for an old villa, 1.2 m wide, 1.4 m high and 0.15 m deep, six-pane sash layout, peeling paint, subtle dirt and darkened joints, photorealistic, realistic old villa construction, muted desaturated palette, subtle age and wear, game-ready topology, clean UVs, modular tileable edges, physically based material, no baked lighting, isolated object, real-world scale.
```

**负向提示词（Negative prompt）**

```text
text, words, letters, handwriting, watermark, logo, signature, background scene, room, floor plane, multiple separate objects, people, hands, cartoon, stylized, anime, low detail, blurry, high-poly sculpt, dense triangulation, shiny plastic, pristine unused surfaces, bright saturated colors, baked shadows, baked lighting
```

## 2. 用途

提供窗外光源和空间纵深，同时控制透明材质成本。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 尺寸 | 1.2 m × 1.4 m × 0.15 m（宽 × 高 × 深） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m |
| 面数预算 | 300–1200 tris |
| 材质槽 | 1–2 |
| 贴图 | 1K PBR |
| 碰撞体 | COL_Arch_WindowFrame_01，盒体碰撞 |
| 原点 / 朝向 | 底面中心；窗面朝 +Z |
| 导出格式 | GLB / glTF |
| 运行路径 | public/assets/models/architecture/SM_Arch_WindowFrame_01.glb |

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

窗框和玻璃分开制作，玻璃使用单独低面数面片，方便控制透明排序和性能。
