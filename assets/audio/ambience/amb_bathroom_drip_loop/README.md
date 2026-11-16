# AMB_BathroomDrip_Loop · 浴室滴水与瓷砖混响

> 资产类型：环境音 ｜ 优先级：P2 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `AMB_BathroomDrip_Loop` |
| 使用位置 | 二楼浴室 `villa_bathroom`（铸铁浴缸 `bathroom_tub`、洗手盆 `bathroom_basin`、药柜 `INT_prop_medicine_cabinet`、毛巾架 `INT_prop_towel_rack`、地砖缝 `INT_prop_tile_stain`） |
| 依赖 / 复用 | B4 格雷医生到访（`story.met_doctor`）解锁 `DOOR_bathroom` 后接入 |
| 剧情用途 | 通过冰冷瓷砖反射与缓慢水滴，烘托伊芙琳受伤后曾在此被擦洗处理的压抑现场（`clue_bathroom_trace`），并作为 `echo_cold_spot` 的声音基底 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Seamless ambience of a small cold 1897 Victorian tiled bathroom at night: irregular slow water drops dripping from a brass faucet into a cast-iron bathtub, cold ceramic tile room resonance, faint old copper pipe hum, no running shower, no flushing, no music, no voices, no sudden loud sounds.
```

**负向提示词（Negative prompt）**

```text
running water stream, shower, toilet flush, footsteps, music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, cathedral reverb, cartoon sound, low quality
```

**检索关键词：** old bathroom night ambience, irregular water drip, cast iron tub, tile reverb, pipe hum, seamless loop

## 2. 用途

浴室区域环境层，也是 `echo_cold_spot` 的底层。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 45–60 秒无缝循环 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 约 -22 LUFS，峰值低于 -3 dBFS |
| 循环 | 无缝循环 |
| 运行路径 | public/assets/audio/ambience/AMB_BathroomDrip_Loop.ogg |

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

- 触发：进入 `villa_bathroom` 后淡入。
- 总线：Ambience。
- 空间化：2D 环境层，瓷砖混响可用场景混响或预渲染尾音。
- 滴水间隔 3–6 秒且不规律；打开药柜时可瞬间抽掉中频制造“变冷”。
