# 建筑模块

本目录收录「建筑模块」类资产。每个子目录对应一个资产，内含 Blender 工程源文件（`.blend`）、正交三视图图板（`.png`）与规格说明文档。导出的生产环境 `.glb` 存放于 `public/assets/models/architecture/`。

> 完整正交三视图索引与阵容参考见 [三视图参考目录](./references/README.md)。

| 优先级 | 资产 ID | 名称 | 状态 | 规格/尺寸 | 三视图图板 |
|---|---|---|---|---|---|
| P0 | [SM_Arch_WallModule_01](./sm_arch_wall_module/README.md) | 模块化墙体 | ✅ 已建模 | 2.0m × 3.0m × 0.15m | [查看三视图](./references/ref_arch_wall_module_three_views.png) |
| P0 | [SM_Arch_FloorModule_01](./sm_arch_floor_module/README.md) | 模块化地板 | ✅ 已建模 | 2.0m × 0.1m × 2.0m (y=0) | [查看三视图](./references/ref_arch_floor_module_three_views.png) |
| P0 | [SM_Arch_CeilingModule_01](./sm_arch_ceiling_module/README.md) | 模块化天花板 | ✅ 已建模 | 2.0m × 0.1m × 2.0m | [查看三视图](./references/ref_arch_ceiling_module_three_views.png) |
| P0 | [SM_Arch_DoorFrame_01](./sm_arch_door_frame/README.md) | 门框 | ✅ 已建模 | 1.05m × 2.2m × 0.18m | [查看三视图](./references/ref_arch_door_frame_three_views.png) |
| P0 | [SM_Arch_DoorStandard_01](./sm_arch_door_standard/README.md) | 标准房门 | ✅ 已建模 | 0.9m × 2.1m × 0.045m | [查看三视图](./references/ref_arch_door_standard_three_views.png) |
| P1 | [SM_Arch_WindowFrame_01](./sm_arch_window_frame/README.md) | 窗框 | ✅ 已建模 | 1.2m × 1.4m × 0.15m | [查看三视图](./references/ref_arch_window_frame_three_views.png) |
| P1 | [SM_Arch_WindowGlass_01](./sm_arch_window_glass/README.md) | 窗玻璃 | ✅ 已建模 | 1.16m × 1.36m × 0.006m | [查看三视图](./references/ref_arch_window_glass_three_views.png) |
| P2 | [SM_Arch_Skirting_01](./sm_arch_skirting/README.md) | 踢脚线 | ✅ 已建模 | 2.0m × 0.1m × 0.02m | [查看三视图](./references/ref_arch_skirting_three_views.png) |
| P2 | [SM_Arch_Cornice_01](./sm_arch_cornice/README.md) | 天花线脚 | ✅ 已建模 | 2.0m × 0.08m × 0.08m | [查看三视图](./references/ref_arch_cornice_three_views.png) |
| P0 | [SM_Arch_Staircase_01](./sm_arch_staircase/README.md) | 主楼梯与栏杆 | ✅ 已建模 | 1.4m × 3.4m × 4.2m (16阶) | [查看三视图](./references/ref_arch_staircase_three_views.png) |
| P0 | [SM_Arch_Fireplace_01](./sm_arch_fireplace/README.md) | 壁炉与炉台石沿 | ✅ 已建模 | 1.8m × 1.35m × 0.65m | [查看三视图](./references/ref_arch_fireplace_three_views.png) |
| P1 | SM_Arch_TerraceDoor_01 | 露台门 | 待建 | 门框与双开玻璃门 | - |
| P1 | SM_Arch_TerraceRailing_01 | 露台栏杆 | 待建 | 西侧露台防护与望远镜点位 | - |
| P1 | SM_Arch_StoneSteps_01 | 通往崖边的石阶 | 待建 | 崖边石阶梯 | - |
| P1 | SM_Arch_IronGate_01 | 铁艺大门与铜牌 | 待建 | 铜牌刻 ASH CROFT HOUSE | - |
| P1 | SM_Arch_Porch_01 | 门廊与雨棚 | 待建 | 敲门点位 | - |
| P1 | SM_Arch_VillaFacade_01 | 宅邸外立面 | 待建 | 正立面 | - |
| P2 | SM_Arch_GatePier_01 | 门柱 | 待建 | 铁门石柱 | - |
| P2 | SM_Arch_Roof_01 | 陡坡屋顶 | 待建 | 建筑坡顶 | - |
| P2 | SM_Env_Driveway_01 | 湿车辙车道 | 待建（平面 + 材质） | - | - |
| P2 | SM_Env_DeadHedge_01 | 枯死树篱 | 待建（低模或贴图卡片） | - | - |
| P2 | SM_Env_DryFountain_01 | 干涸喷泉 | 待建（低模） | - | - |
| P2 | SM_Arch_Wainscoting_01 | 木护墙板 | 待建（优先用材质变体） | - | - |
| P2 | SM_Arch_Curtain_01 | 窗帘 | 待建（复用模型换材质） | - | - |

新增资产的规格、尺寸与节点要求见 [V1.1 清单](../../../docs/午夜别墅_3D资产与建模清单_v1.1.md) 第 2、3、4、12 节。

**交互节点与交付规范：**
- 楼梯提供平滑倾斜的通行碰撞代理（`COL_Arch_Staircase_01`）；
- 壁炉的石沿、炉膛和可调查区域分开材质与命名，配有盒体碰撞代理；
- 标准房门的原点（Pivot）严格位于左侧合页轴心，开门时直接绕 Y 轴旋转；
- 地板模块顶面高度严格保证位于 `y = 0`，确保玩家第一人称胶囊体高度计算精准。
