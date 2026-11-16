# AMB_StudyFireRain_Loop · 书房雨声与壁炉余烬

> 资产类型：环境音 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `AMB_StudyFireRain_Loop` |
| 使用位置 | 一层书房 `villa_study`（主环境层）；一层客厅 `villa_parlor` 壁炉旁（`LIGHT_parlor_fire` 低音量局部叠加） |
| 依赖 / 复用 | B2 初见亚瑟（`story.met_arthur`）解锁书房后接入；客厅开场即可以 -4 dB 叠加壁炉温暖余烬感 |
| 剧情用途 | 营造伊芙琳死亡现场（书房壁炉石沿 `INT_prop_study_hearth`、灰烬 `INT_prop_study_ashes`、炉前新地毯 `INT_prop_study_rug`）的余烬与冷雨反差，烘托保险箱解谜、留声机播放（B8）与亚瑟对质（B9） |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Seamless interior ambience of a wood-lined 1897 Victorian study at night: rain tapping against window glass, dying fireplace embers softly crackling and shifting in a stone hearth, quiet book-lined room tone, no roaring flames, no clock ticking, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
roaring bonfire, loud fire pops, clock ticking, music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** Victorian study night ambience, rain window, dying fireplace embers, quiet library room tone, seamless loop

## 2. 用途

书房调查段的基础环境层，配合保险箱、账本与留声机。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 60–90 秒无缝循环 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 约 -20 LUFS，峰值低于 -3 dBFS |
| 循环 | 无缝循环 |
| 运行路径 | public/assets/audio/ambience/AMB_StudyFireRain_Loop.ogg |

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

- 触发：进入 `villa_study` 后淡入。
- 总线：Ambience。
- 空间化：2D 环境层；壁炉可另做低音量 3D 点声源。
- 壁炉余烬要低，避免掩盖保险箱转盘、纸张和留声机底噪。
