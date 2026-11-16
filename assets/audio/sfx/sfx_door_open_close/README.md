# SFX_DoorOpenClose · 木门开关

> 资产类型：音效 ｜ 优先级：P0 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_DoorOpenClose` |
| 使用位置 | 全场景 12 扇门（`DOOR_gate` 室外铁门、`DOOR_front` 别墅正门、7 扇室内可开木门、以及 6 扇初始上锁门与 3 扇永久锁闭门 `DOOR_sealed_*`） |
| 依赖 / 复用 | `DoorSystem.ts` 开门、关门、锁闭提示（`门锁着。`）与钥匙解锁事件 |
| 剧情用途 | 覆盖从开场第一声「推开生锈铁艺大门（B0a）」到「敲正门并关门隔绝风雨（B0c）」、再到室内探索时木门开合、拧不动锁把及用钥匙打开储物间/伊芙琳卧室的全部门交互反馈 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**合集主提示词（单文件 6 段式，每段间隔 0.5 秒静音）：**

```text
Six distinct 1897 Victorian door interaction sounds separated by half-second silences, dry close microphone: (1) heavy wooden interior door brass handle turn, latch release and short hinge creak opening; (2) wooden interior door closing with a solid wood thud and brass latch click; (3) locked antique door brass knob rattling twice against a deadbolt without opening; (4) old brass key inserting into a mortise lock and turning heavy iron bolt; (5) outdoor rusted wrought-iron estate gate creaking open slowly in the rain; (6) three firm knocks on a heavy oak front door followed by heavy door closing shut. No music, no voices.
```

**分段独立生成提示词（Sub-prompts，供逐条生成后拼接）：**

- **Sub-1 `wood_open`（室内木门打开：`DOOR_parlor`/`dining`/`study`/`storage`/`terrace`/`evelyn_room`/`bathroom`，时长 1.2 秒）：**
  ```text
  Old Victorian solid wood interior door opening: brass handle depress, mortise latch click, short warm wood hinge creak, close microphone, dry, no music, no voices.
  ```
- **Sub-2 `wood_close`（室内木门关闭，及 B0c 正门在身后关上隔绝雨声，时长 1.0 秒）：**
  ```text
  Old solid wood interior door closing: gentle air push, firm wooden frame thud, brass latch clicking into strike plate, close microphone, dry, no music, no voices.
  ```
- **Sub-3 `locked_rattle`（门上锁反馈 `LOCKED_MESSAGE = '门锁着。'`，用于未解锁的剧情门与 `DOOR_sealed_*`，时长 0.8 秒）：**
  ```text
  Locked antique Victorian wooden door: brass doorknob turned and rattled twice against a stuck mortise lock bolt, solid wood resistance, door does not open, close mic, dry, no music.
  ```
- **Sub-4 `key_unlock`（使用 `item_storage_key` 或 `item_housekeeper_key` 首次解锁房门，时长 1.0 秒）：**
  ```text
  Heavy antique brass skeleton key sliding into an old iron door keyhole and turning the heavy deadbolt with a metallic clunk, close mic, dry, no music.
  ```
- **Sub-5 `iron_gate_open`（B0a 推开室外车道铁门 `DOOR_gate`，故事线 §1.5「玩家制造的第一个声音」，时长 2.2 秒）：**
  ```text
  Heavy rusted Victorian wrought-iron estate gate being pushed open on wet stone hinges, long metallic hinge groan and iron latch clank, outdoor close mic, no music, no voices.
  ```
- **Sub-6 `front_door_knock`（B0c 门廊敲响正门 `DOOR_front`，时长 1.2 秒）：**
  ```text
  Three firm restrained knocks with a heavy brass door knocker on a thick wet oak manor front door, close mic, dry, no music, no voices.
  ```

**负向提示词（Negative prompt）**

```text
modern electronic lock beep, automatic sliding door, screen door slap, glass shatter, horror slam, music, melody, vocals, speech, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** old wooden door open close, locked doorknob rattle, skeleton key unlock, rusted iron gate creak, brass door knocker

## 2. 用途

为开门、关门和门锁提供明确反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 1.5–3 秒（开 + 关可拆分） |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -6 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_DoorOpenClose.ogg |

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

开门和关门建议拆成独立文件，方便交互系统按状态播放。
