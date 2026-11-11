# 午夜别墅 · 建筑模块（Architecture）三视图与技术参考目录

本目录存放《午夜别墅》室内建筑构件与核心空间结构的正交三视图参考图板与阵容图，依据 [《3D 资产与建模清单 V1.1》](../../../../docs/午夜别墅_3D资产与建模清单_v1.1.md) §2、§4、§8 与各构件规格技术要求整理。

## 1. 建筑模块三视图索引

| 资产 ID | 中文名称 | 级别 | 真实尺寸 (宽×高×深) | 原点与朝向 | 碰撞代理 | 三视图文件 |
|---|---|---|---|---|---|---|
| `SM_Arch_WallModule_01` | 模块化墙体 | **P0** | 2.0m × 3.0m × 0.15m | 底面中心 (0, 0, 0)；墙面向 +Z | 盒体碰撞代理 | [`ref_arch_wall_module_three_views.png`](./ref_arch_wall_module_three_views.png) |
| `SM_Arch_FloorModule_01` | 模块化地板 | **P0** | 2.0m × 0.1m × 2.0m | 顶面中心 (0, 0, 0)；顶面位于 y = 0 | 盒体碰撞代理 | [`ref_arch_floor_module_three_views.png`](./ref_arch_floor_module_three_views.png) |
| `SM_Arch_CeilingModule_01` | 模块化天花板 | **P0** | 2.0m × 0.1m × 2.0m | 底面中心 (0, 0, 0)；底面位于 y = 0，朝下 | 视线阻挡代理 | [`ref_arch_ceiling_module_three_views.png`](./ref_arch_ceiling_module_three_views.png) |
| `SM_Arch_DoorFrame_01` | 门框 | **P0** | 1.05m × 2.2m × 0.18m (内净宽0.9m×2.1m) | 底面中心 (0, 0, 0)；门洞朝向 +Z | 盒体碰撞代理 | [`ref_arch_door_frame_three_views.png`](./ref_arch_door_frame_three_views.png) |
| `SM_Arch_DoorStandard_01` | 标准房门 | **P0** | 0.9m × 2.1m × 0.045m | 合页边缘轴心 (0, 0, 0)；面向 +Z | 盒体碰撞代理 | [`ref_arch_door_standard_three_views.png`](./ref_arch_door_standard_three_views.png) |
| `SM_Arch_WindowFrame_01` | 窗框 | **P1** | 1.2m × 1.4m × 0.15m | 底面中心 (0, 0, 0)；窗面朝向 +Z | 盒体碰撞代理 | [`ref_arch_window_frame_three_views.png`](./ref_arch_window_frame_three_views.png) |
| `SM_Arch_WindowGlass_01` | 窗玻璃 | **P1** | 1.16m × 1.36m × 0.006m | 中心 (0, 0, 0)；面向 +Z | 无碰撞体 | [`ref_arch_window_glass_three_views.png`](./ref_arch_window_glass_three_views.png) |
| `SM_Arch_Skirting_01` | 踢脚线 | **P2** | 2.0m × 0.1m × 0.02m | 底面中心 (0, 0, 0)；沿 +X 延伸 | 无碰撞体 | [`ref_arch_skirting_three_views.png`](./ref_arch_skirting_three_views.png) |
| `SM_Arch_Cornice_01` | 天花线脚 | **P2** | 2.0m × 0.08m × 0.08m | 底面中心 (0, 0, 0)；沿 +X 延伸 | 无碰撞体 | [`ref_arch_cornice_three_views.png`](./ref_arch_cornice_three_views.png) |
| `SM_Arch_Staircase_01` | 主楼梯与栏杆 | **P0** | 1.4m × 3.4m × 4.2m (16阶) | 起步踏面中心 (0, 0, 0)；沿 +Y 延伸 | 斜坡通行代理 | [`ref_arch_staircase_three_views.png`](./ref_arch_staircase_three_views.png) |
| `SM_Arch_Fireplace_01` | 壁炉与炉台石沿 | **P0** | 1.8m × 1.35m × 0.65m | 底面中心 (0, 0, 0)；炉膛朝向 +Y | 盒体碰撞代理 | [`ref_arch_fireplace_three_views.png`](./ref_arch_fireplace_three_views.png) |

## 2. 建筑模块全局比例阵容图 (Lineup)

展示所有核心建筑模块与 1.75m 人体比例胶囊在统一影棚环境下的比例对齐：

![建筑模块全局阵容图](./ref_arch_modules_lineup.png)

## 3. 建模工具与管线

- 建模自动化脚本：[`tools/blender/build_architecture.py`](../../../../tools/blender/build_architecture.py)
- 三视图合成工具：[`tools/blender/generate_three_views_sheets.py`](../../../../tools/blender/generate_three_views_sheets.py)
- 运行产物位置：[`public/assets/models/architecture/`](../../../../public/assets/models/architecture/)
- Blender 工程源文件：`assets/models/architecture/sm_arch_*/`
