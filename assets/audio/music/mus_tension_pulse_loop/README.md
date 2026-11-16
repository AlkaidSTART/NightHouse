# MUS_Tension_Pulse_Loop · 紧张慢脉冲层

> 资产类型：音乐 / 紧张层 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `MUS_Tension_Pulse_Loop` |
| 使用位置 | 全场景（`TensionDirector` 强度 ≥2 叠加在 `MUS_Tension_Base_Loop` 之上） |
| 依赖 / 复用 | `story.clock_repaired`（修好落地钟）、`story.heard_recording`（听完蜡筒录音）或 `story.knows_injury_at_home`（发现浴室血迹）后激活 |
| 剧情用途 | 以每 2 秒一次（60 BPM 二分音符，与落地钟秒针同速）的低沉闷音脉冲推进「午夜临近、证据闭环」的紧迫感 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Seamless slow tension pulse stem at 60 BPM in root key D: felt-muted low piano and damped double bass pizzicato hit on note D1 once every 2 seconds (30 hits in 60 seconds), soft warm sub-bass thump, strictly no melody, no drum kit, no cymbals, no vocals, restrained Victorian chamber Noir texture, exact 60 seconds seamless loop.
```

**负向提示词（Negative prompt）**

```text
melody, chord progression, drum kit, snare, hi-hat, cymbals, EDM kick, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, cartoon sound, low quality
```

**检索关键词：** slow tension pulse 60 bpm root D, felt muted low piano hit every two seconds, soft sub thump, seamless loop 60s

## 2. 用途

强度 ≥2 时叠加，用于玩家接近真相、对质前夕。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 60 秒无缝循环 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 约 -22 LUFS，峰值低于 -6 dBFS |
| 循环 | 无缝循环 |
| 运行路径 | public/assets/audio/music/MUS_Tension_Pulse_Loop.ogg |

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

- 触发：`TensionDirector` 强度 ≥2。
- 总线：Music。
- 空间化：2D 直通。
- 与 base 同长同循环点；脉冲不要盖过环境层和对话。
