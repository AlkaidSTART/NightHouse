# 音乐 / 紧张层

本作不使用传统配乐，改用可叠加的紧张 stem。所有循环层必须同长、同循环点，由 `TensionDirector` 按剧情强度淡入淡出。

| 优先级 | 资产 ID | 名称 | 用途 | 状态 |
|---|---|---|---|---|
| P1 | [MUS_Tension_Base_Loop](./mus_tension_base_loop/README.md) | 紧张底层持续音 | 紧张强度 ≥1 时进入的基础层，提供持续压迫感，不承担旋律。 | 待生成 |
| P1 | [MUS_Tension_Pulse_Loop](./mus_tension_pulse_loop/README.md) | 紧张慢脉冲层 | 强度 ≥2 时叠加，用于玩家接近真相、对质前夕。 | 待生成 |
| P1 | [MUS_Tension_Sub_Swell](./mus_tension_sub_swell/README.md) | 次低频渐强 | 关键瞬间前的留白填充：先抽掉环境层，再让次低频缓慢升起。 | 待生成 |
| P2 | [MUS_Tension_Shimmer_Loop](./mus_tension_shimmer_loop/README.md) | 高频泛音层 | 强度 3 或关键演出时叠加，制造“空气变薄”的感觉。 | 待生成 |

## 通用规范

- 格式：48 kHz / 24-bit；单声道用于近距离交互音，立体声用于环境、音乐和 UI。
- 响度：环境约 -20 LUFS，音乐 -23～-20 LUFS，一次性音效按峰值控制（见各资产 README）。
- 命名：运行文件使用 PascalCase，源目录使用小写蛇形；资产 ID 稳定不变。
- 授权：每个资产必须在 README 第 5 节记录来源、许可证、商用许可和署名要求。
- 播放：统一由 `AudioManager` 管理，不在各模块重复创建播放器。
