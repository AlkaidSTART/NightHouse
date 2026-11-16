# SFX_SafeDial · 保险箱转盘

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_SafeDial` |
| 使用位置 | 一层书房四位数字保险箱 `INT_prop_safe`（`puzzle_safe`，坐标 `[-7.95, 0.6, -7.34]`） |
| 依赖 / 复用 | `puzzle_safe` 密码输入交互与错误提交反馈 |
| 剧情用途 | 对应 `inspectables.ts` 与 `puzzles.ts`：「一只老式四位数字保险箱嵌在书架旁……转盘上第 3、4 位磨得最亮。你转了转，内部传来干涩的卡响，门纹丝不动。」涵盖拨动数字转盘刻度与密码错误时的干涩机械卡死声 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**合集主提示词（单文件 4 段式：3 个转盘拨动变体 + 1 个密码错误干涩卡响，间隔 0.4 秒静音）：**

```text
Four close-mic mechanical sounds of an antique 1897 cast-iron combination safe separated by 0.4-second silences: (1-3) three variations of heavy brass dial rotation with crisp internal tumbler wheel clicks; (4) a dry stubborn metallic handle jam clunk when testing a wrong combination code and the bolt refuses to retract. Dry close recording, no electronic beeps, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
electronic keypad beep, digital buzzer, alarm siren, safe door opening, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** antique safe dial clicks, mechanical combination tumbler, jammed safe handle clunk, dry metal detents, close mic

## 2. 用途

保险箱密码输入的每一步反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 单次 0.3–0.6 秒（4 个变体） |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_SafeDial.ogg |

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

- 触发：`puzzle_safe` 每次转动。
- 总线：SFX。
- 空间化：3D 点声源。
- 正确密码最后一下更沉；错误时用干涩卡响，不加失败音效。
