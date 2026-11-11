# SM_Light_WallLamp_01 · 维多利亚复古壁灯

> 资产类型：静态 3D 模型 ｜ 优先级：P0 ｜ 状态：✅ 已完成建模与三视图生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 走廊、楼梯、门厅、入口 |
| 依赖 / 复用 | 无 |
| 运行时路径 | `public/assets/models/lighting/SM_Light_WallLamp_01.glb` (9.4 KB) |
| 源工程路径 | `assets/models/lighting/sm_light_wall_lamp/SM_Light_WallLamp_01.blend` |
| 三视图参考 | `assets/models/lighting/sm_light_wall_lamp/sm_light_walllamp_01_three_views.png` |

## 三视图效果展示

![SM_Light_WallLamp_01 三视图](./sm_light_walllamp_01_three_views.png)

## 1. 资产技术规格与建模结果

| 项目 | 规格要求 | 实际建模结果 |
|---|---|---|
| 尺寸 | 0.22 m × 0.18 m × 0.35 m（宽 × 深 × 高） | 0.22 m × 0.18 m × 0.35 m（严格对齐） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m | 1 单位 = 1 m；GLB 导出 Y-up 对齐 |
| 面数预算 | 500–1800 tris | 372 tris（极其轻量且结构饱满） |
| 材质槽 | 2（金属 / 玻璃） | 2（`M_Aged_Brass`, `M_Frosted_Glass`） |
| 贴图 / 材质 | PBR 物理材质 | 做旧黄铜底座与弯臂、磨砂波浪口玻璃灯罩 |
| 碰撞体 | 不需要 | 不需要（墙面高位装饰） |
| 原点 / 朝向 | 墙面贴合点；灯罩朝前朝上 | 原点位于壁板背面贴墙中心 (0, 0, 0) |
| 导出格式 | GLB / glTF | GLB 二进制压缩导出 |

## 2. 用途与剧情意象

走廊的主要引导光源，沿狭长走廊与主楼梯侧壁间隔布置，以昏黄压抑的局部暖光强调别墅走廊的深邃感与视线纵深。

## 3. 验收检查清单

- [x] 尺寸完全符合 0.22m(宽) × 0.18m(深) × 0.35m(高)
- [x] 原点位于墙面贴合点 (0, 0, 0)，弯臂沿法线向室外伸出
- [x] 材质槽数量严格为 2 槽（金属与玻璃）
- [x] 未在网格上烘焙死光与固定剧情文字
- [x] 成功导出 GLB 并写入 `public/assets/models/lighting/SM_Light_WallLamp_01.glb`
- [x] 完成正交三视图及 3/4 轴测立体图排版

## 4. 授权与来源记录

| 字段 | 内容 |
|---|---|
| 来源 / 工具 | Blender 5.2.3 原生程序化高精度网格构建与材质渲染 |
| 作者 / 生成者 | Hearo 3D Asset Tooling Pipeline |
| 许可证 | 项目专有资产（Midnight Villa Core Asset） |
| 是否允许商用 | 允许（完全自主工程构建） |
| 署名要求 | 保留项目内部资产规范 |
| 生成日期 | 2026-11-11 |
