# SFX_MusicBoxNote · 音乐盒单音

> 资产类型：音效 ｜ 优先级：P2 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_MusicBoxNote` |
| 使用位置 | 二楼伊芙琳卧室梳妆台木盒 `INT_prop_vanity_drawer`（或客厅 `echo_piano_note` 的备选音色） |
| 依赖 / 复用 | 客厅钢琴已确认采用 `SFX_PianoSingleNote`（中央 C）；本资产保留作为备选，或用于打开伊芙琳梳妆台抽屉木盒时偶发的单齿残响 |
| 剧情用途 | 表现旧物中残存的少女时代机械金属音齿单音，脆而微哑，不构成旋律 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
A single plucked steel comb tine note (pitch A4) inside an antique 1890s wooden music box: tiny brass cylinder pin plucking one slightly aged metal tooth, fragile metallic ring with a 2.5-second warm small wooden box decay, strictly one single note only, no melody, no song, no voices.
```

**负向提示词（Negative prompt）**

```text
lullaby melody, multiple notes, arpeggio, winding crank song, vocals, speech, sudden loud noises, clipping, distortion, heavy cathedral reverb, cartoon sound, low quality
```

**检索关键词：** single music box tine pluck A4, antique wooden box single note decay, no melody

## 2. 用途

如果最终场景选择音乐盒而不是钢琴，用这个替代 `SFX_PianoSingleNote`。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 1.5–3 秒 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 峰值低于 -10 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_MusicBoxNote.ogg |

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

- 触发：`echo_piano_note`（备选）。
- 总线：SFX。
- 空间化：3D 点声源。
- 与钢琴单音二选一，不要同时出现；音色更薄、更旧。
