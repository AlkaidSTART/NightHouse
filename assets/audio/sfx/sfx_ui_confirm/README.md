# SFX_UI_Confirm · UI 确认音

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_UI_Confirm` |
| 使用位置 | 对话选项点击（`DialoguePanel`）、线索面板（`CluePanel`）、随身背包（`InventoryPanel`）、谜题操作面板（`PuzzlePanel`）、主菜单/暂停菜单（`HomeScreen` / `PauseMenu`）、序章「走进别墅」（`PrologueOverlay`） |
| 依赖 / 复用 | 全 UI 层按钮与选项确认事件 |
| 剧情用途 | 提供克制、低干扰、带 1897 年木质/黄铜机械触感的界面反馈，涵盖「确认点击」「面板打开/关闭」与「轻量悬停/切换标签」 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**合集主提示词（单文件 3 段式：`confirm`、`tab_switch`、`panel_close`，间隔 0.4 秒静音）：**

```text
Three restrained dark-academia Victorian UI feedback sounds separated by 0.4-second silences: (1) UI Confirm (0.25s): a soft muted wooden pocket-watch case click with a subtle warm low D3 resonance tail; (2) UI Tab/Hover (0.15s): a delicate dry parchment-and-wood tick; (3) UI Panel Close (0.25s): a lower softer damped wooden latch tap. Strictly no sci-fi beeps, no bright arcade chimes, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
sci-fi beep, arcade coin ding, bright bell chime, futuristic synth UI, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** subtle dark UI confirm, muted wooden click, antique pocket watch latch UI, restrained cinematic UI

## 2. 用途

提供克制、低干扰的界面操作反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.15–0.4 秒 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 峰值低于 -12 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_UI_Confirm.ogg |

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

UI 音效不要过于明亮或游戏化，保持悬疑氛围。
