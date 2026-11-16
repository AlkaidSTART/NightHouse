# SFX_ChairMove · 椅子拖动

> 资产类型：音效 ｜ 优先级：P2 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_ChairMove` |
| 使用位置 | 一层餐厅第 13 席餐椅 `INT_prop_thirteenth_setting`（「椅子被人往外拉开了一点，像刚有人起身」）、一层书房对质书桌椅 `NPC_arthur_study_desk`（B9）、门厅午夜抉择（B10 `ending_refused`「格雷医生站起来，又坐下」） |
| 依赖 / 复用 | `INT_prop_thirteenth_setting` 检视、B9 书房对质、B10 终局演出 |
| 剧情用途 | 为餐厅第 13 席空椅以及对质/终局段落中亚瑟或格雷医生起身、坐下提供克制的实木家具空间反馈 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Two close-mic variations of a heavy antique mahogany dining chair moving a short distance on an old wooden floor separated by a half-second silence: (1) wooden chair legs sliding back 15 centimeters with a low muted wood friction rub; (2) wooden chair settling slightly as someone stands up or sits down. Dry close microphone, no loud screech, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
piercing chair screech, plastic chair, office swivel chair wheels, furniture crash, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** heavy mahogany chair slide short, antique wooden chair creak stand up, old wood floor, close mic dry

## 2. 用途

对质段落中人物起身、坐下的空间反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.6–1.5 秒（2 个变体） |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_ChairMove.ogg |

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

- 触发：NPC 起身 / 坐下演出。
- 总线：SFX。
- 空间化：3D 点声源。
- 与脚步分开，避免同步播放；不要每次对话都触发。
