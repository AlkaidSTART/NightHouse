# SFX_LightSwitch · 灯具开关

> 资产类型：音效 ｜ 优先级：P2 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_LightSwitch` |
| 使用位置 | 一层书房绿罩电台灯 `LIGHT_study_desk_lamp`（`echo_study_lamp`）；一层门厅断线壁挂电话 `INT_prop_telephone`（`clue_1897_technology`） |
| 依赖 / 复用 | `echo_study_lamp`（首次进入书房台灯自行闪烁/开关）、`INT_prop_telephone`（拿起断线听筒听见微弱电流声） |
| 剧情用途 | 体现世界观 §3.4 的 1897 年早期电气技术边界：「宅内以煤气灯为主，门厅与书房装了早期电灯；听筒拿起来，里面没有拨号音，只有很轻的电流声，像远处的雨」 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**合集主提示词（单文件 2 段式，间隔 0.5 秒静音）：**

```text
Two 1890s early electrical device sounds separated by a half-second silence: (1) an antique brass rotary electric desk lamp switch clicking with a brief carbon-filament bulb electrical buzz; (2) lifting a heavy 1890s wall-mounted wooden telephone earpiece off its brass hook, followed by 2 seconds of faint dead-line electrical static hiss resembling distant rain (strictly no modern dial tone), then hanging the receiver back on the brass cradle. Dry close recording, no music, no voices.
```

**分段独立生成提示词（Sub-prompts）：**

- **Sub-1 `rotary_lamp_switch`（书房 `echo_study_lamp` 早期电灯旋钮开关与钨/碳丝微弱电流声，时长 0.8 秒）：**
  ```text
  Antique 1890s brass rotary electric lamp switch snap click followed by a tiny 0.3-second carbon filament electrical hum flicker, close microphone, dry, no music, no voices.
  ```
- **Sub-2 `dead_telephone_receiver`（门厅壁挂电话 `INT_prop_telephone`：「听筒拿起来，里面没有拨号音，只有很轻的电流声，像远处的雨」，时长 3.0 秒）：**
  ```text
  Lifting an antique Victorian ear-trumpet telephone receiver from a brass switch-hook clink, 2 seconds of very soft dead-wire electromagnetic crackle and rain-like line hiss with zero dial tone, then placing receiver back on hook, close mic, dry, no music, no voices.
  ```

**负向提示词（Negative prompt）**

```text
modern phone dial tone, busy signal, DTMF keypad beeps, telephone ring bell, modern plastic rocker switch, neon tube hum, music, melody, vocals, speech, clipping, distortion, cartoon sound, low quality
```

**检索关键词：** antique brass rotary light switch click, 1890s wall telephone hook lift, dead telephone line static hiss no dial tone

## 2. 用途

为灯光状态变化提供机械反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.1–0.3 秒 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -10 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_LightSwitch.ogg |

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

如果玩家不能与灯具交互，可以只作为环境音使用。
