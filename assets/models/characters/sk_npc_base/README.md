# SK_NPC_Base_01 · NPC 绑定与比例母版

> 资产类型：骨骼角色模型 ｜ 优先级：P0 ｜ 状态：可先生成基础体

| 项目 | 内容 |
|---|---|
| 使用位置 | 三名已确认 NPC 的统一绑定与比例母版 |
| 依赖 / 复用 | `SK_NPC_Arthur_01`、`SK_NPC_Housekeeper_01`、`SK_NPC_Grey_01` 共用本骨架 |

## 快速使用

复制提示词 → 生成基础体 → 清理拓扑和 UV → 在 Blender 中绑定骨骼 → 导出 GLB → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
A realistic adult human character for an old villa mystery game, full body, neutral A-pose, about 1.72 m tall, average build, short dark hair, plain neutral clothing, blank expression, clean symmetrical anatomy, separate head and hands, photorealistic realistic adult human, full body, neutral A-pose, blank expression, game-ready topology, clean UVs, PBR skin and fabric, no baked lighting, isolated on neutral background, real-world scale, about 1.72 meters tall.
```

**负向提示词（Negative prompt）**

```text
extra limbs, extra fingers, deformed hands, distorted face, text, logo, watermark, clothing text, background scene, props, cartoon, stylized, anime, low detail, blurry, high-poly sculpt, baked shadows
```

## 2. 用途

提供统一比例、骨骼和材质的人形基础，避免每名 NPC 从零制作。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 身高 | 约 1.72 m 基准；亚瑟 1.80 m、霍尔太太 1.58 m、格雷医生 1.72 m |
| 面数预算 | 15k–30k tris |
| 骨骼 | 标准人形骨架；命名与 Mixamo/Blender 兼容 |
| 姿态 | A-pose 或 T-pose（导出前确认重定向方案） |
| 材质槽 | 2–4（皮肤 / 头发 / 服装 / 眼睛） |
| 贴图 | 2K PBR；皮肤和服装分开 |
| 碰撞体 | 胶囊体代理，不直接用高模 |
| 原点 / 朝向 | 双脚中心；正面朝 +Z |
| 导出格式 | GLB / glTF（含骨架和 UV） |
| 运行路径 | public/assets/models/characters/SK_NPC_Base_01.glb |

## 4. 生成后检查

- [ ] 身高和比例符合规格（1 单位 = 1 m）
- [ ] 标准人形骨架，骨骼命名可重定向
- [ ] A-pose / T-pose 与绑定流程一致
- [ ] 法线方向正确，无穿插和重复面
- [ ] UV 已展开，皮肤和服装贴图路径完整
- [ ] 提供胶囊体代理碰撞，不直接用高模
- [ ] 未绑定具体剧情身份或不可替换服装（身份和服装在各自角色资产中制作）
- [ ] 在 PlayCanvas 中加载并播放 Idle 测试通过
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

- 三名 NPC 已由世界观 V0.7 §4.1 与故事线 V0.7 §5 确认：亚瑟·阿什克罗夫特（32 岁，1.80 m）、霍尔太太（58 岁，1.58 m）、埃利亚斯·格雷医生（61 岁，1.72 m）。
- 本资产只做统一骨架和比例母版，不承载角色身份。头部、发型、服装和配饰分别在 `SK_NPC_Arthur_01`、`SK_NPC_Housekeeper_01`、`SK_NPC_Grey_01` 中制作。
- AI 生成通常只给静态网格。骨骼绑定、权重和动画建议在 Blender / Mixamo 中完成；不要过早制作多套服装。
