# SFX_Clock_Mechanism · 钟表机械操作

> 资产类型：音频 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 门厅落地钟 |
| 依赖 / 复用 | `puzzle_clock` 交互 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Close mechanical sounds of a longcase clock: brass key winding, gear clicks, pendulum hook, wooden side panel latch opening, dry and detailed, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** clock winding key, gear clicks, pendulum hook, wooden latch

## 2. 用途

修钟谜题的分步反馈：开钟门、挂摆锤、上弦、开暗格。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 2–5 秒（可拆成 3–4 段） |
| 格式 | 单声道 / 48 kHz / 24-bit |
| 响度 | 峰值低于 -6 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_Clock_Mechanism.ogg |

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

- 触发：`puzzle_clock` 每一步交互。
- 总线：SFX。
- 空间化：3D 点声源。
- 拆成 winding / pendulum / latch 三段，交互系统按步骤播放；失败反馈只做空转咔哒声。
