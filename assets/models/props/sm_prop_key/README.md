# SM_Prop_Key_01 · 钥匙

> 资产类型：静态 3D 模型 ｜ 优先级：P0 ｜ 状态：待生成

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

钥匙体积小但辨识度要求高，优先保证轮廓和金属质感，避免过度细节。
