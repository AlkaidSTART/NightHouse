# MUS_Tension_Shimmer_Loop · 高频泛音层

> 资产类型：音乐 / 紧张层 ｜ 优先级：P2 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 对质、录音、闪回段落 |
| 依赖 / 复用 | TensionDirector 实现后接入 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Seamless high shimmer texture: bowed strings harmonics, glass-like overtones, very quiet, no melody, no rhythm, no vocals, 60 seconds, seamless loop.
```

**负向提示词（Negative prompt）**

```text
music, melody, vocals, speech, sudden loud noises, clipping, distortion, audible loop seam, heavy reverb, cartoon sound, low quality
```

**检索关键词：** high string harmonics texture, glass overtones, quiet tension, seamless loop, no melody

## 2. 用途

强度 3 或关键演出时叠加，制造“空气变薄”的感觉。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 60 秒无缝循环 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 约 -26 LUFS，峰值低于 -10 dBFS |
| 循环 | 无缝循环 |
| 运行路径 | public/assets/audio/music/MUS_Tension_Shimmer_Loop.ogg |

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

- 触发：强度 3、留声机播放、闪回进入。
- 总线：Music。
- 空间化：2D 直通。
- 音量必须很低，避免刺耳；不要与 `SFX_ClueDiscover_Sting` 同时出现。
