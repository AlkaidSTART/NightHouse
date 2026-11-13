# SFX_FootstepCarpet_Set · 地毯脚步套装

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 客厅 / 走廊 / 卧室厚地毯 |
| 依赖 / 复用 | PlayerController 脚步事件 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Soft footsteps on a thick old carpet indoors, slow walk, muffled heel-to-toe, 5 variations, close microphone, no reverb, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** carpet footsteps, muffled indoor walk, soft steps, variations

## 2. 用途

厚地毯区域的移动反馈，与木地板脚步按材质切换。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 单条 0.2–0.4 秒；5 个变体 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -6 dBFS；与木地板脚步统一响度 |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_FootstepCarpet_Set.ogg |

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

- 触发：玩家在地毯材质上行走。
- 总线：SFX。
- 空间化：2D 近距离播放，避免第一人称脚步定位漂移。
- 地毯脚步更闷、更轻；不要带长混响，空间感交给场景。
