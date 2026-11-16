# SFX_Heartbeat_Loop · 紧张心跳

> 资产类型：音效 ｜ 优先级：P2 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_Heartbeat_Loop` |
| 使用位置 | 一层书房对质高潮（B9 `story.case_ready`）、一层门厅午夜签字/拒签抉择（B10 `story.midnight`） |
| 依赖 / 复用 | `TensionDirector` 强度 3 时以极低音量（峰值 -14 dBFS）叠加在 `MUS_Tension_*` 之下 |
| 剧情用途 | 在玩家面对遗嘱签字桌或当面拆穿亚瑟/格雷时，以克制的内耳低频搏动强化心理压迫感（本作无追逐战，绝不做急促战斗心跳） |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Seamless slow restrained human heartbeat loop at 55 BPM: deep muffled internal sub-bass lub-dub pulse (around 45-80 Hz), calm but tense, close internal perspective, strictly no heavy breathing, no panting, no hospital monitor beep, no music, no voices, 30 seconds seamless loop.
```

**负向提示词（Negative prompt）**

```text
fast running heartbeat, panting, gasping breath, EKG hospital beep, horror distortion, music, melody, vocals, speech, sudden loud noises, clipping, audible loop seam, cartoon sound, low quality
```

**检索关键词：** slow muffled heartbeat 55 bpm, internal sub bass pulse, restrained tension heartbeat loop, no breathing

## 2. 用途

强度 3 时极低音量叠加，强化玩家自身的生理反应。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 30–60 秒无缝循环 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -12 dBFS |
| 循环 | 无缝循环 |
| 运行路径 | public/assets/audio/sfx/SFX_Heartbeat_Loop.ogg |

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

- 触发：`story.midnight`、对质高潮。
- 总线：SFX。
- 空间化：2D。
- 只在强度 3 时使用；本作没有追逐战，不要做成持续战斗心跳。
