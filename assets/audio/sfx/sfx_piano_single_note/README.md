# SFX_PianoSingleNote · 钢琴单音

> 资产类型：音效 ｜ 优先级：P2 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_PianoSingleNote` |
| 使用位置 | 一层客厅东南角立式钢琴 `INT_prop_piano`（坐标 `[-6.4, 1, 6.2]`） |
| 依赖 / 复用 | `echo_piano_note`（首次接近钢琴时触发）及检视 `INT_prop_piano` |
| 剧情用途 | 严格对应 `inspectables.ts` 正文：「只有**中央 C** 的键面上有一个被擦掉的指印，像是有人按下去，又很快松了手。」表现陈旧立式钢琴中央 C（Middle C / C4，261.6 Hz）单音在客厅里的孤独回响 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
A single softly struck Middle C note (C4, 261.6 Hz) on an old slightly detuned 1890s Victorian upright piano: soft wooden key press, aged wool felt hammer contact, quick key release with damper felt drop, followed by a natural 3.5-second sympathetic string resonance decay in a quiet parlor, strictly one single note only, no chord, no melody, no voices.
```

**负向提示词（Negative prompt）**

```text
melody, arpeggio, chord, multiple notes, concert grand piano, bright pop piano, vocals, speech, sudden loud slam, clipping, distortion, cartoon sound, low quality
```

**检索关键词：** single upright piano note Middle C C4, slightly detuned felt piano single key strike, sympathetic resonance decay

## 2. 用途

钢琴自行响一个音的回响，引导玩家注意客厅。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 2–5 秒 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 峰值低于 -10 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_PianoSingleNote.ogg |

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

- 触发：`echo_piano_note`（首次接近钢琴）。
- 总线：SFX。
- 空间化：3D 点声源。
- 只响一个音，尾音交给房间混响；不要做成旋律片段。
