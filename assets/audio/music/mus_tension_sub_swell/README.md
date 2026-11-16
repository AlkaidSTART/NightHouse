# MUS_Tension_Sub_Swell · 次低频渐强

> 资产类型：音乐 / 紧张层 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `MUS_Tension_Sub_Swell` |
| 使用位置 | 落地钟十三下敲响前（`echo_clock_thirteen`）、书房留声机放下唱针前（`INT_prop_phonograph`）、门厅午夜签字/拒签抉择前（B10） |
| 依赖 / 复用 | 配合环境音瞬时衰减（Ducking -6 dB）单次播放 |
| 剧情用途 | 关键叙事节点前的 3.5 秒留白填充：先抽空周围雨声，再让 D1 次低频缓慢托起，把注意力完全聚焦到接下来的钟声或人声 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
A single restrained low sub-bass tension swell on note D1 (36.7 Hz) and D2 (73.4 Hz), 3.5 seconds duration, smoothly rising from silence to a deep warm room-pressure crest and gently releasing without any impact hit, no boom, no brass braam, no distortion, no melody, no vocals.
```

**负向提示词（Negative prompt）**

```text
impact hit, trailer boom, brass horn, jump scare stinger, metallic crash, music, melody, vocals, speech, clipping, distortion, cartoon sound, low quality
```

**检索关键词：** sub bass swell D1, rising low pressure tension, no impact hit, cinematic restraint 3.5s

## 2. 用途

关键瞬间前的留白填充：先抽掉环境层，再让次低频缓慢升起。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 3–4 秒 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 峰值低于 -6 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/music/MUS_Tension_Sub_Swell.ogg |

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

- 触发：`echo_clock_thirteen`、`echo_gramophone`、午夜选择前。
- 总线：Music。
- 空间化：2D 直通。
- 一次只叠一层；不要做成冲击音或 jump scare。
