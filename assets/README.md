# 午夜别墅 · 资产生成工作区

本目录是 **源资产与生成提示词工作区**，不是直接发布的运行目录。

- 这里存放：生成提示词、源文件（.blend / .fbx / 原始下载）、参考图和验收记录。
- 运行资产：清理优化后导出到 `public/assets/`，由 Vite 随构建发布。
- 运行目录结构见仓库根目录的 `README.md`。

> 说明：`models/`、`animations/`、`textures/`、`audio/` 下按分类建立子目录，每个资产生成一个文件夹；`materials/`、`fx/`、`scenes/` 是实现说明与组合规则，不是单独的生成目标。

## 先读：当前阶段与权威文档

以下文档已经确认，是本工作区的制作依据：

| 文档 | 用途 |
|---|---|
| [故事线文档 V0.7](../docs/午夜别墅_故事线文档_v0.7.md) | 区域、线索 ID、对话节点、谜题、结局条件 |
| [世界观设定 V0.7](../docs/午夜别墅_世界观设定_v0.7.md) | 年代、宅邸、三名 NPC、区域资产映射 |
| [3D 资产与建模清单 V1.1](../docs/午夜别墅_3D资产与建模清单_v1.1.md) | 完整资产表、优先级与缺口 |
| [PRD V1.2](../docs/午夜别墅_PRD_v1.2.md) / [GDD V1.0](../docs/午夜别墅_游戏设计文档_v1.0.md) | 玩法范围、交互与性能目标 |
| 三份结局文档 V0.1 | 签字桌、纪念石、报纸蒙太奇等演出需求 |

已确认：1897 年、Ashcroft House、9 个可玩区域 + 室外抵达段、三名 NPC（亚瑟 / 霍尔太太 / 格雷医生）、21 条线索、2 个核心谜题、3 个结局。

仍未确认，**不要提前批量生成**：

1. 各房间的平面尺寸、门洞位置、楼梯坡度和最终动线（先做灰盒）。
2. 落地钟「第 13 声」的具体演出节奏与镜头。
3. `ending_refused` 弱化变体的触发细节。
4. 结局后的场景状态与最终文本。
5. 设置面板的最终字段。

因此本工作区把资产分成五类状态：

- **待生成**：规格明确，可以直接复制提示词生成。
- **可先生成基础体 / 空白纸张**：形状通用，内容后续替换。
- **待建**：V1.1 新增、尚无资产目录；先按 V1.1 的规格制作，再补 README。
- **暂缓**：保留占位，当前阶段不制作。
- **不制作**：与年代、玩法或 MVP 范围冲突，明确排除。

完整资产 ID、优先级和用途以 [V1.1 清单](../docs/午夜别墅_3D资产与建模清单_v1.1.md) 为准；本文件负责索引与缺口速览。

## 推荐工作流

1. 打开目标资产目录的 `README.md`；尚未建目录的资产先查 V1.1 清单。
2. 复制「英文生成提示词」和「负向提示词」到生成工具。
3. 生成后按「技术规格」在 Blender 中清理：比例、原点、法线、UV、材质槽、面数。
4. 需要碰撞的资产补简化碰撞体，导出 GLB。
5. 放到 README 中写明的「运行路径」。
6. 在 PlayCanvas 场景中加载测试，记录问题。
7. 填写「授权与来源记录」，确认商用和署名要求。
8. 勾选「生成后检查」。

## 全局规格

- 单位：米；Y 轴向上；1 单位 = 1 m。
- 格式：优先 GLB / glTF。
- 坐标：模型正面朝 +Z，除非该资产 README 另有说明。
- 原点：家具和道具一般放在底面中心；门扇放在合页；灯具放在安装点。
- 材质：PBR；不要让生成工具烘焙光照、阴影或环境光遮蔽。
- 文字：不在网格上烘焙剧情文字。信件、日记、报纸和照片正文通过 UI 或可替换贴图呈现。
- 可交互件：必须拆出稳定节点名，例如 `door_hinge`、`safe_dial`、`clock_minute_hand`、`secret_panel`。
- 面数：以 README 中的预算为准；优先保证轮廓和交互可读性，不追求高模。
- 复用：13 把餐椅、13 副餐具、同一门型窗型、书籍和相框必须复用同一模型。
- 授权：外部资源必须记录来源、作者、许可证、商用许可和署名要求。

## 命名规范

| 前缀 | 用途 | 示例 |
|---|---|---|
| `SM_` | 静态模型 | `SM_Prop_LongcaseClock_01.glb` |
| `SK_` | 骨骼模型 | `SK_NPC_Housekeeper_01.glb` |
| `MAT_` | 材质 | `MAT_Wall_OldPlaster` |
| `T_` | 贴图 | `T_Tile_Bathroom_01_BaseColor.png` |
| `TEX_` | 2D 内容 / 文档贴图 | `TEX_Document_TideTable.png` |
| `AN_` | 动画 | `AN_NPC_Sit_01.glb` |
| `COL_` | 简化碰撞体 | `COL_Furniture_StorageBox_01` |
| `FX_` | 特效 | `FX_Rain_01` |

目录名使用英文小写和下划线。已有目录若与修正后的资产 ID 不一致（如 `sm_prop_recording_device`），以 README 内的资产 ID 和运行路径为准，后续迁移目录时同步更新索引。

## 资产索引

### 建筑模块

→ [models/architecture/README.md](./models/architecture/README.md)

### 家具

→ [models/furniture/README.md](./models/furniture/README.md)

### 道具

→ [models/props/README.md](./models/props/README.md)

### 灯具

→ [models/lighting/README.md](./models/lighting/README.md)

### 角色

→ [models/characters/README.md](./models/characters/README.md)

### 动画

→ [animations/README.md](./animations/README.md)

### 贴图与 2D 内容

→ [textures/README.md](./textures/README.md)

### 特效

→ [fx/README.md](./fx/README.md)

### 场景

→ [scenes/README.md](./scenes/README.md)

### 音频

→ [audio/README.md](./audio/README.md)（40 个资产目录，按环境音 / 音效 / 音乐 / 语音分类）

### 材质组合

→ [materials/README.md](./materials/README.md)

## 已有资产目录

下表只列出工作区中已经建立的资产目录；V1.1 新增、尚无目录的资产见「当前缺口」。目录名与修正后 ID 不一致的，以链接后 README 内的资产 ID 为准。

| 优先级 | 分类 | 资产 ID | 名称 | 状态 |
|---|---|---|---|---|
| P0 | 建筑模块 | [SM_Arch_WallModule_01](./models/architecture/sm_arch_wall_module/README.md) | 模块化墙体 | 待生成 |
| P0 | 建筑模块 | [SM_Arch_FloorModule_01](./models/architecture/sm_arch_floor_module/README.md) | 模块化地板 | 待生成 |
| P0 | 建筑模块 | [SM_Arch_CeilingModule_01](./models/architecture/sm_arch_ceiling_module/README.md) | 模块化天花板 | 待生成 |
| P0 | 建筑模块 | [SM_Arch_DoorFrame_01](./models/architecture/sm_arch_door_frame/README.md) | 门框 | 待生成 |
| P0 | 建筑模块 | [SM_Arch_DoorStandard_01](./models/architecture/sm_arch_door_standard/README.md) | 标准房门 | 待生成 |
| P1 | 建筑模块 | [SM_Arch_WindowFrame_01](./models/architecture/sm_arch_window_frame/README.md) | 窗框 | 待生成 |
| P1 | 建筑模块 | [SM_Arch_WindowGlass_01](./models/architecture/sm_arch_window_glass/README.md) | 窗玻璃 | 待生成 |
| P2 | 建筑模块 | [SM_Arch_Skirting_01](./models/architecture/sm_arch_skirting/README.md) | 踢脚线 | 暂缓 |
| P2 | 建筑模块 | [SM_Arch_Cornice_01](./models/architecture/sm_arch_cornice/README.md) | 天花线脚 | 暂缓 |
| P0 | 家具 | [SM_Furniture_Sofa_01](./models/furniture/sm_furniture_sofa/README.md) | 三人沙发 | 待生成 |
| P0 | 家具 | [SM_Furniture_CoffeeTable_01](./models/furniture/sm_furniture_coffee_table/README.md) | 茶几 | 待生成 |
| P0 | 家具 | [SM_Furniture_SideCabinet_01](./models/furniture/sm_furniture_side_cabinet/README.md) | 边柜 | 待生成 |
| P1 | 家具 | [SM_Furniture_EntryCabinet_01](./models/furniture/sm_furniture_entry_cabinet/README.md) | 玄关柜 | 待生成 |
| P0 | 家具 | [SM_Furniture_Desk_01](./models/furniture/sm_furniture_desk/README.md) | 书桌 | 待生成 |
| P0 | 家具 | [SM_Furniture_Chair_01](./models/furniture/sm_furniture_chair/README.md) | 书桌椅 | 待生成 |
| P0 | 家具 | [SM_Furniture_Bookshelf_01](./models/furniture/sm_furniture_bookshelf/README.md) | 书柜 | 待生成 |
| P0 | 家具 | [SM_Furniture_Bed_01](./models/furniture/sm_furniture_bed/README.md) | 双人床 | 待生成 |
| P0 | 家具 | [SM_Furniture_Nightstand_01](./models/furniture/sm_furniture_nightstand/README.md) | 床头柜 | 待生成 |
| P0 | 家具 | [SM_Furniture_Wardrobe_01](./models/furniture/sm_furniture_wardrobe/README.md) | 衣柜 | 待生成 |
| P1 | 家具 | [SM_Furniture_StorageCabinet_01](./models/furniture/sm_furniture_storage_cabinet/README.md) | 储物柜 | 待生成 |
| P1 | 家具 | [SM_Furniture_StorageBox_01](./models/furniture/sm_furniture_storage_box/README.md) | 储物木箱 | 待生成 |
| P0 | 道具 | [SM_Prop_BooksSet_01](./models/props/sm_prop_books_set/README.md) | 旧书套装 | 待生成 |
| P0 | 道具 | [SM_Prop_Papers_01](./models/props/sm_prop_papers/README.md) | 散落纸张 | 待生成 |
| P0 | 道具 | [SM_Prop_Diary_01](./models/props/sm_prop_diary/README.md) | 日记本 | 待生成 |
| P0 | 道具 | [SM_Prop_Letter_01](./models/props/sm_prop_letter/README.md) | 信件 / 文件 | 待生成 |
| P0 | 道具 | [SM_Prop_Photo_01](./models/props/sm_prop_photo/README.md) | 照片 | 待生成 |
| P1 | 道具 | [SM_Prop_PhotoFrame_01](./models/props/sm_prop_photo_frame/README.md) | 旧相框 | 待生成 |
| P0 | 道具 | [SM_Prop_Key_01](./models/props/sm_prop_key/README.md) | 钥匙 | 待生成 |
| P0 | 道具 | [SM_Prop_Phonograph_01](./models/props/sm_prop_recording_device/README.md) | 蜡筒留声机 | 待生成 |
| P1 | 道具 | [SM_Prop_Doormat_01](./models/props/sm_prop_doormat/README.md) | 门垫 | 待生成 |
| P1 | 道具 | [SM_Prop_WallHooks_01](./models/props/sm_prop_wall_hooks/README.md) | 壁挂衣钩 | 待生成 |
| P1 | 道具 | [SM_Prop_Painting_01](./models/props/sm_prop_painting/README.md) | 挂画 | 待生成 |
| P1 | 道具 | [SM_Prop_Rug_01](./models/props/sm_prop_rug/README.md) | 地毯 | 待生成 |
| P1 | 道具 | [SM_Prop_OrnamentSet_01](./models/props/sm_prop_ornament_set/README.md) | 装饰摆件套装 | 待生成 |
| P1 | 道具 | [SM_Prop_OldItemsSet_01](./models/props/sm_prop_old_items_set/README.md) | 旧物套装 | 待生成 |
| P1 | 道具 | [SM_Prop_StoryItem_TBD](./models/props/sm_prop_story_item_tbd/README.md) | 特殊剧情道具（待定） | 暂缓 |
| — | 道具 | [SM_Prop_Flashlight_TBD](./models/props/sm_prop_flashlight_tbd/README.md) | 手电筒 | **不制作**（1897 年宅内用煤气灯与早期电灯） |
| P1 | 道具 | [SM_Furnishing_Story_TBD](./models/props/sm_furnishing_story_tbd/README.md) | 特殊剧情陈设（待定） | 暂缓 |
| P0 | 灯具 | [SM_Light_Chandelier_01](./models/lighting/sm_light_chandelier/README.md) | 吊灯 | 待生成 |
| P0 | 灯具 | [SM_Light_WallLamp_01](./models/lighting/sm_light_wall_lamp/README.md) | 壁灯 | 待生成 |
| P1 | 灯具 | [SM_Light_TableLamp_01](./models/lighting/sm_light_table_lamp/README.md) | 台灯 | 待生成 |
| P1 | 灯具 | [SM_Light_FloorLamp_01](./models/lighting/sm_light_floor_lamp/README.md) | 落地灯 | 待生成 |
| P0 | 角色 | [SK_NPC_Base_01](./models/characters/sk_npc_base/README.md) | NPC 绑定母版 | 可先生成基础体 |
| P0 | 角色 | [SK_NPC_Outfit_TBD](./models/characters/sk_npc_outfit_tbd/README.md) | 三名 NPC 服装与配饰 | 待生成 |
| P0 | 动画 | [AN_NPC_Idle_01](./animations/an_npc_idle/README.md) | NPC 待机动画 | 待生成 |
| P1 | 动画 | [AN_NPC_Walk_01](./animations/an_npc_walk/README.md) | NPC 行走动画 | 待生成 |
| P1 | 动画 | [AN_NPC_TalkGesture_01](./animations/an_npc_talk_gesture/README.md) | NPC 对话手势 | 待生成 |
| P2 | 动画 | [AN_NPC_Face_TBD](./animations/an_npc_face_tbd/README.md) | NPC 面部动画（待定） | 暂缓 |
| P0 | 贴图与 2D 内容 | [T_Wall_OldPlaster_01](./textures/t_wall_old_plaster/README.md) | 旧灰泥墙面贴图 | 待生成 |
| P0 | 贴图与 2D 内容 | [T_Floor_WoodWorn_01](./textures/t_floor_wood_worn/README.md) | 旧木地板贴图 | 待生成 |
| P1 | 贴图与 2D 内容 | [T_Fabric_Worn_01](./textures/t_fabric_worn/README.md) | 旧布料贴图 | 待生成 |
| P2 | 贴图与 2D 内容 | [T_Grime_DustWear_Set_01](./textures/t_grime_dust_wear_set/README.md) | 灰尘 / 污渍 / 磨损叠加贴图 | 暂缓 |
| P0 | 贴图与 2D 内容 | [TEX_Document_LetterPage](./textures/documents/tex_document_letter_page/README.md) | 信件页面（2D 内容） | 可先生成空白纸张 |
| P0 | 贴图与 2D 内容 | [TEX_Document_DiaryPage](./textures/documents/tex_document_diary_page/README.md) | 日记内页（2D 内容） | 可先生成空白纸张 |
| P1 | 贴图与 2D 内容 | [TEX_Document_PhotoImage](./textures/documents/tex_document_photo_image/README.md) | 照片图像内容（2D 内容） | 待生成 |

## 当前缺口

按 V1.1 优先级整理。P0 是搭建与核心交互的阻断项，先做；P1 服务氛围与叙事；P2 可延期。

### P0 · 阻断项

| 类别 | 资产 ID | 用途 |
|---|---|---|
| 建筑 | `SM_Arch_Staircase_01` | 门厅到二楼走廊的主楼梯与栏杆 |
| 建筑 | `SM_Arch_Fireplace_01` | 客厅壁炉；书房石沿是死亡现场 |
| 道具 | `SM_Prop_LongcaseClock_01` | 核心谜题；钟门、指针、钟摆、暗格需拆节点 |
| 道具 | `SM_Prop_ClockPendulum_01` | 可拾取；从卧室衣柜装回钟摆杆 |
| 道具 | `SM_Prop_ClockKey_01` | 书房抽屉取得的上弦钥匙 |
| 道具 | `SM_Prop_FamilyPortrait_01` | 客厅壁炉上方；伊芙琳被剪掉 |
| 道具 | `SM_Prop_ShipPainting_01` | 正面船名、背面日期；需可侧看 |
| 道具 | `SM_Prop_MantelClock_01` | 显示 23:47，作为校时参照 |
| 家具 | `SM_Furniture_Safe_01` | 密码 `0314`；转盘与箱门可操作 |
| 道具 | `SM_Prop_TideTable_01` | 书房挂墙；11 月 13 日满潮被圈出 |
| 道具 | `SM_Prop_WaxCylinder_01` | 卧室梳妆台取得，回书房播放 |
| 家具 | `SM_Furniture_Vanity_01` | 卧室梳妆台；抽屉放蜡筒木盒 |
| 道具 | `SM_Prop_VanityMirror_01` | 镜框背面藏半张照片 |
| 角色 | `SK_NPC_Arthur_01` / `SK_NPC_Housekeeper_01` / `SK_NPC_Grey_01` | 三名已确认 NPC |
| 2D | `TEX_Document_Will` / `TideTable` / `MedicalRecord` / `ShippingLedger` / `InsurancePolicy` / `CaptainsLog` / `CrewNames` / `ShipPainting` / `FamilyPortrait` | 关键书证，通过 UI 阅读 |

### P1 · 叙事与氛围

| 类别 | 资产 ID | 用途 |
|---|---|---|
| 建筑 | `SM_Arch_TerraceDoor_01` / `TerraceRailing_01` / `StoneSteps_01` | 西侧露台与崖边动线 |
| 室外 | `SM_Arch_IronGate_01` / `GatePier_01` / `Porch_01` / `VillaFacade_01` | B0 抵达段，从铁门到敲门 |
| 室外 | `SM_Light_PorchLantern_01` / `FX_Rain_01` / `FX_Fog_01` | 雨夜门廊与海雾 |
| 家具 | `SM_Furniture_Armchair_01` | 壁炉旁座位层次 |
| 家具 | `SM_Furniture_DiningTable_01` / `DiningChair_01` | 长餐桌与复用 13 把餐椅 |
| 家具 | `SM_Furniture_Bathtub_01` | 独立式铸铁浴缸 |
| 道具 | `SM_Prop_InkwellPen_01` | 午夜签字；动作即选择 |
| 道具 | `SM_Prop_DinnerwareSet_01` / `Candelabra_01` / `Shawl_01` | 13 副餐具、第 13 把椅背披肩 |
| 道具 | `SM_Prop_WallMirror_01` | 走廊镜；可与浴室镜共用 |
| 道具 | `SM_Prop_BurnedPages_01` / `Ledger_01` / `CaptainsLog_01` / `OldLetters_01` | 书房与钟座暗格的书证载体 |
| 道具 | `SM_Prop_JewelryBox_01` / `WoolCoat_01` / `MedicineBottle_01` | 卧室生活痕迹与摆锤线索 |
| 道具 | `SM_Prop_MedicineCabinet_01` / `TowelRack_01` / `BloodTrace_Decal_01` | 浴室证据链 |
| 道具 | `SM_Prop_Luggage_01` / `NewspaperStack_01` / `Scissors_01` / `ShipModel_01` | 储物间线索与呼应 |
| 道具 | `SM_Prop_MemorialStone_01` | 崖边纪念石；隐藏结局追加船员名字 |
| 贴图 | `T_Tile_Bathroom_01` | 小规格瓷砖 |
| 动画 | `AN_NPC_Sit_01` | 餐厅残席、书房对质 |
| 2D | `TEX_Document_Newspaper` / `CutPhoto` / `OldLetters` / `TEX_MemorialStone_Inscription` | 报纸、半张照片、旧信、碑文 |

### P2 · 细节与可选

`SM_Arch_Wainscoting_01`、`SM_Arch_Curtain_01`、`SM_Arch_Roof_01`、`SM_Env_Driveway_01`、`SM_Env_DeadHedge_01`、`SM_Env_DryFountain_01`、`SM_Prop_Bust_01`、`SM_Prop_MusicBox_01`、`SM_Prop_WineSet_01`、`SM_Prop_NauticalInstruments_01`、`SM_Prop_WashBasin_01`、`SM_Prop_Telephone_01`、`FX_SeaSpray_01`、`SK_Player_Hands_01`、`AN_NPC_HandOver_01`、`AN_NPC_Examine_01`、`TEX_Document_WaxCylinderLabel`。

### 2D 内容缺口

`assets/textures/documents/` 目前只有信件、日记、照片三项，需要补齐：

| 优先级 | 2D 资产 ID | 对应线索 |
|---|---|---|
| P0 | `TEX_Document_Will` | `clue_will_clause` |
| P0 | `TEX_Document_TideTable` | `clue_tide_table` |
| P0 | `TEX_Document_MedicalRecord` | `clue_medical_record` |
| P0 | `TEX_Document_ShippingLedger` | `clue_shipping_ledger` |
| P0 | `TEX_Document_InsurancePolicy` | `clue_insurance_policy` |
| P0 | `TEX_Document_CaptainsLog` | `clue_captains_log` |
| P0 | `TEX_Document_CrewNames` | `clue_crew_names` |
| P0 | `TEX_Document_ShipPainting` | `clue_ship_painting`（正 / 背面两张） |
| P0 | `TEX_Document_FamilyPortrait` | `clue_family_photo` |
| P1 | `TEX_Document_Newspaper` | `clue_newspaper` |
| P1 | `TEX_Document_CutPhoto` | `clue_family_photo` |
| P1 | `TEX_Document_OldLetters` | `clue_evelyn_old_letters` |
| P1 | `TEX_MemorialStone_Inscription` | 结局演出 |
| P2 | `TEX_Document_WaxCylinderLabel` | `clue_gramophone_cylinder` |

## 已知偏差修正

| 项目 | 旧状态 | 现状态 |
|---|---|---|
| 故事与角色 | README 称背景、NPC、线索、结局「仍未确认」 | 已由 V0.7 确认；仅平面尺寸、钟声演出、弱化结局等细节待定 |
| 录音设备 | 现代卡带录音机 | 1897 年蜡筒留声机 `SM_Prop_Phonograph_01` + 可携带蜡筒 |
| 手电筒 | P2「待玩法确认」 | 不制作；年代不符，宅内以煤气灯和早期电灯为主 |
| NPC | 1.75 m 中性体 + 服装待定 | 三名已确认角色（1.80 / 1.58 / 1.72 m）；基础体为绑定母版 |
| 卧室家具 | P1 | 床、床头柜、衣柜上调为 P0 |
| 吊灯 | P1 | 上调为 P0；门厅、客厅、餐厅主光 |
| 音频数量 | 40 个 | 40 个，已核对一致 |
| 通用道具 | 挂画、照片、相框、钥匙只有通用件 | 保留通用件，新增帆船油画、全家福、半张照片、钟钥匙等剧情变体 |
| 特殊占位 | `SM_Prop_StoryItem_TBD` 等作为 MVP 依赖 | 剧本已给出具体物件；占位资产仅留给扩展内容 |
| 2D 内容 | 只有信件、日记、照片 | 补齐遗嘱、潮汐表、诊疗记录、账本、保单、船长日志、船员名单、报纸、油画、全家福等 14 项 |
| 目录结构 | 推荐 `assets/source/` | 实际为 `assets/`（源与提示词）+ `public/assets/`（运行资产） |
| 区域范围 | 7 个泛化区域 | 9 个可玩区域 + 室外抵达段 B0，按资源组加载 |

## 版本管理

- 本目录的 README、提示词和验收记录建议纳入 Git。
- 原始 `.blend`、`.fbx`、大贴图和音频源文件建议使用 Git LFS 或外部归档，避免仓库膨胀。
- 只把清理后的 GLB 和压缩贴图放进 `public/assets/`，不要把生成工具的临时文件和缓存提交到仓库。
- 每个外部资源都必须在对应 README 的「授权与来源记录」中填写来源和许可证。

## 新资产模板

新增资产时复制 [_templates/ASSET_README_TEMPLATE.md](./_templates/ASSET_README_TEMPLATE.md)，并放到对应分类目录下。新建目录前先确认该资产已在 V1.1 清单中登记。
