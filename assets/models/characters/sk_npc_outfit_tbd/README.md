# SK_NPC_Outfit_TBD · 三名 NPC 服装与配饰

> 资产类型：骨骼角色服装 / 配饰 ｜ 优先级：P0 ｜ 状态：待生成
>
> **目录名说明：** 本目录沿用旧的 `sk_npc_outfit_tbd`。角色已由世界观 V0.7 与故事线 V0.7 确认，本目录现在覆盖三名 NPC 的服装与配饰；正式资产 ID 为 `SK_NPC_Arthur_01`、`SK_NPC_Housekeeper_01`、`SK_NPC_Grey_01`。

| 项目 | 内容 |
|---|---|
| 使用位置 | 门厅、客厅、餐厅、书房（按剧情出现） |
| 依赖 / 复用 | `SK_NPC_Base_01` 骨架与比例；稳定 NPC ID `npc_arthur`、`npc_housekeeper`、`npc_doctor` |

## 快速使用

先完成 `SK_NPC_Base_01` 的骨架与比例 → 分别为三名角色制作头部、发型、服装和配饰 → 在 Blender 中检查穿插和权重 → 导出 GLB → 放到各自运行路径。

## 1. 角色与外观规格

| 资产 ID | 角色 | 年龄 | 身高 | 外观要点 |
|---|---|---|---|---|
| `SK_NPC_Arthur_01` | 亚瑟·阿什克罗夫特 | 32 | 1.80 m | 整洁深色西装、怀表、左腕浅白抓痕、长期失眠的眼圈 |
| `SK_NPC_Housekeeper_01` | 霍尔太太 | 58 | 1.58 m | 深色长裙与围裙、发髻、手背旧烫伤、钥匙串 |
| `SK_NPC_Grey_01` | 埃利亚斯·格雷 | 61 | 1.72 m | 深色西装或医生外套、圆框眼镜、医疗包、疲惫姿态 |

**通用提示词骨架：**

```text
A realistic late 19th century {role}, full body, neutral A-pose, {height} tall, {outfit description}, {distinctive detail}, aged fabric with subtle wear, no readable text, photorealistic, realistic old villa, muted desaturated palette, game-ready topology, clean UVs, physically based material, no baked lighting, isolated object, neutral background, real-world scale.
```

生成时把 `{role}`、`{height}`、`{outfit description}` 和 `{distinctive detail}` 替换为表中的角色信息；不要生成现代西装剪裁、塑料质感或印刷图案。

## 2. 用途

通过服装和配饰体现 1897 年的年代感、人物身份和性格差异，并支撑对话时的角色辨识。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 尺寸 | 按 `SK_NPC_Base_01` 适配；身高按角色表 |
| 面数预算 | 2000–8000 tris / 套 |
| 骨骼 | 复用 `SK_NPC_Base_01` 骨架，权重随服装调整 |
| 材质槽 | 2–4 |
| 贴图 | 1K–2K PBR |
| 碰撞体 | 不需要独立碰撞；角色使用胶囊体代理 |
| 原点 / 朝向 | 与基础体一致；双脚中心，正面朝 +Z |
| 导出格式 | GLB / glTF |
| 运行路径 | `public/assets/models/characters/SK_NPC_Arthur_01.glb`<br>`public/assets/models/characters/SK_NPC_Housekeeper_01.glb`<br>`public/assets/models/characters/SK_NPC_Grey_01.glb` |

**交互节点：** 霍尔太太的钥匙串可挂 `keyring_attach` 节点，供「收外套 / 给钥匙」动画使用；格雷医生的医疗包可挂 `bag_attach` 节点。不要把手持物直接焊死在手部网格上。

## 4. 生成后检查

- [ ] 身高和比例符合角色表（1 单位 = 1 m）
- [ ] 复用统一人形骨架，骨骼命名可重定向
- [ ] A-pose / T-pose 与绑定流程一致
- [ ] 法线方向正确，无穿插和重复面
- [ ] UV 已展开，皮肤和服装贴图路径完整
- [ ] 提供胶囊体代理碰撞，不直接用高模
- [ ] 服装、发型和配饰与角色身份一致，未混用
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

- 每名 NPC 的服装、发型和配饰应记录在对应角色卡中，并关联稳定 NPC ID。
- 不要把三套服装合并成一个不可替换网格；三人共用骨架，但网格和材质分开。
- 角色身份、关系和已知信息以故事线 V0.7 §5 为准，不要自行添加未确认的服装或配饰设定。
