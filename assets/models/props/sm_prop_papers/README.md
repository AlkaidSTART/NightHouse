# SM_Prop_Papers_01 · 散落纸张

> 资产类型：静态 3D 模型 ｜ 优先级：P0 ｜ 状态：✅ 已建模

| 项目 | 内容 |
|---|---|
| 使用位置 | 书桌、地面、书架 |
| 依赖 / 复用 | 无 |

## 快速使用

复制提示词 → 在生成工具中生成 → 按技术规格清理和缩放 → 在 Blender 中检查 → 导出 GLB → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
A small stack of loose aged paper sheets, each about 0.21 m by 0.297 m, off-white and slightly yellowed, subtle creases and uneven edges, no readable text, photorealistic, realistic old villa, muted desaturated palette, subtle age and wear, game-ready topology, clean UVs, physically based material, no baked lighting, isolated object, no scene, real-world scale.
```

**负向提示词（Negative prompt）**

```text
text, words, letters, handwriting, watermark, logo, signature, background scene, room, floor plane, multiple separate objects, people, hands, cartoon, stylized, anime, low detail, blurry, high-poly sculpt, dense triangulation, shiny plastic, pristine unused surfaces, bright saturated colors, baked shadows, baked lighting
```

## 2. 用途

提供信息型线索的视觉载体，正文可通过 UI 或贴图展示。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 尺寸 | 单张 0.21 m × 0.297 m；纸堆高 0.01–0.03 m |
| 单位 | 米；Y 轴向上；1 单位 = 1 m |
| 面数预算 | 100–500 tris |
| 材质槽 | 1 |
| 贴图 | 1K PBR；可替换正文贴图 |
| 碰撞体 | 不需要 |
| 原点 / 朝向 | 纸堆底面中心 |
| 导出格式 | GLB / glTF |
| 运行路径 | public/assets/models/props/SM_Prop_Papers_01.glb |

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

- 本资产是通用纸张堆，用于 **诊疗记录**（`clue_medical_record`）、**保险单**（`clue_insurance_policy`）、**遗嘱**（`clue_will_clause`）和 **船员名单**（`clue_crew_names`）等书证载体；正文使用对应的 `TEX_Document_*` 贴图或 UI。
- 遗嘱不需要单独建独特模型，用本资产 + 2D 文本即可；签字动作由交互系统处理。
- 不要把所有纸张做成一个高面数网格；建议 3–5 张独立面片叠放，便于替换内容和拾取。


## 3D 正交三视图与技术看板

![三视图](./SM_Prop_Papers_01_three_views.png)

> 高清工程图纸见 [references/ref_prop_papers_three_views.png](../references/ref_prop_papers_three_views.png)。
