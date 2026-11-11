# SM_Arch_WindowGlass_01 · 窗玻璃

> 资产类型：静态 3D 模型 ｜ 优先级：P1 ｜ 状态：✅ 已建模

| 项目 | 内容 |
|---|---|
| 使用位置 | 与窗框配套使用 |
| 依赖 / 复用 | 无 |

## 快速使用

复制提示词 → 在生成工具中生成 → 按技术规格清理和缩放 → 在 Blender 中检查 → 导出 GLB → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
A single pane of old dirty window glass, 1.16 m by 1.36 m and 6 mm thick, very subtle smudges, dust and faint streaks, slight green-grey tint, transparent surface, flat rectangular pane, photorealistic, realistic old villa construction, muted desaturated palette, subtle age and wear, game-ready topology, clean UVs, modular tileable edges, physically based material, no baked lighting, isolated object, real-world scale.
```

**负向提示词（Negative prompt）**

```text
text, words, letters, handwriting, watermark, logo, signature, background scene, room, floor plane, multiple separate objects, people, hands, cartoon, stylized, anime, low detail, blurry, high-poly sculpt, dense triangulation, shiny plastic, pristine unused surfaces, bright saturated colors, baked shadows, baked lighting
```

## 2. 用途

提供透明窗面，可叠加污渍和冷暖环境光。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 尺寸 | 1.16 m × 1.36 m × 0.006 m（宽 × 高 × 厚） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m |
| 面数预算 | 8–50 tris |
| 材质槽 | 1 |
| 贴图 | 透明材质；可叠加轻微污渍贴图 |
| 碰撞体 | 通常不需要碰撞 |
| 原点 / 朝向 | 中心；面朝 +Z |
| 导出格式 | GLB / glTF |
| 运行路径 | public/assets/models/architecture/SM_Arch_WindowGlass_01.glb |

## 4. 生成后检查

- [x] 尺寸与真实比例一致（1 单位 = 1 m）
- [x] 原点、朝向和枢轴符合规格
- [x] 法线方向正确，无明显穿插和重复面
- [x] UV 已展开，贴图路径完整
- [x] 材质槽数量符合预算
- [x] 提供简化碰撞体或确认使用盒体代理
- [x] 未在网格上烘焙剧情文字或不可替换内容
- [x] 在 PlayCanvas 场景中按目标路径加载测试通过
- [x] 来源与许可证已记录

## 5. 授权与来源记录

| 字段 | 内容 |
|---|---|
| 来源 / 工具 | Blender 5.2.3 LTS 自动化管线建模 |
| 作者 / 生成者 | 午夜别墅开发组 |
| 许可证 | 项目专有原创资产 (Midnight Villa) |
| 是否允许商用 | 是 |
| 署名要求 | 无 |
| 下载 / 生成日期 | 2026-11-11 |
| 修改说明 | 完成规范网格建模、UV展开、PBR材质绑定与正交三视图出图 |

## 6. 备注

AI 生成透明材质通常不可靠，建议在 Blender 中用一个平面加玻璃材质完成，不必使用生成模型。


## 3D 正交三视图与技术看板

![三视图](./SM_Arch_WindowGlass_01_three_views.png)

> 高清正交工程图见 [references/ref_arch_window_glass_three_views.png](../references/ref_arch_window_glass_three_views.png)。
