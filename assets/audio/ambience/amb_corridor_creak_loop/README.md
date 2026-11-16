# AMB_CorridorCreak_Loop · 走廊木头与远处房间

> 资产类型：环境音 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `AMB_CorridorCreak_Loop` |
| 使用位置 | `villa_corridor`（一层 7m 走廊 `z: -2..0` 与二层回廊及走廊 `y = 3.4`） |
| 依赖 / 复用 | 进入走廊区域淡入；作为 `echo_mirror_delay`、`echo_door_ajar` 与 `echo_footsteps` 的基础环境层 |
| 剧情用途 | 强化深色木护墙板与长走廊的幽闭延伸感，为走廊镜（`INT_prop_corridor_mirror`）和二楼家族照片（`INT_prop_family_photos`）营造被注视的寒意 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Seamless ambience of a long narrow 1897 Victorian wood-paneled corridor at night: old wainscoted timber creaking softly under temperature change, faint draft through closed door frames, subtle gas wall-lamp hiss, long narrow hallway acoustics, no footsteps, no clock ticking, no voices, no music.
```

**负向提示词（Negative prompt）**

```text
footsteps, clock ticking, door slam, music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** old house corridor night ambience, wood paneling creak, gas lamp hiss, narrow hallway tone, seamless loop

## 2. 用途

走廊与二楼走廊，制造被注视感，也是 `echo_mirror_delay` 与 `echo_footsteps` 的基础层。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 60–90 秒无缝循环 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 约 -21 LUFS，峰值低于 -3 dBFS |
| 循环 | 无缝循环 |
| 运行路径 | public/assets/audio/ambience/AMB_CorridorCreak_Loop.ogg |

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

- 触发：进入 `villa_corridor` 后淡入。
- 总线：Ambience。
- 空间化：2D 环境层，走廊长混响由场景混响统一处理。
- 木头响声要稀疏，约每 8–15 秒一次且不规律；不要做成节奏。
