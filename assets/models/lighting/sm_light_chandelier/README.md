# SM_Light_Chandelier_01 · 六臂复古黄铜吊灯

> 资产类型：静态 3D 模型 ｜ 优先级：P0 ｜ 状态：✅ 已完成建模与三视图生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 客厅、门厅、餐厅 |
| 依赖 / 复用 | 无 |
| 运行时路径 | `public/assets/models/lighting/SM_Light_Chandelier_01.glb` (62.7 KB) |
| 源工程路径 | `assets/models/lighting/sm_light_chandelier/SM_Light_Chandelier_01.blend` |
| 三视图参考 | `assets/models/lighting/sm_light_chandelier/sm_light_chandelier_01_three_views.png` |

## 三视图效果展示

![SM_Light_Chandelier_01 三视图](./sm_light_chandelier_01_three_views.png)

## 1. 资产技术规格与建模结果

| 项目 | 规格要求 | 实际建模结果 |
|---|---|---|
| 尺寸 | 0.80 m 直径 × 0.70 m 高 | 0.80 m × 0.80 m × 0.70 m（严格对齐） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m | 1 单位 = 1 m；GLB 导出 Y-up 对齐 |
| 面数预算 | 1500–5000 tris | 3,108 tris（完全符合预算） |
| 材质槽 | 2–3（金属 / 玻璃 / 线缆套筒） | 3（`M_Aged_Brass`, `M_Frosted_Glass`, `M_Candle_Sleeve`） |
| 贴图 / 材质 | PBR 物理材质 | 做旧黄铜、磨砂郁金香玻璃罩、象牙色蜡烛套筒 |
| 碰撞体 | 不需要 | 不需要（悬挂在天花板主光位） |
| 原点 / 朝向 | 吊线顶部安装点；灯体向下 | 原点位于天花板安装座中心 (0, 0, 0)，整体向下垂吊 |
| 导出格式 | GLB / glTF | GLB 二进制压缩导出 |

## 2. 用途与剧情意象

客厅与门厅主光源的视觉载体，确立 1897 年晚期维多利亚庄园的主体中心感。六根向外优雅延展的 S 形雕花铜臂支撑郁金香磨砂灯罩，中轴采用车件花瓶立柱与下垂式橡果挂坠。

## 3. 验收检查清单

- [x] 尺寸与真实比例一致（直径 0.80m，高 0.70m）
- [x] 原点位于天花板吊顶吸顶盘安装点 (0, 0, 0)，灯体沿负轴向下延伸
- [x] 法线方向朝外，曲面法线光滑，无穿插与共面
- [x] 材质槽数量符合预算（3 槽）
- [x] 未在网格上烘焙死光与固定剧情阴影
- [x] 成功导出 GLB 并写入 `public/assets/models/lighting/SM_Light_Chandelier_01.glb`
- [x] 完成正交三视图（主视图/右侧视图/俯视图）及 3/4 轴测立体图排版

## 4. 授权与来源记录

| 字段 | 内容 |
|---|---|
| 来源 / 工具 | Blender 5.2.3 原生程序化高精度网格构建与材质渲染 |
| 作者 / 生成者 | Hearo 3D Asset Tooling Pipeline |
| 许可证 | 项目专有资产（Midnight Villa Core Asset） |
| 是否允许商用 | 允许（完全自主工程构建） |
| 署名要求 | 保留项目内部资产规范 |
| 生成日期 | 2026-11-11 |
