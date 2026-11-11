# SM_Prop_Key_01 · 钥匙

> 资产类型：静态 3D 模型 ｜ 优先级：P0 ｜ 状态：✅ 已建模

| 项目 | 内容 |
|---|---|
| 使用位置 | 玄关、抽屉、储物箱 |
| 依赖 / 复用 | 无 |

## 快速使用

复制提示词 → 在生成工具中生成 → 按技术规格清理和缩放 → 在 Blender 中检查 → 导出 GLB → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
An old brass door key, 0.07 m long, 0.025 m wide and 4 mm thick, simple bow and bit, tarnished patina, worn edges, photorealistic, realistic old villa, muted desaturated palette, subtle age and wear, game-ready topology, clean UVs, physically based material, no baked lighting, isolated object, no scene, real-world scale.
```

**负向提示词（Negative prompt）**

```text
text, words, letters, handwriting, watermark, logo, signature, background scene, room, floor plane, multiple separate objects, people, hands, cartoon, stylized, anime, low detail, blurry, high-poly sculpt, dense triangulation, shiny plastic, pristine unused surfaces, bright saturated colors, baked shadows, baked lighting
```

## 2. 用途

关键剧情道具，需要轮廓清晰、可快速识别。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 尺寸 | 0.07 m × 0.025 m × 0.004 m（长 × 宽 × 厚） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m |
| 面数预算 | 300–1500 tris |
| 材质槽 | 1 |
| 贴图 | 1K PBR |
| 碰撞体 | 盒体代理碰撞 |
| 原点 / 朝向 | 钥匙环中心；钥匙头朝 +X |
| 导出格式 | GLB / glTF |
| 运行路径 | public/assets/models/props/SM_Prop_Key_01.glb |

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

- 本资产是通用黄铜门钥匙，用于门锁、储物箱和抽屉。
- **钟钥匙**（`clue_clock_key`）使用独立资产 `SM_Prop_ClockKey_01`：更小的黄铜钥匙，柄上刻钟面图案，从书房书桌抽屉取得。
- **储物间钥匙串**（`SM_Prop_StorageKeyRing_01`）可用本模型加钥匙环和 2–3 把钥匙的组合变体，挂在门厅衣钩上。
- 钥匙体积小但辨识度要求高，优先保证轮廓和金属质感，避免过度细节。


## 3D 正交三视图与技术看板

![三视图](./SM_Prop_Key_01_three_views.png)

> 高清工程图纸见 [references/ref_prop_key_three_views.png](../references/ref_prop_key_three_views.png)。
