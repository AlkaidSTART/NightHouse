# SFX_UI_Confirm · UI 确认音

> 资产类型：音频 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 对话选项、菜单确认 |
| 依赖 / 复用 | 剧本 / 场景触发点确认后接入 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Subtle dark UI confirmation sound, soft low click with a faint tonal tail, restrained and cinematic, no melody, no voices.
```

**负向提示词（Negative prompt）**

```text
music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** subtle dark UI confirm, soft click, cinematic UI

## 2. 用途

提供克制、低干扰的界面操作反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.15–0.4 秒 |
| 格式 | 立体声 / 48 kHz / 24-bit |
| 响度 | 峰值低于 -12 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/SFX_UI_Confirm.ogg |

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

UI 音效不要过于明亮或游戏化，保持悬疑氛围。
