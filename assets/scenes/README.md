# 场景文档

当前可运行场景为 `villa_greybox`：按《场景建模方案 V0.2》搭建的全宅灰盒，覆盖下方全部区域。场景数据在 `src/content/scenes/villaGreybox.ts`，由 `src/game/scene/SceneManager.ts` 搭成基础几何体。

## 当前灰盒布局

- 平面、尺寸与坐标约定：见 [场景建模方案 V0.2](../../docs/午夜别墅_场景建模方案_v0.2.md) §2。
- 建筑三视图、四向立面、平面蓝图与环境参考图：见 [references/README.md](./references/README.md)。
- 玩家起点：`SPAWN_gate_start`，铁门外 `(0, 0, 38.5)`，面向 -Z。
- 层高 3.4 m；主楼梯的碰撞是两段斜坡加一个平台。
- 门：9 扇可开关的门（其中 6 扇带剧情解锁条件）+ 3 扇永久锁闭的装饰门。
- 摆放点：`INT_` 交互点、`NPC_` 站位、`DOOR_`、`LIGHT_`、`SPAWN_`，后续由 Blender 区域 GLB 中的同名空物体提供位置。
- 灯光：每个区域 1–3 盏不投影的点光 + 一盏月光方向光，仅用于看清空间。
- 灰盒阶段所有区域一次性搭建；按区域分组加载等正式 GLB 接入时再做。
- GLB 导出与运行时加载：`npm run export:glb` 可将 `villaGreybox.ts` 导出为基础灰盒 GLB，Blender 精模工程保存在 `assets/scenes/scene_villa_full.blend` 并导出为 `public/assets/scenes/scene_villa_full.glb`（贴图内嵌，包含护墙板线脚、雕花立柱栏杆、坡屋顶与烟囱、镶板门扇、铁艺大门、八角喷泉、长壳落地钟、书架藏书、留声机、保险箱、壁炉等精细几何）。节点按 §4.2 命名：`GEO` 下是场景物体，`DOORS` 下每扇门是「合页 pivot + `_leaf` 门扇 + `_anchor` 锚点」，另有 `INT_` / `NPC_` / `SPAWN_` / `LIGHT_` / `COL_` 空物体；区域与可行走面写在根节点 extras。材质与贴图配置与运行时共用 `src/content/scenes/sceneMaterials.ts`。运行时由 `SceneManager.loadModel`（`src/game/scene/SceneModelLoader.ts`）异步加载该 GLB，成功后替换代码生成的方盒与门扇并释放过程化网格/材质/贴图，失败或取消时自动回退至代码灰盒并清理容器资源。
- 外立面按 [三视图](./references/ref_villa_three_views.jpg) 与 [四向立面](./references/ref_villa_four_elevations.jpg) 精修：`mass_roof` 改为 40° 陡坡四坡顶（脊高 9.45 m）加南 / 西 / 东三处交叉山墙与 3 个老虎窗；`roof_chimneys` 含西立面客厅外烟囱等 5 组烟囱；南立面为通长柱廊（`veranda_*`，入口两柱沿用 `porch_pillar_*`，山花沿用 `porch_roof`）；外墙朝外面改用 `MAT_stone`，另有 `facade_trim`（窗套、窗棂、腰线、檐口、勒脚、隅石、门套与壁灯）、`facade_windows_glass`（新增侧 / 后立面窗，二层侧窗与后立面为暗窗）、`ceiling_attic_2f`（二层吊顶）。碰撞仍由 `villaGreybox.ts` 的方盒提供：柱廊栏杆与柱列对应 4 个不可见边界盒 `veranda_bound_*`（GLB 中为同名 `COL_` 空物体），入口两柱之间留空，其余屋顶、线脚等装饰件不参与碰撞。
- 周边环境按 [抵达段](./references/ref_env_gate_driveway.jpg)、[西侧露台与崖边](./references/ref_env_west_terrace_cliff.jpg)、[全宅鸟瞰](./references/ref_env_estate_coastal_aerial.jpg) 建模，全部为纯视觉物体（`collide: false`），只放在玩家走不到的区域，或包在已有碰撞盒内：
  - `env_terrain`：可玩地面外围的起伏丘陵、门外道路走廊和西侧约 11 m 断崖（陡坡面自动用 `MAT_stone`）。可玩矩形内压在 `ground` 方盒下，不影响行走。
  - `env_sea_far` / `env_far_land`：远景海面与外圈陆地。
  - `gate_pier_*`：带门灯的石门柱。铜牌放在东门柱外侧，与 `INT_prop_gate_plaque` 同位。
  - `env_fence_outer`：树篱外的铁栅栏与石柱。
  - `hedge_*`：枯树篱，向外鼓出，内侧贴碰撞面。
  - `env_driveway_detail`：路缘石、湿车辙、积水和门外道路。
  - `fountain`：干涸的三层八角喷泉。
  - `env_trees_bare` / `env_forest_pines` / `env_pines_windswept`：枯树、丘陵松林、崖边被海风吹斜的松树。
  - `env_cliff_terrace`：露台挡土墙、石阶侧墙、平台碎石。
  - `cliff_memorial_stone`：圆拱碑身，碑面朝东。
  - `env_sea_rocks`：海蚀柱与崖脚礁石。
- 室内按 [室内光影分区参考](./references/ref_env_interior_lighting.jpg) 与《3D 资产与建模清单 V1.1》补齐，均为纯视觉物体：
  - `light_fixtures`：灯具模型（光源仍由 `LIGHT_` 数据驱动）。包括走廊一、二层与门厅回廊的壁灯、客厅与浴室壁灯、门厅楼梯口壁灯、客厅与餐厅吊灯、储物间吊灯泡、露台门外壁灯。
  - `interior_wainscot`：门厅、一层与二层走廊的木护墙板，在门洞处断开。
  - `interior_rugs`：走廊长地毯、门厅 / 客厅 / 卧室地毯，门垫放在门廊上避开门扇。
  - `interior_paintings`：通用深色油画，不承载剧情。
  - `evelyn_room_dressing`：四柱床架与床幔；床头柜上的日记、镇静剂药瓶、空水杯；梳妆台首饰盒。
  - `bathroom_tub`：改为爪足浴缸，保留名称与碰撞。
  - `bathroom_dressing`：毛巾、地砖暗痕。
  - `study_dressing`：壁炉镜、烛台、桌面文件、书和墨水瓶。
  - `hall_dressing`：挂钩上的储物间钥匙串。
  - `storage_dressing`：行李箱上的裁纸剪。
  - `dining_dressing`：桌尾残席的酒瓶与酒杯。
- 藏在容器内、需要开合才看到的剧情件（保险箱内账本、钟座暗格、抽屉蜡筒盒、衣柜摆锤、药柜药瓶）尚未建模，需等交互系统确定开合方式后再做。
- 第四轮按效果图（鸟瞰、大门、室内光影）调整，允许偏离平面蓝图：
  - **屋顶**：`mass_roof` 改为有屋脊的陡坡四坡顶（约 32°，脊高约 11.7 m，高于立面图标注的 9.4 m），南 / 西 / 东交叉山墙，南坡两个亮灯老虎窗；烟囱相应加高。
  - **前院布局（数据已改）**：`villaGreybox.ts` 里树篱从 x = ±6 外移到 x = ±12，新增 `hedge_return_*` 接到柱廊前栏，`gate_fence_*` 加长到 x = ±12。车道改为「大门直道 + 喷泉环形广场」（`floor_driveway`），其余为草坪，喷泉周围是草地环岛。平面蓝图 `ref_villa_floorplan_1f_2f.png` 里的「30 m 直车道」已不再准确。
  - **室内**：`interior_wainscot_rooms`（客厅、餐厅、书房、卧室护墙板）、`interior_ceiling_beams`（各房间天花木梁）。
  - **夜景氛围**：`src/game/scene/NightSky.ts` 在运行时生成天穹、云、月亮与月晕，并开启指数雾；月光强度 0.45 → 0.6。雨和浪花仍未做。
  - **台基与门廊台阶（数据已改）**：宅邸坐在 0.75 m 台基上，前院整体下沉到 y = -0.75（`YARD`）。行走面拆成 `ground`（宅邸、柱廊、露台，y = 0）、`yard`（前院）和 `porch_steps`（门廊前斜面）；台基落差超过 `MAX_DROP` / `STEP_UP`，只能经台阶上下。出生点、铁门、门柱、栅栏、树篱、喷泉、铜牌交互点和门灯都随前院下移。新增 `ground_yard`、`porch_step0–3`、`porch_steps_wall_*`（台阶侧挡墙，有碰撞）和纯视觉的 `porch_plinth`（台基立面）。旧存档若停在前院，会因高度不符回到出生点。
  - **未做**：门厅直跑楼梯（东墙有餐厅门，直跑放不下，保持 U 形）。
- 参考图说明里铜牌在「左侧门柱」，但交互数据在东侧（从门外看是右侧）门柱，模型以数据为准，待确认。
- 平面图 [ref_villa_floorplan_1f_2f.png](./references/ref_villa_floorplan_1f_2f.png) 与灰盒墙体、门位叠图核对一致，导出的 GLB 也已按同一方法核对。

## 正式场景区域（已确认）

故事线 V0.7 已确认 9 个可玩区域 + 室外抵达段，灰盒和资产归属按此对齐：

| 区域 ID | 名称 | 主要资产 / 交互 |
|---|---|---|
| `scene_gate` | 室外抵达段 B0 | 铁门与铜牌、车道、门廊、外立面、雨雾 |
| `villa_hall` | 门厅 / 大厅 | 落地钟、钟摆、大楼梯、吊灯、签字桌、挂钩钥匙串 |
| `villa_parlor` | 客厅 | 壁炉、全家福、帆船油画、座钟、沙发、边柜 |
| `villa_corridor` | 走廊与二楼 | 壁灯、走廊镜、家族照片、楼梯栏杆 |
| `villa_dining` | 餐厅（B2 后开放） | 长桌、13 把餐椅、13 副餐具、披肩、烛台 |
| `villa_study` | 书房 | 书桌、保险箱、留声机、潮汐表、壁炉、烧焦账页 |
| `villa_evelyn_room` | 伊芙琳卧室（霍尔太太信任后开放） | 床、衣柜、梳妆台、蜡筒、日记、药瓶 |
| `villa_bathroom` | 浴室（B4 后开放） | 浴缸、药柜、毛巾架、地砖痕迹 |
| `villa_storage` | 储物间（取得钥匙串后开放） | 行李箱、报纸堆、剪刀、船模 |
| `villa_cliff` | 西侧露台 / 崖边 | 露台门、栏杆、石阶、纪念石、海雾 |

## 正式场景需要补充

1. 逐区域确认平面尺寸、墙体模块网格和门洞位置（先灰盒）。
2. 确认玩家主路线、视线引导和区域解锁顺序。
3. 确认每个区域加载哪些模型、贴图、音频和灯光。
4. 确认碰撞体代理和不可通行边界。
5. 确认性能预算：同屏面数、材质槽数量、实时光源数量、贴图显存。

## 场景资源分组

| 分组 | 内容 | 加载时机 |
|---|---|---|
| core | 启动必需资源、UI、基础音效 | 进入游戏 |
| common | 常用材质、交互提示、通用道具 | 进入游戏 |
| scene_gate | 铁门、门廊、外立面、车道、雨雾 | 进入 B0 |
| scene_hall | 门厅、落地钟、楼梯、吊灯 | 进入门厅 |
| scene_parlor | 客厅家具、壁炉、全家福、帆船油画 | 进入客厅 |
| scene_corridor | 走廊、二楼、壁灯、镜子 | 进入走廊 |
| scene_dining | 餐厅长桌、餐椅、餐具 | 餐厅开放 |
| scene_study | 书房、保险箱、留声机、潮汐表 | 进入书房 |
| scene_evelyn_room | 卧室家具、梳妆台、蜡筒、日记 | 卧室开放 |
| scene_bathroom | 浴缸、药柜、毛巾架、瓷砖 | 浴室开放 |
| scene_storage | 储物柜、行李箱、报纸、船模 | 储物间开放 |
| scene_cliff | 露台、栏杆、石阶、纪念石、海雾 | 进入崖边 |
| npc_* | NPC 模型与动画 | 首次出现 |
| story_* | 特定剧情资产 | 剧情触发 |

区域 ID 与故事线的 `villa_*` 命名一致；加载组按区域拆分，避免一次性加载全部资源。

