# SFX_Clock_Chime_Thirteen · 落地钟十三下

> 资产类型：音效 ｜ 优先级：P0 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_Clock_Chime_Thirteen` |
| 使用位置 | 一层门厅落地钟 `INT_prop_longcase_clock`（`puzzle_clock`）、`echo_clock_thirteen`、三结局收尾（`ending_echo` / `ending_signed` / `ending_refused`）及 `fb_cliff` 远景 |
| 依赖 / 复用 | `puzzle_clock` 校时拨过 12 点位（试响 13 下开暗格；选错时间敲 12 下）、`story.midnight`、三结局演出 |
| 剧情用途 | 全作核心签名音：伊芙琳在报时凸轮上多锉了一颗齿，「第十二下给活人，第十三下给珀耳塞福涅号的四名船员」；在弱拒签结局（`REFUSED_WEAK_SCRIPT`）与错误校时中则只敲十二下 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**主提示词（完整 13 下报时，间隔约 1.6 秒，总长 24–28 秒）：**

```text
A large antique 1897 Victorian longcase grandfather clock striking thirteen deep resonant brass tubular bell chimes on pitch D3, slow solemn even spacing (about 1.6 seconds between strikes), the 13th strike has a slight mechanical hesitation and a slightly detuned heavier resonance with a long 6-second natural wooden hall decay, no music, no voices, no horror stinger.
```

**分步生成提示词（推荐：供 AI 模型生成单音后精确拼装 12 下与 13 下版本，避免 AI 数错次数）：**

- **Sub-1 `strike_normal`（前 1–12 下标准单响，时长 2.5 秒，可按 1.6 秒间隔叠加 12 次）：**
  ```text
  Single deep brass strike of an antique Victorian grandfather clock hammer hitting a resonant bronze bell rod (note D3), warm wooden clock case resonance, natural 2-second decay, close-medium perspective, no music, no voices.
  ```
- **Sub-2 `strike_thirteenth`（第 13 下改装齿单响，带轻微机械卡顿与微失谐长尾音，时长 6.5 秒）：**
  ```text
  Single final strike of an old modified grandfather clock: a brief brass cam catch hesitation click followed by a deep heavy slightly detuned bronze chime strike (note D3 with subtle flat overtone), lingering 6-second decay in a quiet wooden entrance hall, no music, no voices.
  ```

**负向提示词（Negative prompt）**

```text
church tower exterior bells, carillon melody, cuckoo clock, digital alarm, music, melody, vocals, speech, sudden loud jump scare, clipping, distortion, cartoon sound, low quality
```

**检索关键词：** longcase clock chime, grandfather clock single strike, thirteen strikes, deep brass bell, wooden hall decay

## 2. 用途

全篇签名音，覆盖四种场景状态：
1. **十三下完整版（24–28 秒）**：`puzzle_clock` 成功校时到 `23:47` 试响十三下（第 13 下同时触发 `SFX_Clock_Mechanism` 的暗格弹开声）、`ending_echo`（念出四人名字后敲十三下）、`ending_signed`（签字后敲十三下）。
2. **十二下变体（截取前 12 下，约 21 秒）**：`puzzle_clock` 校时到错误时间（`wrongTime`：「钟在错误的时刻敲了十二下。声音在门厅里转了一圈，暗格纹丝不动。」），以及 `ending_refused` 弱变体（`REFUSED_WEAK_SCRIPT`：「你走出门厅的时候，钟敲了十二下。不是十三下。」）。
3. **远景单响尾音**：`fb_cliff` 闪回中隔着风雨传来的远处门厅钟声（施加 600 Hz 低通滤波）。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 完整 13 下：24–28 秒（每下间隔约 1.6 秒 + 末尾 5–6 秒自然衰减）；若采用 AudioSprite 单文件，可按 `[0.0s: strike_normal (2.5s)]` + `0.5s 静音` + `[3.0s: strike_thirteenth (6.5s)]` 存储并由代码精确调度 12 或 13 次 |
| 格式 | 源文件 WAV：立体声 / 48 kHz / 24-bit；运行文件 OGG Vorbis：立体声 / 48 kHz |
| 响度 | 峰值低于 -3 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_Clock_Chime_Thirteen.ogg |

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

- 触发：`echo_clock_thirteen`、`story.midnight`、结局收尾。
- 总线：SFX。
- 空间化：3D 点声源，挂在落地钟实体上；结局镜头可切 2D。
- 第十三下与前十二下同音色但轻微失谐、尾音更长，制造“多出来的一下”；不要用恐怖音效加工。优先实录或高质量采样。
