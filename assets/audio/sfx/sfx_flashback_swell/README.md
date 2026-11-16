# SFX_FlashbackSwell · 闪回进入与退出

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_FlashbackSwell` |
| 使用位置 | 全场景 8 处非交互闪回（`fb_letter`、`fb_summer`、`fb_photo`、`fb_fireplace`、`fb_pendulum`、`fb_luggage`、`fb_gramophone`、`fb_cliff`） |
| 依赖 / 复用 | 触碰关键证物触发 2–4 秒闪回时的进入与退出过渡 |
| 剧情用途 | 划定「现实调查」与「那一夜/童年夏天记忆碎片」的听觉边界，克制低沉，不做惊吓冲击 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**合集主提示词（单文件 2 段式：`enter` 与 `exit`，间隔 0.5 秒静音）：**

```text
Two restrained psychological memory transition sounds in root key D separated by a half-second silence: (1) Flashback Enter (1.8 seconds): a soft reversed low-passed air and warm string resonance gently pulling inward into a muffled underwater-like stillness without any sharp hit; (2) Flashback Exit (1.8 seconds): a gentle low-frequency exhale releasing back into clear room air. No melody, no vocals, no horror stinger.
```

**负向提示词（Negative prompt）**

```text
jump scare hit, loud cymbal crash, sci-fi whoosh laser, white noise riser, music melody, vocals, speech, clipping, distortion, cartoon sound, low quality
```

**检索关键词：** reverse memory swell transition, muffled flashback enter exit, low-passed air pull, subtle cinematic transition

## 2. 用途

2–4 秒非交互闪回的进入与退出过渡。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 2–4 秒（enter / exit 分开） |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_FlashbackSwell.ogg |

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

- 触发：`fb_letter`、`fb_photo`、`fb_fireplace`、`fb_pendulum`、`fb_luggage`、`fb_gramophone`、`fb_cliff`。
- 总线：SFX。
- 空间化：2D。
- 闪回期间环境层低通 + 降 6 dB；设置中关闭闪回时此音也不播放。
