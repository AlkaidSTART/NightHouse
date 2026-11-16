# SFX_GlassTap · 玻璃与镜面轻响

> 资产类型：音效 ｜ 优先级：P2 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_GlassTap` |
| 使用位置 | 客厅全家福 `INT_prop_family_portrait`（`echo_photo_glare`）、客厅小座钟玻璃罩 `INT_prop_mantel_clock`、一层走廊镜 `INT_prop_corridor_mirror`（`echo_mirror_delay`）、二楼走廊裂纹家族照片 `INT_prop_family_photos`、卧室床头柜镇静药瓶与干水杯 `INT_prop_nightstand`、卧室梳妆镜 `INT_prop_vanity_mirror_back`、浴室药柜棕色药瓶 `INT_prop_medicine_cabinet`、储物间玻璃罩船模 `INT_prop_ship_model` |
| 依赖 / 复用 | `echo_photo_glare`、`echo_mirror_delay`、`echo_cold_spot` 及玻璃/镜框/药瓶类检视交互 |
| 剧情用途 | 提供旧相框玻璃、走廊古董镜面微振，以及卧室/浴室镇静剂药瓶与干水杯（双读线索「她当晚滴药未沾」）的玻璃质感反馈 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Three subtle close-mic antique glass foley variations separated by half-second silences: (1) a fingernail softly tapping an old framed portrait glass pane with slight wooden frame resonance; (2) a faint eerie thermal stress tick on a large antique silvered wall mirror; (3) a small brown apothecary glass medicine bottle lightly touching a dry empty drinking glass on a wooden nightstand. Dry close recording, no shatter, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
glass shattering, window breaking, champagne toast ring, bright UI ding, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** picture frame glass tap, antique mirror stress tick, apothecary glass bottle clink dry cup, subtle close mic

## 2. 用途

全家福反光、镜面不安感的极轻提示音。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.2–0.5 秒（3 个变体） |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -10 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_GlassTap.ogg |

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

- 触发：`echo_photo_glare`、镜子经过。
- 总线：SFX。
- 空间化：3D 点声源。
- 不要做成 UI 叮声；应当像指甲轻碰旧玻璃。
