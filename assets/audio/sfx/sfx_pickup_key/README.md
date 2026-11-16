# SFX_PickupKey · 拾取钥匙

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_PickupKey` |
| 使用位置 | 门厅钥匙串 `INT_prop_storage_key_ring`、书房抽屉钟钥匙 `item_clock_key`、霍尔太太递交卧室钥匙 `item_housekeeper_key`、卧室衣柜铜摆锤 `item_pendulum`、储物间旧物箱裁纸剪 `INT_prop_old_items_box` / 闪回 `fb_photo`、室外铜牌 `INT_prop_gate_plaque` |
| 依赖 / 复用 | 背包金属物品获取与金属器物检视反馈 |
| 剧情用途 | 区分「单把黄铜钥匙」「门厅挂钩上的一串旧钥匙」「沉甸甸的落地钟铜摆锤」以及「剪断全家福的裁纸剪合拢声（`fb_photo`）」，让每件关键金属证物拥有可辨识的重量与材质感 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**合集主提示词（单文件 4 段式，每段间隔 0.5 秒静音）：**

```text
Four distinct close-mic antique metal object handling sounds separated by half-second silences: (1) picking up a single small antique brass key from a wooden drawer; (2) lifting an iron key ring with three old brass keys off a wall hook with a short restrained clink; (3) lifting a heavy solid brass clock pendulum disc wrapped in wool; (4) a single crisp snip of heavy vintage steel paper-cutting scissors closing on thick photo cardstock. Dry close recording, no music, no voices.
```

**分段独立生成提示词（Sub-prompts）：**

- **Sub-1 `single_brass_key`（单把黄铜钥匙：`item_clock_key` 钟钥匙、`item_housekeeper_key` 卧室钥匙，时长 0.6 秒）：**
  ```text
  Picking up a single small antique brass skeleton key from a wooden surface, crisp light brass clink and finger handling, close mic, dry, no jingle, no music.
  ```
- **Sub-2 `key_ring`（门厅衣帽钩取下储物间钥匙串 `INT_prop_storage_key_ring`：「挂钩上挂着一串旧钥匙，铜环已经磨得发亮」，时长 0.9 秒）：**
  ```text
  Lifting a small brass ring holding three old keys off a wooden wall hook, brief restrained metallic chime and heavy brass contact, close mic, dry, no music.
  ```
- **Sub-3 `heavy_pendulum`（卧室衣柜取出落地钟铜摆锤 `item_pendulum`：「沉甸甸的黄铜摆锤，原本用旧羊毛外套裹着」，时长 1.0 秒）：**
  ```text
  Lifting a heavy solid brass grandfather clock pendulum bob out of thick wool cloth, dull weighty bronze thud and muted metallic resonance, close mic, dry, no music.
  ```
- **Sub-4 `scissors_snip`（储物间旧物箱 `INT_prop_old_items_box` 裁纸剪 & 客厅全家福闪回 `fb_photo`：「剪刀合拢，照片上的人被剪掉」，时长 0.7 秒）：**
  ```text
  A single deliberate crisp cut of heavy Victorian steel shears slicing through thick vintage photograph cardboard and closing shut, close mic, dry, no music, no voices.
  ```

**负向提示词（Negative prompt）**

```text
jailer huge keychain shaking, coins dropping, sword slash, gun cocking, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** small brass key pickup, antique key ring clink, heavy brass pendulum lift, vintage steel scissors cut cardstock

## 2. 用途

为关键道具提供清晰的金属质感反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.3–0.8 秒 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_PickupKey.ogg |

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

钥匙声应短促，避免像一串钥匙的大幅晃动。
