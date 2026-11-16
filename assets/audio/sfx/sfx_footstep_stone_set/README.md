# SFX_FootstepStone_Set · 石阶与露台脚步

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_FootstepStone_Set` |
| 使用位置 | 室外抵达段车道与门廊台阶（`scene_gate`：`floor_driveway`、`porch_steps`）、西侧露台与寡妇崖石阶（`villa_cliff`：`floor_terrace`、`cliff_steps`、`cliff_platform`）、二楼浴室瓷砖地面（`villa_bathroom`：`floor_bathroom_2f`）；同时用于检视石楣刻字 `INT_prop_motto`、壁炉石沿 `INT_prop_study_hearth`、浴室地砖缝 `INT_prop_tile_stain` 时的轻触声 |
| 依赖 / 复用 | `PlayerController` 脚步事件（`stone` / `tile` / `yard` 表面） |
| 剧情用途 | 为开场雨夜走过湿石车道与门廊台阶（B0）、终局前踏上西侧断崖湿石阶，以及二楼冰冷瓷砖浴室提供硬质潮湿地面反馈 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Five distinct single footsteps of leather-soled boots walking carefully on damp flagstone steps and wet stone paving, separated by 0.4-second silences: firm stone contact, subtle grit and thin rainwater film friction (not deep puddle splashing), dry close microphone, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
deep puddle splash, wading in water, loose beach pebbles, wood creak, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** damp flagstone single footsteps, wet stone steps walk, leather boot on stone, 5 variations, close mic

## 2. 用途

石阶与露台的移动反馈，强调室外和湿滑感。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 单条 0.2–0.4 秒；5 个变体 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -6 dBFS；与木地板脚步统一响度 |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_FootstepStone_Set.ogg |

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

- 触发：玩家在石质材质上行走。
- 总线：SFX。
- 空间化：2D 近距离播放。
- 带轻微水声，但不要做成踩水；室外脚步可稍干，混响交给露台环境。
