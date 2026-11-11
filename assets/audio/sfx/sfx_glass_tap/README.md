# SFX_GlassTap · 玻璃与镜面轻响

> 资产类型：音频 ｜ 优先级：P2 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 客厅全家福 / 走廊镜子 |
| 依赖 / 复用 | `echo_photo_glare`、`echo_mirror_delay` |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
A single soft tap on old glass or a picture frame, slight resonance, close microphone, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** glass tap, picture frame tap, mirror resonance, subtle

## 2. 用途

全家福反光、镜面不安感的极轻提示音。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.2–0.5 秒（3 个变体） |
| 格式 | 单声道 / 48 kHz / 24-bit |
| 响度 | 峰值低于 -10 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_GlassTap.ogg |

## 4. 生成后检查

- [ ] 时长、格式和响度符合规格
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

- 触发：`echo_photo_glare`、镜子经过。
- 总线：SFX。
- 空间化：3D 点声源。
- 不要做成 UI 叮声；应当像指甲轻碰旧玻璃。
