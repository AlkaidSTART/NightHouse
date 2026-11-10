# 午夜别墅 · 资产生成工作区

本目录是 **源资产与生成提示词工作区**，不是直接发布的运行目录。

- 这里存放：生成提示词、源文件（.blend / .fbx / 原始下载）、参考图和验收记录。
- 运行资产：清理优化后导出到 `public/assets/`，由 Vite 随构建发布。
- 运行目录结构见仓库根目录的 `README.md`。

> 说明：`models/`、`animations/`、`textures/`、`audio/` 下每个资产生成一个文件夹；`materials/`、`fx/`、`scenes/` 是实现说明与组合规则，不是单独的生成目标。

## 先读：当前阶段

按照 `docs/` 中的资产清单和 PRD，以下内容仍未确认，**不要提前批量生成**：

1. 故事背景、主角身份和核心真相。
2. 别墅各区域的最终布局、开放顺序和动线。
3. NPC 的具体数量、身份、关系和服装。
4. 关键线索、谜题答案和结局条件。

因此本工作区把资产分成三类状态：

- **待生成**：规格明确，可以直接复制提示词生成。
- **可先生成基础体 / 空白纸张**：形状通用，内容等剧本确认后替换。
- **待剧本确认 / 暂缓**：不要现在生成，等剧情、玩法或关卡冻结后再说。

## 推荐工作流

1. 打开目标资产目录的 `README.md`。
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
- 文字：不在网格上烘焙剧情文字。信件、日记和照片正文通过 UI 或可替换贴图呈现。
- 面数：以 README 中的预算为准；优先保证轮廓和交互可读性，不追求高模。
- 复用：同一门型、窗型、书籍、相框等尽量复用同一模型，不重复生成。
- 授权：外部资源必须记录来源、作者、许可证、商用许可和署名要求。

## 命名规范

| 前缀 | 用途 | 示例 |
|---|---|---|
| `SM_` | 静态模型 | `SM_Furniture_Sofa_01.glb` |
| `SK_` | 骨骼模型 | `SK_NPC_Base_01.glb` |
| `MAT_` | 材质 | `MAT_Wall_OldPlaster` |
| `T_` | 贴图 | `T_Wall_OldPlaster_01_BaseColor.png` |
| `AN_` | 动画 | `AN_NPC_Idle_01.glb` |
| `COL_` | 简化碰撞体 | `COL_Furniture_Sofa_01` |
| `FX_` | 特效 | `FX_DustMotes` |

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

→ [audio/README.md](./audio/README.md)（10 个音频资产，每个子目录一个 README）

### 材质组合

→ [materials/README.md](./materials/README.md)

## 3D / 贴图资产完整清单

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
| P1 | 家具 | [SM_Furniture_Bed_01](./models/furniture/sm_furniture_bed/README.md) | 双人床 | 待生成 |
| P1 | 家具 | [SM_Furniture_Nightstand_01](./models/furniture/sm_furniture_nightstand/README.md) | 床头柜 | 待生成 |
| P1 | 家具 | [SM_Furniture_Wardrobe_01](./models/furniture/sm_furniture_wardrobe/README.md) | 衣柜 | 待生成 |
| P1 | 家具 | [SM_Furniture_StorageCabinet_01](./models/furniture/sm_furniture_storage_cabinet/README.md) | 储物柜 | 待生成 |
| P1 | 家具 | [SM_Furniture_StorageBox_01](./models/furniture/sm_furniture_storage_box/README.md) | 储物木箱 | 待生成 |
| P0 | 道具 | [SM_Prop_BooksSet_01](./models/props/sm_prop_books_set/README.md) | 旧书套装 | 待生成 |
| P0 | 道具 | [SM_Prop_Papers_01](./models/props/sm_prop_papers/README.md) | 散落纸张 | 待生成 |
| P0 | 道具 | [SM_Prop_Diary_01](./models/props/sm_prop_diary/README.md) | 日记本 | 待生成 |
| P0 | 道具 | [SM_Prop_Letter_01](./models/props/sm_prop_letter/README.md) | 信件 / 文件 | 待生成 |
| P0 | 道具 | [SM_Prop_Photo_01](./models/props/sm_prop_photo/README.md) | 照片 | 待生成 |
| P1 | 道具 | [SM_Prop_PhotoFrame_01](./models/props/sm_prop_photo_frame/README.md) | 旧相框 | 待生成 |
| P0 | 道具 | [SM_Prop_Key_01](./models/props/sm_prop_key/README.md) | 钥匙 | 待生成 |
| P1 | 道具 | [SM_Prop_RecordingDevice_01](./models/props/sm_prop_recording_device/README.md) | 录音设备 | 待生成 |
| P1 | 道具 | [SM_Prop_Doormat_01](./models/props/sm_prop_doormat/README.md) | 门垫 | 待生成 |
| P1 | 道具 | [SM_Prop_WallHooks_01](./models/props/sm_prop_wall_hooks/README.md) | 壁挂衣钩 | 待生成 |
| P1 | 道具 | [SM_Prop_Painting_01](./models/props/sm_prop_painting/README.md) | 挂画 | 待生成 |
| P1 | 道具 | [SM_Prop_Rug_01](./models/props/sm_prop_rug/README.md) | 地毯 | 待生成 |
| P1 | 道具 | [SM_Prop_OrnamentSet_01](./models/props/sm_prop_ornament_set/README.md) | 装饰摆件套装 | 待生成 |
| P1 | 道具 | [SM_Prop_OldItemsSet_01](./models/props/sm_prop_old_items_set/README.md) | 旧物套装 | 待生成 |
| P1 | 道具 | [SM_Prop_StoryItem_TBD](./models/props/sm_prop_story_item_tbd/README.md) | 特殊剧情道具（待定） | 待剧本确认 |
| P2 | 道具 | [SM_Prop_Flashlight_TBD](./models/props/sm_prop_flashlight_tbd/README.md) | 手电筒（待定） | 待玩法确认 |
| P1 | 道具 | [SM_Furnishing_Story_TBD](./models/props/sm_furnishing_story_tbd/README.md) | 特殊剧情陈设（待定） | 待剧本确认 |
| P1 | 灯具 | [SM_Light_Chandelier_01](./models/lighting/sm_light_chandelier/README.md) | 吊灯 | 待生成 |
| P0 | 灯具 | [SM_Light_WallLamp_01](./models/lighting/sm_light_wall_lamp/README.md) | 壁灯 | 待生成 |
| P1 | 灯具 | [SM_Light_TableLamp_01](./models/lighting/sm_light_table_lamp/README.md) | 台灯 | 待生成 |
| P1 | 灯具 | [SM_Light_FloorLamp_01](./models/lighting/sm_light_floor_lamp/README.md) | 落地灯 | 待生成 |
| P0 | 角色 | [SK_NPC_Base_01](./models/characters/sk_npc_base/README.md) | NPC 基础人形 | 可先生成基础体 |
| P1 | 角色 | [SK_NPC_Outfit_TBD](./models/characters/sk_npc_outfit_tbd/README.md) | NPC 服装与配饰（待定） | 待剧本确认 |
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
| P1 | 贴图与 2D 内容 | [TEX_Document_PhotoImage](./textures/documents/tex_document_photo_image/README.md) | 照片图像内容（2D 内容） | 待剧本确认 |

## 版本管理

- 本目录的 README、提示词和验收记录建议纳入 Git。
- 原始 `.blend`、`.fbx`、大贴图和音频源文件建议使用 Git LFS 或外部归档，避免仓库膨胀。
- 只把清理后的 GLB 和压缩贴图放进 `public/assets/`，不要把生成工具的临时文件和缓存提交到仓库。
- 每个外部资源都必须在对应 README 的「授权与来源记录」中填写来源和许可证。

## 新资产模板

新增资产时复制 [_templates/ASSET_README_TEMPLATE.md](./_templates/ASSET_README_TEMPLATE.md)，并放到对应分类目录下。
