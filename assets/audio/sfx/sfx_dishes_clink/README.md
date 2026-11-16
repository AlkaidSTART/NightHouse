# SFX_DishesClink · 餐具轻碰

> 资产类型：音效 ｜ 优先级：P2 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_DishesClink` |
| 使用位置 | 一层餐厅 `villa_dining`（第 13 副餐具 `INT_prop_thirteenth_setting`、B3 晚宴残席三人同场戏 `npc_arthur_dinner_*`） |
| 依赖 / 复用 | `clue_dinner_seating`、B3 餐厅对话（格雷晃动红酒杯并放下、霍尔太太摆正第 13 副餐具歪掉的餐刀） |
| 剧情用途 | 精确服务于故事线 §1.6 与 `inspectables.ts`：「霍尔太太低头把第 13 副餐具歪掉的餐刀摆正」「格雷仰头喝干了最后一口酒」「餐巾没有拆封，酒杯倒扣着」 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Three subtle close-mic Victorian dining table foley variations separated by 0.4-second silences: (1) a heavy silver dinner knife being gently straightened next to a bone-china plate on a linen tablecloth; (2) a crystal wine glass being set down softly on a wooden dining table; (3) a quiet touch of antique silverware against porcelain. Restrained, dry close microphone, no kitchen clatter, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
restaurant crowd chatter, kitchen dishwashing clatter, plate smashing, cheers glass toast, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** silver knife on linen tablecloth, bone china porcelain clink, crystal wine glass set down, subtle close mic

## 2. 用途

餐厅十三副餐具的氛围点缀，暗示“还有人没到”。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.3–0.8 秒（3 个变体） |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -10 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_DishesClink.ogg |

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

- 触发：进入餐厅、观察第十三副餐具。
- 总线：SFX。
- 空间化：3D 点声源。
- 稀疏使用，不要形成节奏；不要配合灯光闪烁。
