# SFX_Clock_Tick_Loop · 落地钟滴答循环

> 资产类型：音效 ｜ 优先级：P0 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_Clock_Tick_Loop` |
| 使用位置 | 一层门厅落地钟 `INT_prop_longcase_clock`（主声源）；一层客厅壁炉小座钟 `INT_prop_mantel_clock`（调高 +3 半音、降音量复用） |
| 依赖 / 复用 | `story.clock_repaired`（修好落地钟后常驻启动）；修钟前检视 `INT_prop_longcase_clock` 时仅截取前 1 秒播放「一声很轻的滴答，然后归于寂静」 |
| 剧情用途 | 门厅的叙事节拍器，提醒玩家午夜临近；修钟前后的「死寂 → 走动」反差是全宅空间状态被唤醒的标志 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Seamless mechanical antique Victorian longcase grandfather clock ticking at exactly 60 BPM (one heavy brass escapement tick-tock cycle every two seconds, one beat per second), dry close microphone recording, warm hollow mahogany clock case resonance, strictly no chimes, no music, no voices, no background rain.
```

**负向提示词（Negative prompt）**

```text
clock chime, bell strike, alarm ring, fast wristwatch ticking, music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** longcase clock tick 60 bpm, mechanical grandfather clock loop, dry escapement tick tock, seamless loop

## 2. 用途

1. **门厅落地钟修好后（`story.clock_repaired = true`）**：作为 3D 点声源挂在 `hall_longcase_clock`（`[-2.5, 1.4, -1.38]`）上无缝循环，且与 `MUS_Tension_Pulse_Loop`（60 BPM）同速。
2. **门厅落地钟修好前检视（`INT_prop_longcase_clock` 未修状态）**：文本写明「凑近时，能听见一声很轻的滴答，然后归于寂静」——触发时仅以 -6 dB 播放本音频的第一个单拍（0.0–0.8 秒）随即停止，不循环。
3. **客厅壁炉小座钟（`INT_prop_mantel_clock`，显示 23:47）**：在 `parlor_mantel_clock`（`[-10.49, 1.38, 3.5]`）上以 `playbackRate = 1.2`（或 +3 半音）、峰值 `-20 dBFS` 极小衰减半径（2.0 m）复用，表现玻璃罩内走得很稳的小座钟。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 30–60 秒无缝循环 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -12 dBFS |
| 循环 | 无缝循环 |
| 运行路径 | public/assets/audio/sfx/SFX_Clock_Tick_Loop.ogg |

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

- 触发：`story.clock_repaired` 后启动；午夜前 10 分钟可提升 1–2 dB。
- 总线：SFX（或独立 Clock 总线）。
- 空间化：3D 点声源，挂在落地钟实体上。
- 滴答是全场节拍器，但不要做成真实倒计时压迫玩家。
