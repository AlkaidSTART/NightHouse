# 音乐 / 紧张层

本作不使用传统旋律配乐，改用可垂直叠加的紧张层（Tension Stems）。所有循环层必须**同调性（根音 D，无三音五度或暗淡 D 小调色彩）、同速度（60 BPM）、同长度（精确 60.0 秒）、同循环点**，由 `TensionDirector` 按剧情标记驱动的紧张强度（0–3）平滑淡入淡出。

> **AI 生成关键约束：** 下游模型生成这 4 条资产时，必须在提示词中锁定 `Root note D (D1/D2/D5), 60 BPM, 60.0 seconds`，避免多轨同时播放时出现半音碰撞或节拍错位。

## 紧张强度与剧情标记映射（对齐 `storyFlags.ts`）

| 强度 | 触发剧情条件 | 激活的 Stem 组合 | 叙事阶段 |
|---:|---|---|---|
| **0** | 开场 `story.arrived`（尚未发现核心矛盾） | 无（纯环境音 `AMB_*`） | 第一幕初抵、门厅接待、客厅寒暄 |
| **1** | 获得任意第一层核心矛盾：`story.knows_time_conflict`（23:40 诊疗记录）或 `story.knows_insurance_fraud`（保险箱账本/赔付单）或 `story.housekeeper_key`（拿到二楼钥匙） | `MUS_Tension_Base_Loop` | 第一幕后半 / 进入二楼私人空间 |
| **2** | 接近核心真相：`story.clock_repaired`（十三下试响开暗格）或 `story.heard_recording`（听完蜡筒）或 `story.knows_injury_at_home`（浴室痕迹） | `MUS_Tension_Base_Loop` + `MUS_Tension_Pulse_Loop` | 第二幕后半、真相拼合、对质前夕 |
| **3** | 终局摊牌与抉择：`story.case_ready`（书房对质亚瑟 B9）或 `story.midnight`（门厅午夜签字抉择 B10） | `MUS_Tension_Base_Loop` + `MUS_Tension_Pulse_Loop` + `MUS_Tension_Shimmer_Loop`（并叠加极低音量 `SFX_Heartbeat_Loop`） | 第三幕对质高潮、第四幕午夜抉择 |
| **瞬态** | `echo_clock_thirteen`、`echo_gramophone`、B10 签字落笔/拒签瞬间 | 先将环境层降 6 dB，触发一次 `MUS_Tension_Sub_Swell` | 关键叙事留白与高潮前奏 |

## 资产列表

| 优先级 | 资产 ID | 名称 | 调性 / 速度 | 用途 | 状态 |
|---|---|---|---|---|---|
| P1 | [MUS_Tension_Base_Loop](./mus_tension_base_loop/README.md) | 紧张底层持续音 | D1–D2 根音持续音 / 60s | 紧张强度 ≥1 时进入的基础层，提供持续压迫感，不承担旋律。 | 待生成 |
| P1 | [MUS_Tension_Pulse_Loop](./mus_tension_pulse_loop/README.md) | 紧张慢脉冲层 | D1 低音脉冲 / 60 BPM（每 2 秒一次）/ 60s | 强度 ≥2 时叠加，用于玩家接近真相、对质前夕，与落地钟秒针（60 BPM）同相锁拍。 | 待生成 |
| P1 | [MUS_Tension_Sub_Swell](./mus_tension_sub_swell/README.md) | 次低频渐强 | D1 次低频渐强 / 3.5s 单次 | 关键瞬间前的留白填充：先抽掉环境层，再让次低频缓慢升起。 | 待生成 |
| P2 | [MUS_Tension_Shimmer_Loop](./mus_tension_shimmer_loop/README.md) | 高频泛音层 | D5–A5 泛音空五度 / 60s | 强度 3、留声机播放或闪回演出时叠加，制造“空气变薄”的感觉。 | 待生成 |

## 通用规范

- 格式：48 kHz / 24-bit；立体声。
- 响度：音乐层整体控制在 -26～-22 LUFS，严禁掩盖环境中的钟声、脚步和 NPC 对白。
- 命名：运行文件使用 PascalCase，源目录使用小写蛇形；资产 ID 稳定不变。
- 授权：每个资产必须在 README 第 5 节记录来源、许可证、商用许可和署名要求。
- 播放：统一由 `AudioManager` 管理，不在各模块重复创建播放器。
