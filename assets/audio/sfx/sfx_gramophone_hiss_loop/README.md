# SFX_Gramophone_Hiss_Loop · 留声机底噪循环

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_Gramophone_Hiss_Loop` |
| 使用位置 | 一层书房留声机 `INT_prop_phonograph`（坐标 `[-6.4, 0.95, -3.14]`）；隐藏结局 `ending_echo` 门厅远景透音（C7：隔着一层走廊听见书房未关严的门内蜡筒空转） |
| 依赖 / 复用 | `item.cylinder` / `clue_gramophone_cylinder` / `story.heard_recording` / `echo_gramophone` / `ending_echo` |
| 剧情用途 | 表现 1897 年褐蜡筒留声机播放伊芙琳遗言时的表面沙沙底噪，以及「蜡筒转完最后一圈，唱针在空白处沙沙地空转」直至终局门厅念名时的持续在场感 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Seamless 1897 Edison-style brown wax cylinder phonograph surface noise and clockwork spring motor hum: steady rhythmic wax groove rotation hiss, warm brass horn acoustic filtering, soft needle friction in a run-out groove, low level crackle, strictly no music, no singing, no speech.
```

**负向提示词（Negative prompt）**

```text
music, melody, singing, vocals, speech, modern vinyl hip-hop crackle, digital white noise, radio static, sudden loud pops, clipping, distortion, audible loop seam, cartoon sound, low quality
```

**检索关键词：** wax cylinder phonograph surface noise, antique gramophone hiss loop, spring motor hum, brass horn needle friction, seamless loop

## 2. 用途

1. **书房近场播放（`INT_prop_phonograph`）**：「铜喇叭里先是一阵沙沙声，然后响起她的声音……蜡筒转完最后一圈，唱针在空白处沙沙地空转。」
2. **终局门厅远景透音（`ending_echo` 隐藏结局，场景建模方案 C7）**：「23 点 55 分，门厅。走廊尽头的书房门没有关严。刚才在书房播放过的留声机还没有停，铜喇叭里传来蜡筒空转的沙沙声。」此时声源挂在书房门口方向（`[-8.5, 1.0, -2.0]`），施加 1.2 kHz 低通滤波与走廊距离衰减。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 30–60 秒无缝循环 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -18 dBFS |
| 循环 | 无缝循环 |
| 运行路径 | public/assets/audio/sfx/SFX_Gramophone_Hiss_Loop.ogg |

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

- 触发：操作留声机后先起底噪 0.5 秒。
- 总线：SFX。
- 空间化：3D 点声源。
- 底噪必须低，不能盖住录音台词；录音结束后留 0.3 秒再淡出。
