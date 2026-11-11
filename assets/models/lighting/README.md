# 灯具

本目录收录「灯具」类资产。已完成全部 5 件维多利亚写实风格灯具模型的 3D 几何建模、PBR 材质设置、三视图渲染（正视/侧视/俯视/立体透视）与 GLB 运行时资产导出。

| 优先级 | 资产 ID | 名称 | 状态 | 规格尺寸 | 三角面数 | 材质槽 | 三视图与模型 |
|---|---|---|---|---|---|---|---|
| P0 | [SM_Light_Chandelier_01](./sm_light_chandelier/README.md) | 六臂复古黄铜吊灯 | ✅ 已完成 | 0.80 m (直) × 0.70 m (高) | 3,108 tris | 3 (黄铜/磨砂玻璃/套筒) | [三视图](./sm_light_chandelier/sm_light_chandelier_01_three_views.png) ｜ [.blend](./sm_light_chandelier/SM_Light_Chandelier_01.blend) |
| P0 | [SM_Light_WallLamp_01](./sm_light_wall_lamp/README.md) | 维多利亚复古壁灯 | ✅ 已完成 | 0.22 m × 0.18 m × 0.35 m | 372 tris | 2 (做旧黄铜/磨砂玻璃) | [三视图](./sm_light_wall_lamp/sm_light_walllamp_01_three_views.png) ｜ [.blend](./sm_light_wall_lamp/SM_Light_WallLamp_01.blend) |
| P1 | [SM_Light_TableLamp_01](./sm_light_table_lamp/README.md) | 书房复古绿罩台灯 | ✅ 已完成 | 0.30 m × 0.20 m × 0.50 m | 784 tris | 3 (做旧黄铜/绿玻/深色大理石) | [三视图](./sm_light_table_lamp/sm_light_tablelamp_01_three_views.png) ｜ [.blend](./sm_light_table_lamp/SM_Light_TableLamp_01.blend) |
| P1 | [SM_Light_FloorLamp_01](./sm_light_floor_lamp/README.md) | 复古落地灯 | ✅ 已完成 | 0.48 m (直) × 1.60 m (高) | 904 tris | 3 (黄铜/褶皱丝绸/铸铁) | [三视图](./sm_light_floor_lamp/sm_light_floorlamp_01_three_views.png) ｜ [.blend](./sm_light_floor_lamp/SM_Light_FloorLamp_01.blend) |
| P1 | [SM_Light_PorchLantern_01](./sm_light_porch_lantern/README.md) | 室外门廊铁艺吊灯笼 | ✅ 已完成 | 0.28 m × 0.28 m × 0.55 m | 368 tris | 3 (风化铁艺/斜边玻璃/黄铜) | [三视图](./sm_light_porch_lantern/sm_light_porchlantern_01_three_views.png) ｜ [.blend](./sm_light_porch_lantern/SM_Light_PorchLantern_01.blend) |

> **光照架构原则**：灯具模型与实际光源分离，模型负责物理可见网格与 PBR 质感，实际光照与阴影在 PlayCanvas 场景中由 Light 组件与光照方案配置，不在网格中烘焙不可替换的死光。
