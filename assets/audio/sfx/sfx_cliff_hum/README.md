# SFX_CliffHum · 崖边风声中的哼唱

> 资产类型：音效 ｜ 优先级：P2 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_CliffHum` |
| 使用位置 | 西侧露台栏杆 `INT_prop_terrace_railing` / 寡妇崖 `villa_cliff` |
| 依赖 / 复用 | `echo_cliff_song`（首次靠近露台栏杆时触发，与 `AMB_CliffWindSea_Loop` 叠加） |
| 剧情用途 | 强化伊芙琳在寡妇崖边的残留存在感，同时符合世界观「回响必须可被解释为风穿过礁石缝隙」的写实悬疑规则 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Eerie coastal wind whistling through hollow sea-cliff rock crevices that subtly resembles a faint, distant, wordless female breathy hum on a single mournful pitch (D4 to A3), ambiguous between natural wind resonance and a human sigh, 4.5 seconds, fading into sea air, no lyrics, no words, no musical accompaniment, no sudden sounds.
```

**负向提示词（Negative prompt）**
> 注意：本条不要在负向提示词中写泛化的 `vocals`，否则 AI 模型会完全过滤掉似人声的哼鸣质感；只排除歌词、说话与合唱。

```text
lyrics, intelligible speech, talking, choir, operatic singing, musical instruments, piano, strings, horror scream, ghost wail, sudden loud noises, clipping, distortion, cartoon sound, low quality
```

**检索关键词：** distant female hum in wind, resonant sea cave wind tone, ambiguous wordless breathy hum, subtle eerie wind

## 2. 用途

崖边回响：风声里像有女人在哼唱，强化伊芙琳的存在感。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 4–6 秒 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 峰值低于 -14 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_CliffHum.ogg |

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

- 触发：`echo_cliff_song`（首次到达崖边）。
- 总线：SFX。
- 空间化：2D 远景层，可随玩家朝向轻微移动。
- 必须能被解释为风穿过礁石，不能做成鬼声；播放前先有风声增强提示。
