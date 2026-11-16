# SFX_SafeLatch · 保险箱开启

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_SafeLatch` |
| 使用位置 | 一层书房四位数字保险箱 `INT_prop_safe`（`puzzle_safe` 密码 `0314` 成功开启） |
| 依赖 / 复用 | `puzzle_safe` 成功事件（`story.safe_opened`），取得 `clue_shipping_ledger` 与 `clue_insurance_policy` |
| 剧情用途 | 严格对应 `puzzles.ts`：「最后一位数字对上的瞬间，锁舌缩了回去。箱门打开，里面是一叠用细绳捆好的文件。」为解开「珀耳塞福涅号」沉船日期 `0314` 提供厚重、有成就感的机械解锁反馈 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Antique 1897 cast-iron study safe unlocking and opening: final brass tumbler falling into place, heavy steel locking bolts retracting with a deep mechanical clunk, followed by the thick iron safe door swinging open on tight oiled hinges, close microphone, dry, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
electronic lock beep, sci-fi pneumatic door hiss, explosion, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** heavy iron safe bolt retract, antique safe latch release, cast iron safe door swing open, close mic dry

## 2. 用途

保险箱密码正确后的开门反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 1.5–3 秒 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -6 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_SafeLatch.ogg |

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

- 触发：`puzzle_safe` 成功。
- 总线：SFX。
- 空间化：3D 点声源。
- 与转盘分开；只在密码正确时播放，不要作为每次重试的反馈。
