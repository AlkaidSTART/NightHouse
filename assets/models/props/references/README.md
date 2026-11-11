# 午夜别墅 · 核心线索与解谜道具（Props）三视图与技术参考目录

本目录存放《午夜别墅》关键解谜机关、证物道具与调查物件的正交三视图参考图板与全景阵容图，依据 [《3D 资产与建模清单 V1.1》](../../../../docs/午夜别墅_3D资产与建模清单_v1.1.md) §4–§13 与线索映射规范整理。

## 1. 核心道具三视图索引

| 资产 ID | 中文名称 | 级别 | 真实尺寸 (宽×深×高) | 原点与朝向 | 碰撞代理 | 三视图文件 |
|---|---|---|---|---|---|---|
| `SM_Prop_LongcaseClock_01` | 落地大座钟 | **P0** | 0.52m × 0.32m × 2.15m | 底面中心 (0, 0, 0)；钟面朝 +Y | 盒体碰撞代理 | [`ref_prop_longcase_clock_three_views.png`](./ref_prop_longcase_clock_three_views.png) |
| `SM_Prop_ClockPendulum_01` | 钟摆锤 | **P0** | 0.14m × 0.04m × 0.65m | 顶部挂钩中心 (0, 0, 0) | 盒体碰撞代理 | [`ref_prop_clock_pendulum_three_views.png`](./ref_prop_clock_pendulum_three_views.png) |
| `SM_Prop_ClockKey_01` | 落地钟上弦钥匙 | **P0** | 0.05m × 0.022m × 0.005m | 顶端手柄中心 (0, 0, 0) | 盒体碰撞代理 | [`ref_prop_clock_key_three_views.png`](./ref_prop_clock_key_three_views.png) |
| `SM_Prop_Key_01` | 黄铜门钥匙 | **P0** | 0.07m × 0.025m × 0.004m | 钥匙环中心 (0, 0, 0)；齿朝 +X | 盒体碰撞代理 | [`ref_prop_key_three_views.png`](./ref_prop_key_three_views.png) |
| `SM_Prop_Diary_01` | 伊芙琳日记本 | **P0** | 0.16m × 0.22m × 0.035m | 底面中心 (0, 0, 0)；书脊朝 -X | 盒体碰撞代理 | [`ref_prop_diary_three_views.png`](./ref_prop_diary_three_views.png) |
| `SM_Prop_Phonograph_01` | 蜡筒留声机 | **P0** | 0.35m × 0.30m × 0.45m | 底面中心 (0, 0, 0)；号角朝 +Y | 盒体碰撞代理 | [`ref_prop_recording_device_three_views.png`](./ref_prop_recording_device_three_views.png) |
| `SM_Prop_WaxCylinder_01` | 蜡筒与储存木盒 | **P0** | 0.08m × 0.08m × 0.13m (盒) | 底面中心 (0, 0, 0) | 盒体碰撞代理 | [`ref_prop_wax_cylinder_three_views.png`](./ref_prop_wax_cylinder_three_views.png) |
| `SM_Prop_BooksSet_01` | 旧书套装 | **P0** | 0.24m × 0.18m × 0.12m | 底面中心 (0, 0, 0) | 盒体碰撞代理 | [`ref_prop_books_set_three_views.png`](./ref_prop_books_set_three_views.png) |
| `SM_Prop_Papers_01` | 散落纸张/诊疗单 | **P0** | 0.21m × 0.297m × 0.012m | 底面中心 (0, 0, 0) | 盒体碰撞代理 | [`ref_prop_papers_three_views.png`](./ref_prop_papers_three_views.png) |
| `SM_Prop_Letter_01` | 信件与火漆信封 | **P0** | 0.16m × 0.11m × 0.008m | 底面中心 (0, 0, 0) | 盒体碰撞代理 | [`ref_prop_letter_three_views.png`](./ref_prop_letter_three_views.png) |
| `SM_Prop_PhotoFrame_01` | 旧相框与照片 | **P1** | 0.18m × 0.24m × 0.04m | 底面中心 (0, 0, 0)；照片朝 +Y | 盒体碰撞代理 | [`ref_prop_photo_frame_three_views.png`](./ref_prop_photo_frame_three_views.png) |
| `SM_Prop_MantelClock_01` | 客厅小座钟 (23:47) | **P0** | 0.28m × 0.12m × 0.20m | 底面中心 (0, 0, 0)；钟面朝 +Y | 盒体碰撞代理 | [`ref_prop_mantel_clock_three_views.png`](./ref_prop_mantel_clock_three_views.png) |
| `SM_Prop_TideTable_01` | 潮汐时刻表挂牌 | **P0** | 0.30m × 0.42m × 0.02m | 底面中心 (0, 0, 0)；图表面向 +Y | 盒体碰撞代理 | [`ref_prop_tide_table_three_views.png`](./ref_prop_tide_table_three_views.png) |
| `SM_Prop_VanityMirror_01` | 梳妆台旋转镜 | **P0** | 0.35m × 0.15m × 0.45m | 底面中心 (0, 0, 0)；镜面向 +Y | 盒体碰撞代理 | [`ref_prop_vanity_mirror_three_views.png`](./ref_prop_vanity_mirror_three_views.png) |

## 2. 道具全阵容展示 (Lineup Showcase)

展示所有核心剧情道具在统一展示台环境下的比例关系：

![道具全景阵容图](./ref_props_lineup.png)

## 3. 建模工具与管线

- 建模自动化脚本：[`tools/blender/build_props.py`](../../../../tools/blender/build_props.py)
- 三视图合成工具：[`tools/blender/generate_props_three_views.py`](../../../../tools/blender/generate_props_three_views.py)
- 运行产物位置：[`public/assets/models/props/`](../../../../public/assets/models/props/)
- Blender 工程源文件：`assets/models/props/sm_prop_*/`
