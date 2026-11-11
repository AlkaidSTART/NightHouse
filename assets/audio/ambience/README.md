# 环境音

区域环境层负责建立空间、距离和天气。所有循环必须无缝，并与全局夜间底噪交叉淡化；响度保持克制，不抢交互音和对话。

| 优先级 | 资产 ID | 名称 | 用途 | 状态 |
|---|---|---|---|---|
| P1 | [AMB_HallRainWindow_Loop](./amb_hall_rain_window_loop/README.md) | 门厅雨窗环境循环 | 门厅与大厅的区域环境层，与全局夜间底噪交叉淡化，建立开场的第一层空间感。 | 待生成 |
| P1 | [AMB_CorridorCreak_Loop](./amb_corridor_creak_loop/README.md) | 走廊木头与远处房间 | 走廊与二楼走廊，制造被注视感，也是 `echo_mirror_delay` 与 `echo_footsteps` 的基础层。 | 待生成 |
| P1 | [AMB_StudyFireRain_Loop](./amb_study_fire_rain_loop/README.md) | 书房雨声与壁炉余烬 | 书房调查段的基础环境层，配合保险箱、账本与留声机。 | 待生成 |
| P1 | [AMB_CliffWindSea_Loop](./amb_cliff_wind_sea_loop/README.md) | 崖边海风与浪 | 西侧露台与崖边的情绪高点环境层，承载 `echo_cliff_song`。 | 待生成 |
| P1 | [AMB_HouseNight_Loop](./amb_house_night_loop/README.md) | 别墅夜间环境底噪 | 全场景基础底噪 | 待生成 |
| P2 | [AMB_BathroomDrip_Loop](./amb_bathroom_drip_loop/README.md) | 浴室滴水与瓷砖混响 | 浴室区域环境层，也是 `echo_cold_spot` 的底层。 | 待生成 |

## 通用规范

- 格式：48 kHz / 24-bit；单声道用于近距离交互音，立体声用于环境、音乐和 UI。
- 响度：环境约 -20 LUFS，音乐 -23～-20 LUFS，一次性音效按峰值控制（见各资产 README）。
- 命名：运行文件使用 PascalCase，源目录使用小写蛇形；资产 ID 稳定不变。
- 授权：每个资产必须在 README 第 5 节记录来源、许可证、商用许可和署名要求。
- 播放：统一由 `AudioManager` 管理，不在各模块重复创建播放器。
