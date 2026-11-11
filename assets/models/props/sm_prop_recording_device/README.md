# SM_Prop_Phonograph_01 · 蜡筒留声机

> 资产类型：静态 3D 模型 ｜ 优先级：P0 ｜ 状态：✅ 已建模
>
> **目录名说明：** 本目录沿用旧的 `sm_prop_recording_device`。资产已由「现代卡带录音机」修正为 1897 年蜡筒留声机，资产 ID 与运行路径以本文档为准；后续迁移目录时同步更新 `assets/README.md` 与 `assets/models/props/README.md` 的链接。

| 项目 | 内容 |
|---|---|
| 使用位置 | 书房（播放伊芙琳留言） |
| 依赖 / 复用 | 与 `SM_Prop_WaxCylinder_01` 配套；线索 `clue_gramophone_cylinder` |

## 快速使用

复制提示词 → 在生成工具中生成 → 按技术规格清理和缩放 → 在 Blender 中检查 → 导出 GLB → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
A late 19th century wax cylinder phonograph on a wooden base, 0.35 m wide, 0.3 m deep and 0.45 m tall including the brass horn, dark walnut wood, tarnished brass horn and mechanism, black iron crank, a small wax cylinder mounted on the carriage, worn surfaces, no readable text, photorealistic, realistic old villa, muted desaturated palette, subtle age and wear, game-ready topology, clean UVs, physically based material, no baked lighting, isolated object, no scene, real-world scale.
```

**负向提示词（Negative prompt）**

```text
text, words, letters, handwriting, watermark, logo, signature, background scene, room, floor plane, multiple separate objects, people, hands, cartoon, stylized, anime, low detail, blurry, high-poly sculpt, dense triangulation, shiny plastic, pristine unused surfaces, bright saturated colors, baked shadows, baked lighting, cassette, tape deck, modern electronics, radio, loudspeaker
```

## 2. 用途

书房音频线索的核心载体：玩家从卧室取得蜡筒后回到书房播放，获得 `clue_gramophone_cylinder`。模型必须让玩家一眼看出「放蜡筒 → 摇柄 → 听声音」的操作关系。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 尺寸 | 约 0.35 m × 0.30 m × 0.45 m（宽 × 深 × 高，含喇叭） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m |
| 面数预算 | 2000–6000 tris |
| 材质槽 | 3–4（深色木 / 做旧黄铜 / 黑色铸铁 / 蜡筒） |
| 贴图 | 1K–2K PBR |
| 碰撞体 | 盒体代理碰撞 |
| 原点 / 朝向 | 底面中心；喇叭朝向书房动线，正面朝 +Z |
| 导出格式 | GLB / glTF |
| 运行路径 | public/assets/models/props/SM_Prop_Phonograph_01.glb |

**交互节点：** `phonograph_crank`（摇柄，可旋转）、`cylinder_carriage`（蜡筒托架，可放置）、`horn_mouth`（音频定位点）、`base`（静态底座）。

**配套蜡筒 `SM_Prop_WaxCylinder_01`：** 圆柱蜡筒 + 木盒，盒盖写「E. — 别放」。尺寸约 0.06 m 直径 × 0.12 m 长；1000–2500 tris；可携带；运行路径 `public/assets/models/props/SM_Prop_WaxCylinder_01.glb`。盒盖文字用可替换贴图 `TEX_Document_WaxCylinderLabel`，不烘焙进网格。

## 4. 生成后检查

- [x] 尺寸与真实比例一致（1 单位 = 1 m）
- [x] 原点、朝向和枢轴符合规格
- [x] 摇柄、蜡筒托架、喇叭节点命名稳定
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

- 留声机播放的语音属于剧情内容，由 `AudioManager` 播放，不烘焙进模型。
- 喇叭内部不要做高模声学结构，保持外轮廓和开口可读即可。
- 不要生成现代唱盘、黑胶唱片或卡带结构。


## 3D 正交三视图与技术看板

![三视图](./SM_Prop_Phonograph_01_three_views.png)

> 高清工程图纸见 [references/ref_prop_recording_device_three_views.png](../references/ref_prop_recording_device_three_views.png)。
