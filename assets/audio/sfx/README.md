# 音效

音效负责交互反馈、空间材质和剧情瞬间。一次性音效使用峰值控制而非 LUFS；同一动作准备多个变体，避免机械重复。

| 优先级 | 资产 ID | 名称 | 用途 | 状态 |
|---|---|---|---|---|
| P0 | [SFX_Clock_Tick_Loop](./sfx_clock_tick_loop/README.md) | 落地钟滴答循环 | 门厅的节拍器，提醒玩家午夜临近；修钟后从静默转为走动。 | 待生成 |
| P0 | [SFX_Clock_Chime_Thirteen](./sfx_clock_chime_thirteen/README.md) | 落地钟十三下 | 全篇签名音：午夜十三下、钟座暗格开启、三个结局的收尾回响。 | 待生成 |
| P0 | [SFX_FootstepWood_Set](./sfx_footstep_wood_set/README.md) | 木地板脚步套装 | 玩家在木地板移动 | 待生成 |
| P0 | [SFX_DoorOpenClose](./sfx_door_open_close/README.md) | 木门开关 | 房门交互 | 待生成 |
| P0 | [SFX_PickupPaper](./sfx_pickup_paper/README.md) | 拾取 / 翻动纸张 | 拾取信件、日记、文件 | 待生成 |
| P1 | [SFX_Clock_Mechanism](./sfx_clock_mechanism/README.md) | 钟表机械操作 | 修钟谜题的分步反馈：开钟门、挂摆锤、上弦、开暗格。 | 待生成 |
| P1 | [SFX_DoorCreak](./sfx_door_creak/README.md) | 门缝缓开 | 门自己开一条缝的回响，以及玩家缓慢推门时的细节。 | 待生成 |
| P1 | [SFX_Gramophone_Hiss_Loop](./sfx_gramophone_hiss_loop/README.md) | 留声机底噪循环 | 播放蜡筒前的底噪，建立“机器已经启动”的期待。 | 待生成 |
| P1 | [SFX_Gramophone_Play](./sfx_gramophone_play/README.md) | 留声机启停机械声 | 蜡筒播放的开始与结束机械反馈。 | 待生成 |
| P1 | [SFX_FootstepCarpet_Set](./sfx_footstep_carpet_set/README.md) | 地毯脚步套装 | 厚地毯区域的移动反馈，与木地板脚步按材质切换。 | 待生成 |
| P1 | [SFX_FootstepStone_Set](./sfx_footstep_stone_set/README.md) | 石阶与露台脚步 | 石阶与露台的移动反馈，强调室外和湿滑感。 | 待生成 |
| P1 | [SFX_FabricRustle](./sfx_fabric_rustle/README.md) | 衣物与床单摩擦 | 衣柜、行李箱、床单裹尸闪回和窗帘的细节层。 | 待生成 |
| P1 | [SFX_PaperPageTurn](./sfx_paper_page_turn/README.md) | 翻页 | 日记、信件、账本翻页的细节层，与拾取纸张区分。 | 待生成 |
| P1 | [SFX_MatchCandle](./sfx_match_candle/README.md) | 火柴与烛火 | 点蜡烛、烧信闪回和书房烛光的操作反馈。 | 待生成 |
| P1 | [SFX_SafeDial](./sfx_safe_dial/README.md) | 保险箱转盘 | 保险箱密码输入的每一步反馈。 | 待生成 |
| P1 | [SFX_SafeLatch](./sfx_safe_latch/README.md) | 保险箱开启 | 保险箱密码正确后的开门反馈。 | 待生成 |
| P1 | [SFX_FlashbackSwell](./sfx_flashback_swell/README.md) | 闪回进入与退出 | 2–4 秒非交互闪回的进入与退出过渡。 | 待生成 |
| P1 | [SFX_DrawerOpenClose](./sfx_drawer_open_close/README.md) | 抽屉开合 | 抽屉、柜门交互 | 待生成 |
| P1 | [SFX_PickupKey](./sfx_pickup_key/README.md) | 拾取钥匙 | 拾取钥匙或小型金属道具 | 待生成 |
| P1 | [SFX_UI_Confirm](./sfx_ui_confirm/README.md) | UI 确认音 | 对话选项、菜单确认 | 待生成 |
| P1 | [SFX_ClueDiscover_Sting](./sfx_clue_discover_sting/README.md) | 发现线索提示音 | 首次发现关键线索 | 待生成 |
| P2 | [SFX_GlassTap](./sfx_glass_tap/README.md) | 玻璃与镜面轻响 | 全家福反光、镜面不安感的极轻提示音。 | 待生成 |
| P2 | [SFX_PianoSingleNote](./sfx_piano_single_note/README.md) | 钢琴单音 | 钢琴自行响一个音的回响，引导玩家注意客厅。 | 待生成 |
| P2 | [SFX_MusicBoxNote](./sfx_music_box_note/README.md) | 音乐盒单音 | 如果最终场景选择音乐盒而不是钢琴，用这个替代 `SFX_PianoSingleNote`。 | 待生成 |
| P2 | [SFX_Heartbeat_Loop](./sfx_heartbeat_loop/README.md) | 紧张心跳 | 强度 3 时极低音量叠加，强化玩家自身的生理反应。 | 待生成 |
| P2 | [SFX_DishesClink](./sfx_dishes_clink/README.md) | 餐具轻碰 | 餐厅十三副餐具的氛围点缀，暗示“还有人没到”。 | 待生成 |
| P2 | [SFX_ChairMove](./sfx_chair_move/README.md) | 椅子拖动 | 对质段落中人物起身、坐下的空间反馈。 | 待生成 |
| P2 | [SFX_CliffHum](./sfx_cliff_hum/README.md) | 崖边风声中的哼唱 | 崖边回响：风声里像有女人在哼唱，强化伊芙琳的存在感。 | 待生成 |
| P2 | [SFX_LightSwitch](./sfx_light_switch/README.md) | 灯具开关 | 墙面开关或灯具交互 | 待生成 |

## 通用规范

- 格式：48 kHz / 24-bit；单声道用于近距离交互音，立体声用于环境、音乐和 UI。
- 响度：环境约 -20 LUFS，音乐 -23～-20 LUFS，一次性音效按峰值控制（见各资产 README）。
- 命名：运行文件使用 PascalCase，源目录使用小写蛇形；资产 ID 稳定不变。
- 授权：每个资产必须在 README 第 5 节记录来源、许可证、商用许可和署名要求。
- 播放：统一由 `AudioManager` 管理，不在各模块重复创建播放器。
