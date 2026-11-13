# SFX_FabricRustle · 衣物与床单摩擦

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 卧室 / 储物间 / 闪回 |
| 依赖 / 复用 | `fb_fireplace`、`fb_pendulum`、`fb_luggage` |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Old wool coat and cotton bedsheet rustling, slow movement, 4 variations, close microphone, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** wool coat rustle, cotton bedsheet, fabric movement, close mic

## 2. 用途

衣柜、行李箱、床单裹尸闪回和窗帘的细节层。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.5–1.5 秒（4 个变体） |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_FabricRustle.ogg |

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

- 触发：衣柜、行李箱、闪回演出。
- 总线：SFX。
- 空间化：3D 点声源或 2D 闪回层。
- 避免听起来像现代冲锋衣；旧羊毛要闷、粗、短。
