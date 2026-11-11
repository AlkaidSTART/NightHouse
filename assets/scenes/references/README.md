# 午夜别墅 · 建筑三视图与环境参考图集

本目录存放《午夜别墅》（Ashcroft House，1897）用于 Blender M2–M5 阶段场景建模、贴图与灯光对齐的视觉参考图。

## 制作依据

- 主视觉基准：[午夜别墅：游戏设计资产板.png](../../main/午夜别墅：游戏设计资产板.png) 与用户提供的封面主图
- 空间尺寸与平面：[《场景建模方案 V0.2》](../../../docs/午夜别墅_场景建模方案_v0.2.md) & [`villaGreybox.ts`](../../../src/content/scenes/villaGreybox.ts)
- 资产与结构规格：[《3D 资产与建模清单 V1.1》](../../../docs/午夜别墅_3D资产与建模清单_v1.1.md) §2–§15
- 世界观与气候设定：[《世界观设定 V0.7》](../../../docs/午夜别墅_世界观设定_v0.7.md) §3–§4

---

## 参考图清单

### 一、别墅建筑三视图与平面蓝图

| 文件 | 用途 | 关键约束对齐 |
|---|---|---|
| [`ref_villa_three_views.jpg`](./ref_villa_three_views.jpg) | **别墅正交三视图**（正面南向立面 + 西侧悬崖立面 + 屋顶俯视图） | 22 m × 15 m 主体尺度、陡坡石板双坡交叉屋顶、9.4 m 屋脊、2F 左翼暗窗、西侧露台与下沉石阶及纪念石 |
| [`ref_villa_four_elevations.jpg`](./ref_villa_four_elevations.jpg) | **别墅四向立面环视图**（南 / 西 / 北 / 东立面） | 统一标高基准线（1F 0.0 m、2F 3.4 m、檐口 6.6 m、屋脊 9.4 m），无透视畸变，供 Blender 贴图对位 |
| [`ref_villa_floorplan_1f_2f.png`](./ref_villa_floorplan_1f_2f.png) | **一层与二层建筑平面动线蓝图** | 直接按 `villaGreybox.ts` 坐标渲染：1F 门厅 8×9 m 挑空、U 形主楼梯、客厅 7×7 m、餐厅 7×7 m（13 席）、1F 走廊 7×2 m、书房 5×6 m、储物间 3×4 m、西侧露台 6×8 m；2F 回廊 4×2 m、伊芙琳卧室 5×7 m（南窗不亮）、浴室 3×4 m 与封闭区域 |

### 二、环境与氛围参考图

| 文件 | 对应区域 | 关键要素 |
|---|---|---|
| [`ref_env_gate_driveway.jpg`](./ref_env_gate_driveway.jpg) | `scene_gate`（室外抵达段 B0） | 铁艺大门、石门柱灯、左侧门柱 `ASHCROFT HOUSE 1897` 铜牌、湿车辙车道、枯死树篱、干涸石喷泉、门廊暖光与 2F 暗窗 |
| [`ref_env_west_terrace_cliff.jpg`](./ref_env_west_terrace_cliff.jpg) | `villa_cliff`（西侧露台与寡妇崖） | 露台双开玻璃木门透出走廊暖光、湿滑石质栏杆、6 级下沉石阶、崖边平台纪念石、墓园浅滩暗礁浪花与海雾 |
| [`ref_env_estate_coastal_aerial.jpg`](./ref_env_estate_coastal_aerial.jpg) | 全宅地形鸟瞰 | 铁门车道—喷泉—枯树篱—宅邸—西侧露台—寡妇崖断崖与北海的完整空间拓扑与冷暖光对比 |
| [`ref_env_interior_lighting.jpg`](./ref_env_interior_lighting.jpg) | 室内核心光影分区 | 门厅早期电灯吊灯与挑空回廊、走廊低照度煤气壁灯与暗区、书房绿罩台灯与蜡筒留声机、伊芙琳暗窗卧室 vs 浴室冷色调壁灯 |
