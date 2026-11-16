# AMB_HouseNight_Loop · 别墅夜间环境底噪

> 资产类型：环境音 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `AMB_HouseNight_Loop` |
| 使用位置 | 全室内场景基础底噪；无窗储物间 `villa_storage` 与拉上厚窗帘的伊芙琳卧室 `villa_evelyn_room` 主环境层 |
| 依赖 / 复用 | 进门（B1 `story.arrived`）后常驻底层，与各区域环境音交叉淡化 |
| 剧情用途 | 提供持续、低干扰的石砌古宅夜间空间底噪，建立「房子很大、走廊很深」的静谧压迫感 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Seamless nighttime room tone inside an old 1897 stone and dark-wood Victorian manor: very low muffled wind outside thick stone walls, subtle timber settling, quiet antique room air pressure, strictly no clock ticking, no footsteps, no rain splashes, no music, no voices, no sudden sounds.
```

**负向提示词（Negative prompt）**

```text
clock ticking, clock chime, footsteps, heavy rain, thunder, music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** old house night room tone, muffled wind, quiet interior ambience, dark manor air tone, seamless loop, no clock

## 2. 用途

提供持续、低干扰的夜间空间底噪，建立别墅的压迫感。
- 在无窗的 `villa_storage`（一层储物间）中单独播放并施加 800 Hz 低通滤波，表现密闭樟脑与旧木箱空间。
- 在 `villa_evelyn_room`（二层唯一不亮灯、窗帘紧闭的卧室）中作为主底噪，使该房间听感比一楼更冷、更静。
- **严禁包含走钟滴答声**：门厅钟修复前全屋不应有落地钟走时声。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 60–90 秒无缝循环 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 约 -20 LUFS，峰值低于 -3 dBFS |
| 循环 | 无缝循环 |
| 运行路径 | public/assets/audio/ambience/AMB_HouseNight_Loop.ogg |

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

环境音不要抢戏；循环接缝必须在播放器里实测。
