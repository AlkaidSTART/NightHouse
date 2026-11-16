# 音效

音效负责交互反馈、空间材质和剧情瞬间。一次性音效使用峰值控制而非 LUFS；同一动作准备多个变体或动作分段，避免机械重复。

> **AI 生成与多变体/分段约定：**
> 1. 凡包含多个随机变体（如脚步、翻页、餐具、玻璃、衣物）或多个动作分段（如门开关/锁死/铁门、钟表操作、留声机启停、闪回进出）的资产，各 README 均已补充**子变体提示词（Sub-prompts）**。
> 2. 生成单文件运行资产（`<Asset_ID>.ogg`）时，各子段按顺序排列，**段间固定留 `0.4–0.5 秒` 纯静音间隔**，以便运行时按时间戳（AudioSprite）切片；或先按子提示词逐条生成独立 WAV 再拼接。

| 优先级 | 资产 ID | 名称 | 覆盖的场景交互点 / 机关 / 节点 | 用途 | 状态 |
|---|---|---|---|---|---|
| P0 | [SFX_Clock_Tick_Loop](./sfx_clock_tick_loop/README.md) | 落地钟滴答循环 | `INT_prop_longcase_clock`、`INT_prop_mantel_clock`（调高复用） | 门厅的节拍器，修钟（`story.clock_repaired`）后从静默转为走动；修钟前检视仅播单声轻滴答。 | 待生成 |
| P0 | [SFX_Clock_Chime_Thirteen](./sfx_clock_chime_thirteen/README.md) | 落地钟十三下 | `puzzle_clock`、`echo_clock_thirteen`、三结局收尾 | 全篇签名音：午夜十三下、钟座暗格开启；含错误校时与弱拒签结局所需的「十二下」变体。 | 待生成 |
| P0 | [SFX_FootstepWood_Set](./sfx_footstep_wood_set/README.md) | 木地板脚步套装 | 室内木地板、主楼梯（`stair_a`/`b`）、`echo_footsteps`、`puzzle_safe` 门外脚步 | 玩家在木地板与木楼梯移动（5 个单步变体），兼顾二楼远景脚步与书房门外格雷脚步。 | 待生成 |
| P0 | [SFX_DoorOpenClose](./sfx_door_open_close/README.md) | 房门与铁门开关/锁闭 | 全部 12 扇 `DOOR_*`（室内木门、正门 `DOOR_front`、室外铁门 `DOOR_gate`、锁死门把、钥匙开锁） | 涵盖木门开、木门关、上锁门把拧动、钥匙解锁、室外生锈铁门推开及正门敲门。 | 待生成 |
| P0 | [SFX_PickupPaper](./sfx_pickup_paper/README.md) | 拾取纸张 / 摊开卷宗 / 签字 | 信件、遗嘱、潮汐表、报纸、账本、`INT_prop_signing_table` | 拾取或展开信件、文件、厚账本，以及午夜抉择时蘸水笔签字/放下笔的纸面反馈。 | 待生成 |
| P1 | [SFX_Clock_Mechanism](./sfx_clock_mechanism/README.md) | 钟表机械操作 | `puzzle_clock`（`INT_prop_longcase_clock`）、`fb_pendulum` | 修钟谜题分步反馈：钥匙开钟门、挂铜摆锤、发条上弦、钟座暗格弹开、未装摆锤空转咔哒。 | 待生成 |
| P1 | [SFX_DoorCreak](./sfx_door_creak/README.md) | 门缝缓开 | `DOOR_evelyn_room`（`echo_door_ajar`）、缓慢推门 | 二楼走廊伊芙琳卧室门自行开一条缝的回响，以及玩家缓慢推门时的铰链细节。 | 待生成 |
| P1 | [SFX_Gramophone_Hiss_Loop](./sfx_gramophone_hiss_loop/README.md) | 留声机底噪与空转循环 | 书房 `INT_prop_phonograph`、`ending_echo` 门厅远景（C7） | 播放蜡筒时的表面沙沙底噪与发条马达声，以及终局门厅听见的走廊尽头蜡筒空白槽空转声。 | 待生成 |
| P1 | [SFX_Gramophone_Play](./sfx_gramophone_play/README.md) | 留声机启停机械声 | 书房 `INT_prop_phonograph`、`fb_gramophone` | 嵌上蜡筒、放下唱针启动与末尾抬针/停机的机械反馈。 | 待生成 |
| P1 | [SFX_FootstepCarpet_Set](./sfx_footstep_carpet_set/README.md) | 地毯脚步套装 | 客厅沙发区、一层/二层走廊长地毯、书房炉前地毯、卧室地毯 | 厚地毯区域的移动反馈（5 个单步变体），与木地板脚步按材质切换。 | 待生成 |
| P1 | [SFX_FootstepStone_Set](./sfx_footstep_stone_set/README.md) | 石阶、车道与瓷砖脚步 | `scene_gate` 车道/门廊台阶、`villa_cliff` 露台/石阶、`villa_bathroom` 瓷砖 | 室外湿石阶、碎石车道与二楼浴室瓷砖地面的移动反馈（5 个单步变体）。 | 待生成 |
| P1 | [SFX_FabricRustle](./sfx_fabric_rustle/README.md) | 衣物、披肩与床单摩擦 | `INT_prop_cloak`、`INT_prop_shawl`、`INT_prop_wardrobe`、`INT_prop_towel_rack`、`fb_*` | 门厅湿斗篷、餐厅披肩、卧室羊毛外套、浴室旧毛巾及闪回争执/裹尸的布料细节层。 | 待生成 |
| P1 | [SFX_PaperPageTurn](./sfx_paper_page_turn/README.md) | 翻页与书册抽拉 | `INT_prop_study_bookshelf`、`INT_prop_study_book`、日记、旧信、线索阅读 UI | 书架抽书、《航海保险条款》翻页、日记/信件/账本单页翻动，与整叠拾取区分。 | 待生成 |
| P1 | [SFX_MatchCandle](./sfx_match_candle/README.md) | 火柴、烛火与灰烬拨动 | `fb_letter`、`INT_prop_study_ashes`、餐厅烛台 | 划火柴点烛、烧毁举报信闪回，以及翻检书房壁炉灰烬残页的细微脆响。 | 待生成 |
| P1 | [SFX_SafeDial](./sfx_safe_dial/README.md) | 保险箱转盘与卡响 | 书房 `INT_prop_safe`（`puzzle_safe`） | 保险箱四位密码输入的每一步金属刻度反馈，以及密码错误时的干涩卡响。 | 待生成 |
| P1 | [SFX_SafeLatch](./sfx_safe_latch/README.md) | 保险箱开启 | 书房 `INT_prop_safe`（`puzzle_safe` 成功） | 密码 `0314` 正确后锁舌缩回、厚重铁门打开的反馈。 | 待生成 |
| P1 | [SFX_FlashbackSwell](./sfx_flashback_swell/README.md) | 闪回进入与退出 | 全场景 8 处 `fb_*` 闪回 | 2–4 秒非交互闪回的进入（反向吸气渐强）与退出（低通消散）过渡。 | 待生成 |
| P1 | [SFX_DrawerOpenClose](./sfx_drawer_open_close/README.md) | 抽屉、衣柜与药柜开合 | `INT_prop_study_desk_drawer`、`INT_prop_vanity_drawer`、`INT_prop_wardrobe`、`INT_prop_medicine_cabinet`、`INT_prop_luggage`、`INT_prop_old_items_box` | 书房卡顿抽屉、梳妆台抽屉、大衣柜门、浴室木药柜及储物间行李箱/旧木箱开合。 | 待生成 |
| P1 | [SFX_PickupKey](./sfx_pickup_key/README.md) | 钥匙、铜摆锤与金属件 | `INT_prop_storage_key_ring`、`item_clock_key`、`item_housekeeper_key`、`item_pendulum`、`INT_prop_old_items_box`（剪刀） | 涵盖单把黄铜钥匙、门厅钥匙串、沉重铜摆锤拾取，以及储物间/闪回 `fb_photo` 的裁纸剪咔嚓声。 | 待生成 |
| P1 | [SFX_UI_Confirm](./sfx_ui_confirm/README.md) | UI 确认与面板切换 | 对话选项、线索面板、背包、设置、序章按钮 | 提供克制、低干扰的界面确认、悬停与面板开关反馈。 | 待生成 |
| P1 | [SFX_ClueDiscover_Sting](./sfx_clue_discover_sting/README.md) | 发现线索提示音 | 首次触发 `discover-clue`（21 条关键线索） | 首次发现关键线索时的短促克制弦乐/钢琴提示音。 | 待生成 |
| P2 | [SFX_GlassTap](./sfx_glass_tap/README.md) | 玻璃、镜面与药瓶轻响 | `INT_prop_family_portrait`、`INT_prop_corridor_mirror`、`INT_prop_family_photos`、`INT_prop_vanity_mirror_back`、`INT_prop_nightstand`、`INT_prop_medicine_cabinet`、`INT_prop_ship_model` | 全家福反光（`echo_photo_glare`）、走廊镜（`echo_mirror_delay`）、裂纹相框、船模玻璃罩及药瓶/干水杯轻碰。 | 待生成 |
| P2 | [SFX_PianoSingleNote](./sfx_piano_single_note/README.md) | 钢琴中央 C 单音 | 客厅 `INT_prop_piano`（`echo_piano_note`） | 客厅立式钢琴自行响起中央 C（C4）单音的回响，对应键面被擦掉的指印。 | 待生成 |
| P2 | [SFX_MusicBoxNote](./sfx_music_box_note/README.md) | 音乐盒单音（备选） | 客厅 / 伊芙琳卧室 | `SFX_PianoSingleNote` 的备选方案，或用于卧室梳妆台木盒细节。 | 待生成 |
| P2 | [SFX_Heartbeat_Loop](./sfx_heartbeat_loop/README.md) | 紧张心跳 | 书房对质（B9）/ 门厅午夜抉择（B10） | `TensionDirector` 强度 3 时极低音量（55 BPM）叠加，强化玩家生理紧迫感。 | 待生成 |
| P2 | [SFX_DishesClink](./sfx_dishes_clink/README.md) | 银餐具与瓷盘轻碰 | 餐厅 `INT_prop_thirteenth_setting`、B3 晚宴残席 | 餐厅十三副银餐具与格雷酒杯的轻微碰响，暗示“还有人没到”。 | 待生成 |
| P2 | [SFX_ChairMove](./sfx_chair_move/README.md) | 木椅拖动 | 餐厅 `INT_prop_thirteenth_setting`、书房对质（B9）、门厅（B10） | 第十三把椅子微拉、B9/B10 对质段落中人物起身或坐下的木椅摩擦反馈。 | 待生成 |
| P2 | [SFX_CliffHum](./sfx_cliff_hum/README.md) | 崖边风声中的哼唱 | 西侧露台栏杆 `INT_prop_terrace_railing`（`echo_cliff_song`） | 崖边回响：海风穿过礁石空腔般似有若无的无词女声哼鸣，强化伊芙琳的存在感。 | 待生成 |
| P2 | [SFX_LightSwitch](./sfx_light_switch/README.md) | 早期电灯开关与断线电话 | 书房 `echo_study_lamp`、门厅壁挂电话 `INT_prop_telephone` | 1897 年早期旋钮电灯开关咔哒与微弱电弧声，以及门厅断线壁挂电话听筒拿起与电流底噪。 | 待生成 |

## 场景全部 36 个检视点（`INT_prop_*`）音效绑定速查表

| 区域 | 检视点 ID | 场景物件 | 触发音效资产（含子段） |
|---|---|---|---|
| 室外 `scene_gate` | `INT_prop_gate_plaque` | 铁门铜牌 | `SFX_PickupKey`（金属铭牌指腹轻擦子段）+ `SFX_ClueDiscover_Sting` |
| 门厅 `villa_hall` | `INT_prop_longcase_clock` | 落地钟 | 修钟前：单次轻滴答（`SFX_Clock_Tick_Loop` 单步）；操作谜题：`SFX_Clock_Mechanism`；修钟后：`SFX_Clock_Tick_Loop` + `SFX_Clock_Chime_Thirteen` + `SFX_PickupPaper`（取日志/名单） |
| 门厅 `villa_hall` | `INT_prop_cloak` | 最里侧的旧斗篷 | `SFX_FabricRustle`（厚羊毛摩擦）+ `SFX_ClueDiscover_Sting` |
| 门厅 `villa_hall` | `INT_prop_storage_key_ring` | 储物间钥匙串 | `SFX_PickupKey`（钥匙串取下子段） |
| 门厅 `villa_hall` | `INT_prop_telephone` | 断线壁挂电话 | `SFX_LightSwitch`（听筒摘下 + 断线微弱电流雨声子段） |
| 门厅 `villa_hall` | `INT_prop_signing_table` | 签字桌（遗嘱与怀表） | `SFX_PickupPaper`（翻阅遗嘱 / 蘸水笔签字 / 搁笔子段） |
| 客厅 `villa_parlor` | `INT_prop_family_portrait` | 全家福（剪痕） | `SFX_GlassTap` + `fb_photo`（`SFX_FlashbackSwell` + `SFX_PickupKey` 剪刀子段） |
| 客厅 `villa_parlor` | `INT_prop_motto` | 壁炉石楣箴言刻字 | `SFX_FootstepStone_Set`（干石轻触）+ `SFX_ClueDiscover_Sting` |
| 客厅 `villa_parlor` | `INT_prop_mantel_clock` | 壁炉小座钟（23:47） | `SFX_GlassTap`（玻璃罩）+ `SFX_Clock_Tick_Loop`（高音调轻音量） |
| 客厅 `villa_parlor` | `INT_prop_ship_painting` | 帆船油画正面 | `SFX_PickupPaper`（画框轻移）+ `SFX_ClueDiscover_Sting` |
| 客厅 `villa_parlor` | `INT_prop_ship_painting_back` | 帆船油画背面题字 | `SFX_DrawerOpenClose`（木画框侧掀轻响）+ `SFX_ClueDiscover_Sting` |
| 客厅 `villa_parlor` | `INT_prop_piano` | 立式钢琴 | `SFX_PianoSingleNote`（中央 C4 单音） |
| 一层走廊 `villa_corridor` | `INT_prop_corridor_mirror` | 走廊镜 | `SFX_GlassTap`（镜面微振） |
| 书房 `villa_study` | `INT_prop_tide_table` | 灰港潮汐表 | `SFX_PaperPageTurn` + `SFX_ClueDiscover_Sting` |
| 书房 `villa_study` | `INT_prop_study_desk_drawer` | 书桌最下层抽屉 | `SFX_DrawerOpenClose`（卡顿木抽屉拉开）+ `SFX_PickupKey`（钟钥匙）+ `SFX_PickupPaper`（诊疗副本 / 整理证据） |
| 书房 `villa_study` | `INT_prop_study_hearth` | 壁炉石沿擦痕 | `SFX_FootstepStone_Set`（石面刮擦轻响）+ `fb_fireplace` |
| 书房 `villa_study` | `INT_prop_study_ashes` | 壁炉灰烬残页 | `SFX_MatchCandle`（灰烬拨动与焦纸脆响子段）+ `SFX_PickupPaper` |
| 书房 `villa_study` | `INT_prop_study_rug` | 炉前新地毯 | `SFX_FabricRustle`（厚绒毯边缘掀动） |
| 书房 `villa_study` | `INT_prop_safe` | 四位转盘保险箱 | 未开：`SFX_SafeDial`；开启：`SFX_SafeLatch` + `SFX_PickupPaper`（取账本与保单） |
| 书房 `villa_study` | `INT_prop_phonograph` | 蜡筒留声机 | `SFX_Gramophone_Play`（启停）+ `SFX_Gramophone_Hiss_Loop`（底噪与空转） |
| 书房 `villa_study` | `INT_prop_study_bookshelf` | 航海年鉴书架 | `SFX_PaperPageTurn`（硬壳书脊抽出子段） |
| 书房 `villa_study` | `INT_prop_study_book` | 《航海保险条款》 | `SFX_PaperPageTurn`（翻页） |
| 储物间 `villa_storage` | `INT_prop_luggage` | 未带走的行李箱 | `SFX_DrawerOpenClose`（箱扣打开）+ `SFX_PickupPaper` + `SFX_FabricRustle` |
| 储物间 `villa_storage` | `INT_prop_newspaper_stack` | 旧报纸堆 | `SFX_PickupPaper`（旧报纸翻动）+ `SFX_ClueDiscover_Sting` |
| 储物间 `villa_storage` | `INT_prop_old_items_box` | 旧物箱（裁纸剪） | `SFX_DrawerOpenClose`（木箱）+ `SFX_PickupKey`（裁纸剪金属合拢子段） |
| 储物间 `villa_storage` | `INT_prop_ship_model` | 玻璃罩船模 | `SFX_GlassTap`（玻璃罩轻叩） |
| 餐厅 `villa_dining` | `INT_prop_thirteenth_setting` | 第十三副餐具 | `SFX_DishesClink` + `SFX_ChairMove`（微拉餐椅） |
| 餐厅 `villa_dining` | `INT_prop_shawl` | 椅背灰羊毛披肩 | `SFX_FabricRustle` |
| 餐厅 `villa_dining` | `INT_prop_will_copy` | 桌上遗嘱副本 | `SFX_PickupPaper` + `SFX_PaperPageTurn` |
| 二层走廊 `villa_corridor` | `INT_prop_family_photos` | 走廊银框家族照片 | `SFX_GlassTap`（裂纹相框玻璃轻响） |
| 伊芙琳卧室 `villa_evelyn_room` | `INT_prop_nightstand` | 床头柜（药瓶与日记） | `SFX_GlassTap`（药瓶与干水杯轻碰）+ `SFX_PaperPageTurn`（日记翻页） |
| 伊芙琳卧室 `villa_evelyn_room` | `INT_prop_wardrobe` | 衣柜（外套与铜摆锤） | `SFX_DrawerOpenClose`（大衣柜门）+ `SFX_FabricRustle` + `SFX_PickupKey`（沉重铜摆锤子段） |
| 伊芙琳卧室 `villa_evelyn_room` | `INT_prop_vanity_drawer` | 梳妆台抽屉（蜡筒木盒与旧信） | `SFX_DrawerOpenClose`（抽屉与小木盒盖）+ `SFX_PickupPaper`（旧信） |
| 伊芙琳卧室 `villa_evelyn_room` | `INT_prop_vanity_mirror_back` | 梳妆镜框背面（半张照片） | `SFX_GlassTap` + `SFX_PickupPaper`（硬纸板照片抽出） |
| 浴室 `villa_bathroom` | `INT_prop_medicine_cabinet` | 药柜 | `SFX_DrawerOpenClose`（药柜门）+ `SFX_GlassTap`（棕色药瓶）+ `echo_cold_spot` |
| 浴室 `villa_bathroom` | `INT_prop_towel_rack` | 毛巾架（旧毛巾） | `SFX_FabricRustle` |
| 浴室 `villa_bathroom` | `INT_prop_tile_stain` | 浴缸边地砖缝 | `SFX_FootstepStone_Set`（指尖擦过湿冷瓷砖轻响） |
| 崖边 `villa_cliff` | `INT_prop_terrace_railing` | 露台石栏杆 | `AMB_CliffWindSea_Loop` + `SFX_CliffHum`（`echo_cliff_song`） |
| 崖边 `villa_cliff` | `INT_prop_memorial_stone` | 寡妇崖纪念石 | `AMB_CliffWindSea_Loop` + `fb_cliff`（`SFX_FlashbackSwell` + 远处钟声尾音） |

## 通用规范

- 格式：48 kHz / 24-bit；单声道用于近距离交互音，立体声用于环境、音乐和 UI。
- 响度：环境约 -20 LUFS，音乐 -23～-20 LUFS，一次性音效按峰值控制（见各资产 README）。
- 命名：运行文件使用 PascalCase，源目录使用小写蛇形；资产 ID 稳定不变。
- 授权：每个资产必须在 README 第 5 节记录来源、许可证、商用许可和署名要求。
- 播放：统一由 `AudioManager` 管理，不在各模块重复创建播放器。
