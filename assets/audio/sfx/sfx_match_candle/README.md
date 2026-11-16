# SFX_MatchCandle · 火柴与烛火

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_MatchCandle` |
| 使用位置 | 开场闪回 `fb_letter`（烛光下写信/烧掉举报信初稿）、书房壁炉灰烬 `INT_prop_study_ashes`（翻找半张没烧完的账页 `clue_burned_pages`） |
| 依赖 / 复用 | `fb_letter`、`INT_prop_study_ashes` |
| 剧情用途 | 涵盖「划亮火柴引燃烛芯与纸角（`fb_letter`）」与「拨开书房壁炉冷灰烬、触碰一碰即碎的焦黑账页（`INT_prop_study_ashes`）」两个与火/灰烬直接相关的场景瞬间 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**合集主提示词（单文件 2 段式，间隔 0.5 秒静音）：**

```text
Two close-mic fire and ash foley sounds separated by a half-second silence: (1) wooden match strike, brief sulfur flare, candle wick catching and a corner of paper singeing softly; (2) brushing through cold dry fireplace wood ash and touching a brittle charred half-burned ledger page that crumbles slightly at the edges. Dry close recording, no music, no voices.
```

**分段独立生成提示词（Sub-prompts）：**

- **Sub-1 `match_candle_light`（划火柴点烛与烧信闪回 `fb_letter`，时长 1.6 秒）：**
  ```text
  Single wooden match strike against a rough box, brief sulfur flare, candle wick catching with a soft small flame flutter, close microphone, dry, no music, no voices.
  ```
- **Sub-2 `ash_charred_paper`（检视书房壁炉灰烬 `INT_prop_study_ashes`：「灰烬里埋着半张没烧完的账页……纸边一碰就碎」，时长 1.4 秒）：**
  ```text
  Fingers gently sifting through cold dry fireplace soot and charcoal ash, lifting a fragile charred paper fragment with delicate dry carbonized paper flaking, close mic, dry, no fire roar, no music.
  ```

**负向提示词（Negative prompt）**

```text
zippo lighter click, gas torch blow, roaring bonfire, explosion, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** wooden match strike candle catch, sifting cold fireplace ash, charred brittle paper crumble, close mic foley

## 2. 用途

点蜡烛、烧信闪回和书房烛光的操作反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 1–2 秒 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_MatchCandle.ogg |

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

- 触发：点烛、烧信闪回。
- 总线：SFX。
- 空间化：3D 点声源。
- 火柴头摩擦要短促；燃烧持续声另做低音量循环，不要塞进这一条。
