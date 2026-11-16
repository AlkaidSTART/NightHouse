# SFX_FootstepWood_Set · 木地板脚步套装

> 资产类型：音效 ｜ 优先级：P0 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_FootstepWood_Set` |
| 使用位置 | 门厅 `villa_hall`、客厅 `villa_parlor`、餐厅 `villa_dining`、书房 `villa_study`、储物间 `villa_storage`、主楼梯（`stair_a`/`stair_b`）、二层回廊（`gallery`）与伊芙琳卧室木地板；同时用于 `echo_footsteps`（楼上远景脚步）与 `puzzle_safe` 三次失败后书房门外格雷医生的脚步声 |
| 依赖 / 复用 | `PlayerController` 行走/奔跑事件、`echo_footsteps`、`puzzle_safe` 失败事件 |
| 剧情用途 | 第一人称探索最核心的移动反馈，同时承载「静止 10 秒听见楼上有人走动（`echo_footsteps`）」与「保险箱三次失败后门外传来脚步声停在书房门口」的空间叙事 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Five distinct single footsteps of leather-soled 1890s dress shoes walking slowly on antique creaky mahogany floorboards, separated by 0.4-second silences: soft heel-to-toe contact, subtle old wood plank flex, dry close microphone recording, strictly isolated single steps, no hall reverb, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
fast running, tap dancing, high heels stiletto, sneakers squeak, gravel, water splash, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** leather shoe wooden floor single footsteps, antique floorboards walk, close mic dry, 5 variations

## 2. 用途

1. **玩家第一人称移动**：在木地板（`floor_house`、`floor_gallery_2f`、`floor_evelyn_2f`）和木楼梯（`stair_a`、`stair_b`）上随机轮播 5 个单步变体，避免机械重复。
2. **`echo_footsteps`（楼上回响脚步）**：玩家在门厅或走廊静止超过 10 秒时，在二楼位置（`y = 3.4`）以 600 Hz 低通滤波 + 轻微木梁吱呀声慢速连播 3 步。
3. **`puzzle_safe` 第三次失败演出**：在书房门外走廊（`[-8.5, 0, -1.1]`）连播 4 步由远及近并停在门前，随后触发格雷台词「有些东西，锁着是有原因的。」

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 单条 0.2–0.4 秒；4–6 个变体 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -6 dBFS；按脚步类型统一 |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_FootstepWood_Set.ogg |

## 4. 生成后检查

- [ ] 时长、源文件格式、运行格式和响度符合规格
- [ ] 无削波、爆音和明显底噪
- [ ] 循环接缝无缝（如要求）
- [ ] 没有意外的音乐、人声或可识别版权内容
- [ ] 在耳机和桌面音箱上分别试听
- [ ] 浏览器中通过 `AudioManager` 播放测试通过
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

至少提供 4 个变体避免机械重复；脚步不要带长混响，空间感交给场景音效。
