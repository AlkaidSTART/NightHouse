# SM_Arch_Skirting_01 · 踢脚线

> 资产类型：静态 3D 模型 ｜ 优先级：P2 ｜ 状态：✅ 已建模

| 项目 | 内容 |
|---|---|
| 使用位置 | 墙脚装饰，按 2 m 段拼接 |
| 依赖 / 复用 | 无 |

## 快速使用

复制提示词 → 在生成工具中生成 → 按技术规格清理和缩放 → 在 Blender 中检查 → 导出 GLB → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
A simple wooden skirting board segment, 2.0 m long, 0.1 m high and 0.02 m thick, aged off-white paint with chipped edges, subtle molded profile, tileable ends, photorealistic, realistic old villa construction, muted desaturated palette, subtle age and wear, game-ready topology, clean UVs, modular tileable edges, physically based material, no baked lighting, isolated object, real-world scale.
```

**负向提示词（Negative prompt）**

```text
text, words, letters, handwriting, watermark, logo, signature, background scene, room, floor plane, multiple separate objects, people, hands, cartoon, stylized, anime, low detail, blurry, high-poly sculpt, dense triangulation, shiny plastic, pristine unused surfaces, bright saturated colors, baked shadows, baked lighting
```

## 2. 用途

补足墙地交界细节，提升写实感和空间完成度。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 尺寸 | 2.0 m × 0.1 m × 0.02 m（长 × 高 × 厚） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m |
| 面数预算 | 40–200 tris |
| 材质槽 | 1 |
| 贴图 | 1K PBR |
| 碰撞体 | 不需要 |
| 原点 / 朝向 | 底面中心；沿 +X 延伸 |
| 导出格式 | GLB / glTF |
| 运行路径 | public/assets/models/architecture/SM_Arch_Skirting_01.glb |

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


## 3D 正交三视图与技术看板

![三视图](./SM_Arch_Skirting_01_three_views.png)

> 高清正交工程图见 [references/ref_arch_skirting_three_views.png](../references/ref_arch_skirting_three_views.png)。
