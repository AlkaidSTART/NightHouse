# SFX_Clock_Tick_Loop · 落地钟滴答循环

> 资产类型：音效 ｜ 优先级：P0 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 门厅落地钟 |
| 依赖 / 复用 | 钟谜题与门厅场景接入 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Seamless mechanical longcase clock ticking, slow one tick per second, dry close recording, subtle wood case resonance, no chime, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** longcase clock tick, mechanical clock loop, dry tick, seamless loop

## 2. 用途

门厅的节拍器，提醒玩家午夜临近；修钟后从静默转为走动。

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
