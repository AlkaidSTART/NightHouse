# SFX_Gramophone_Play · 留声机启停机械声

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_Gramophone_Play` |
| 使用位置 | 一层书房留声机 `INT_prop_phonograph`（坐标 `[-6.4, 0.95, -3.14]`）、`fb_gramophone` 闪回 |
| 依赖 / 复用 | 持有 `item_cylinder` 后在书房操作留声机（`clue_gramophone_cylinder`、`story.heard_recording`） |
| 剧情用途 | 还原「你把蜡筒嵌进转轴，放下唱针」与「蜡筒转完最后一圈」的 1897 年机械操作仪式感 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**合集主提示词（单文件 2 段式：`start` 与 `stop`，间隔 0.5 秒静音）：**

```text
Two close-mic mechanical operations of an 1897 wax cylinder phonograph separated by a half-second silence: (1) sliding a hollow brown wax cylinder onto a tapered brass mandrel, releasing the spring governor lever, motor spinning up and lowering the stylus needle onto the wax groove; (2) stylus reaching the end of the cylinder with a metallic stop lever click and spring motor spinning down. Dry close recording, no music, no voices.
```

**分段独立生成提示词（Sub-prompts）：**

- **Sub-1 `cylinder_start`（嵌上蜡筒、拨开制动杆、放下唱针，时长 2.0 秒）：**
  ```text
  Sliding a hollow wax cylinder onto a brass phonograph mandrel, clicking the metal start lever, clockwork governor whirring up and needle stylus dropping softly onto wax, close mic, dry, no music, no voices.
  ```
- **Sub-2 `cylinder_stop`（唱针滑到末尾、抬针或机械停转，时长 1.2 秒）：**
  ```text
  Antique wax cylinder phonograph needle lifting off the groove with a small brass lever click and clockwork motor gently winding down to a stop, close mic, dry, no music, no voices.
  ```

**负向提示词（Negative prompt）**

```text
modern DJ vinyl scratch, cassette tape button, electronic beep, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** wax cylinder phonograph start stop, needle drop on wax, clockwork governor engage, antique gramophone lever

## 2. 用途

蜡筒播放的开始与结束机械反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 1–2.5 秒（start / stop 分开） |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_Gramophone_Play.ogg |

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

- 触发：播放 / 停止蜡筒。
- 总线：SFX。
- 空间化：3D 点声源。
- start 与 stop 分开导出；stop 后接 0.3 秒底噪再淡出。
