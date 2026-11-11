# AMB_HallRainWindow_Loop · 门厅雨窗环境循环

> 资产类型：环境音 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 门厅 / 大厅 |
| 依赖 / 复用 | B1 门厅开场后接入 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Seamless nighttime ambience in a Victorian entrance hall: rain striking tall windows, low wind against glass, faint wood floor resonance, distant clock tick, subtle room tone, no music, no voices, no sudden sounds.
```

**负向提示词（Negative prompt）**

```text
music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** Victorian hall rain window ambience, interior rain, old house room tone, seamless loop

## 2. 用途

门厅与大厅的区域环境层，与全局夜间底噪交叉淡化，建立开场的第一层空间感。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 60–90 秒无缝循环 |
| 格式 | 立体声 / 48 kHz / 24-bit |
| 响度 | 约 -20 LUFS，峰值低于 -3 dBFS |
| 循环 | 无缝循环 |
| 运行路径 | public/assets/audio/ambience/AMB_HallRainWindow_Loop.ogg |

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

- 触发：进入 `villa_hall` 后淡入，离开后 2–4 秒淡出。
- 总线：Ambience。
- 空间化：2D 环境层；窗户雨声可另做 3D 点声源。
- 雨声不要盖住落地钟的滴答与钟声；循环接缝在门厅混响下容易暴露，必须实测。
