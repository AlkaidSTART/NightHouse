# SFX_DoorCreak · 门缝缓开

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_DoorCreak` |
| 使用位置 | 二楼走廊尽头伊芙琳卧室门 `DOOR_evelyn_room`（坐标 `[-10, 3.4, 0]`） |
| 依赖 / 复用 | `echo_door_ajar`（玩家独自经过二楼走廊且霍尔太太不在附近时触发） |
| 剧情用途 | 表现二楼走廊穿堂风吹动伊芙琳卧室门自行缓开一条缝的「回响」，把玩家视线引向全宅唯一不亮灯的房间 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Three variations of a slow antique wooden bedroom door creaking ajar by a few inches on dry brass hinges, separated by half-second silences: delicate wood fiber groan and slow hinge friction, very quiet and eerie, strictly no handle turn, no latch click, no door slam, close microphone, dry, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
doorknob rattle, metal latch click, door slam, loud thud, monster growl, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** slow door creak ajar, subtle hinge friction, old wooden door groan, no latch, close mic

## 2. 用途

门自己开一条缝的回响，以及玩家缓慢推门时的细节。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 1.5–3 秒（3 个变体） |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_DoorCreak.ogg |

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

- 触发：`echo_door_ajar`、缓慢推门。
- 总线：SFX。
- 空间化：3D 点声源。
- 普通开关门仍用 `SFX_DoorOpenClose`；门缝声不要带锁舌。
