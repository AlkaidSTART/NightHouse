# SFX_Clock_Mechanism · 钟表机械操作

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_Clock_Mechanism` |
| 使用位置 | 一层门厅落地钟 `INT_prop_longcase_clock`（`puzzle_clock`）、`fb_pendulum` 闪回 |
| 依赖 / 复用 | `puzzle_clock` 的 4 个操作步骤与失败反馈 |
| 剧情用途 | 为落地钟谜题的每一步物理操作（用黄铜钥匙开钟门 → 把铜摆锤挂回摆杆 → 转动钥匙上弦 → 拨动分针校时 → 第十三下时钟座侧板弹开暗格）提供精确机械反馈 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**合集主提示词（单文件 5 段式，每段间隔 0.5 秒静音）：**

```text
Five distinct close-mic mechanical sounds of an antique 1897 wooden grandfather clock separated by half-second silences: (1) small brass key unlocking and glazed wooden clock case door opening; (2) heavy brass pendulum hooking onto metal suspension rod with a single settling swing click; (3) brass winding key ratcheting clockwork mainspring gears three turns; (4) spring-loaded wooden secret side panel popping open at the base; (5) dry metallic gear slip click when operated without pendulum. Dry close recording, no music, no voices.
```

**分段独立生成提示词（Sub-prompts，供逐条生成后拼接）：**

- **Sub-1 `open_door`（对应 `actions.openDoor`「用黄铜钥匙打开钟门」，时长 1.2 秒）：**
  ```text
  Small antique brass key turning in a miniature cabinet lock followed by a narrow glass-paneled mahogany clock door creaking open, close microphone, dry, no music, no voices.
  ```
- **Sub-2 `hang_pendulum`（对应 `actions.hangPendulum`「把摆锤挂回摆杆」，时长 1.2 秒）：**
  ```text
  Heavy brass clock pendulum hooking onto a thin steel suspension rod inside a wooden case, metal-on-metal hook clink and one gentle pendulum sway click, close mic, dry, no music.
  ```
- **Sub-3 `wind_key`（对应 `actions.wind`「上弦」与拨针，时长 1.8 秒）：**
  ```text
  Winding an antique grandfather clock with a brass key: three firm ratchet gear winding turns and escapement engaging, close mechanical detail, dry, no chime, no music.
  ```
- **Sub-4 `secret_latch`（对应第十三下时「钟座侧板弹开，露出狭长暗格」，时长 1.2 秒）：**
  ```text
  Hidden spring latch releasing inside a wooden grandfather clock base and a narrow mahogany side panel popping open with a hollow wooden clunk, close mic, dry, no music.
  ```
- **Sub-5 `empty_click`（对应未装摆锤或操作失败的空转咔哒声，时长 0.6 秒）：**
  ```text
  Single dry mechanical clock hand click and unhooked escapement lever slip, short and muted, close mic, no chime, no music.
  ```

**负向提示词（Negative prompt）**

```text
bell chime, cuckoo, modern servo motor, sci-fi mechanism, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** clock winding key ratchet, brass pendulum hook, wooden secret compartment latch, grandfather clock mechanism

## 2. 用途

修钟谜题的分步反馈：开钟门、挂摆锤、上弦、开暗格。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 2–5 秒（可拆成 3–4 段） |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -6 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_Clock_Mechanism.ogg |

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

- 触发：`puzzle_clock` 每一步交互。
- 总线：SFX。
- 空间化：3D 点声源。
- 拆成 winding / pendulum / latch 三段，交互系统按步骤播放；失败反馈只做空转咔哒声。
