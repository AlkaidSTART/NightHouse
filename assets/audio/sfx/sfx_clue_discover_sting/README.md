# SFX_ClueDiscover_Sting · 发现线索提示音

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_ClueDiscover_Sting` |
| 使用位置 | 首次触发 `discover-clue`（全篇 21 条线索首次收入线索日志 `ClueJournal` 时） |
| 依赖 / 复用 | `ClueSystem` 首次发现线索事件（重复查看同一线索时不触发） |
| 剧情用途 | 为关键破案节点（如发现诊疗记录 23:40、全家福剪痕、船长日志、留声机蜡筒）提供短促、沉静、与背景紧张层（D 调）同调的悬疑确认感 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
A restrained 2.2-second Victorian mystery clue discovery sting in key of D minor: a single soft felt-muted low piano note (D3) layered with a quiet bowed cello harmonic swell (A3) that gently decays into room air, subtle psychological realization, strictly no melodic jingle, no percussion, no brass, no jump-scare stinger, no voices.
```

**负向提示词（Negative prompt）**

```text
upbeat achievement fanfare, arcade victory jingle, horror shriek stinger, drums, cymbals, brass, vocals, speech, sudden loud noises, clipping, distortion, cartoon sound, low quality
```

**检索关键词：** restrained mystery clue sting D minor, felt piano and low cello swell, subtle realization cue, no melody

## 2. 用途

为线索获得提供短促的情绪反馈，不打断探索节奏。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 1.5–3 秒 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_ClueDiscover_Sting.ogg |

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

只在首次发现关键线索时播放；普通调查物品使用更轻的纸张或 UI 音效。
