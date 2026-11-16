# SFX_PaperPageTurn · 翻页

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_PaperPageTurn` |
| 使用位置 | 书房书架 `INT_prop_study_bookshelf`、《航海保险条款》 `INT_prop_study_book`、卧室伊芙琳日记 `INT_prop_nightstand`、钟座暗格船长日志 `INT_prop_longcase_clock`、以及线索日志 UI（`CluePanel` / `InspectPanel`）翻页 |
| 依赖 / 复用 | 线索阅读 UI 与书籍类检视交互 |
| 剧情用途 | 区分「整叠文件拾取（`SFX_PickupPaper`）」与「单页翻动 / 从书架抽出硬壳年鉴」，还原翻阅 1897 年旧账簿、航海年鉴和日记的手感 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Four variations of turning a single dry antique rag-paper page in a leather-bound journal, followed by a fifth sound of sliding a heavy hardcover nautical almanac book slightly out from a wooden bookshelf, separated by half-second silences, close microphone, dry, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
rapid book flipping, tearing paper, modern glossy magazine, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** old paper page turn, antique journal single sheet, hardcover book slide from shelf, dry paper, close mic

## 2. 用途

日记、信件、账本翻页的细节层，与拾取纸张区分。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.4–1 秒（4 个变体） |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_PaperPageTurn.ogg |

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

- 触发：线索阅读界面翻页。
- 总线：SFX。
- 空间化：2D UI 近场。
- 拾取整叠纸张用 `SFX_PickupPaper`，翻页只做单页；不要每次点击都播。
