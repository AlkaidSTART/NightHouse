# SM_Furniture_Wardrobe_01 · 衣柜

> 资产类型：静态 3D 模型 ｜ 优先级：P0 ｜ 状态：已建模 (Blender PBR)

| 项目 | 内容 |
|---|---|
| 使用位置 | 卧室 |
| 依赖 / 复用 | 无 |

## 快速使用

复制提示词 → 在生成工具中生成 → 按技术规格清理和缩放 → 在 Blender 中检查 → 导出 GLB → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
A tall antique wardrobe, 2.0 m high, 1.2 m wide and 0.6 m deep, two paneled doors, dark wood, worn varnish, simple brass handles and subtle scratches, photorealistic, realistic old villa, muted desaturated palette, subtle age and wear, game-ready topology, clean UVs, physically based material, no baked lighting, isolated object, no scene, real-world scale.
```

**负向提示词（Negative prompt）**

```text
text, words, letters, handwriting, watermark, logo, signature, background scene, room, floor plane, multiple separate objects, people, hands, cartoon, stylized, anime, low detail, blurry, high-poly sculpt, dense triangulation, shiny plastic, pristine unused surfaces, bright saturated colors, baked shadows, baked lighting
```

## 2. 用途

卧室体量家具，可承载衣物、隐藏物品或可调查柜门。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 尺寸 | 2.0 m × 1.2 m × 0.6 m（高 × 宽 × 深） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m |
| 面数预算 | 1800–6000 tris |
| 材质槽 | 2–3 |
| 贴图 | 2K PBR |
| 碰撞体 | COL_Furniture_Wardrobe_01，盒体碰撞 |
| 原点 / 朝向 | 底面中心；正面朝 +Z |
| 导出格式 | GLB / glTF |
| 运行路径 | public/assets/models/furniture/SM_Furniture_Wardrobe_01.glb |

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


## 5. 三视图工程图纸与模型交付

![SM_Furniture_Wardrobe_01 三视图工程图](./SM_Furniture_Wardrobe_01_three_views.png)

- **Blender 生产源文件**：`assets/models/furniture/sm_furniture_wardrobe/SM_Furniture_Wardrobe_01.blend`
- **运行导出路径**：`public/assets/models/furniture/SM_Furniture_Wardrobe_01.glb`
- **交付实测规格**：尺寸 `1.20 m × 0.60 m × 2.00 m`，三角面预算 `3,820`，材质槽 `2 (深色胡桃木双框门 / 纯铜长门闩插销与下抽屉拉手)`
- **原点规范**：底面几何中心 `(0, 0, 0)`，正面朝向 `+Z` (PlayCanvas)
