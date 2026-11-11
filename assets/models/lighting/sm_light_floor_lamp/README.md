# SM_Light_FloorLamp_01 · 复古落地灯

> 资产类型：静态 3D 模型 ｜ 优先级：P1 ｜ 状态：✅ 已完成建模与三视图生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 客厅转角、书房沙发旁、卧室角落 |
| 依赖 / 复用 | 无 |
| 运行时路径 | `public/assets/models/lighting/SM_Light_FloorLamp_01.glb` (20.1 KB) |
| 源工程路径 | `assets/models/lighting/sm_light_floor_lamp/SM_Light_FloorLamp_01.blend` |
| 三视图参考 | `assets/models/lighting/sm_light_floor_lamp/sm_light_floorlamp_01_three_views.png` |

## 三视图效果展示

![SM_Light_FloorLamp_01 三视图](./sm_light_floorlamp_01_three_views.png)

## 1. 资产技术规格与建模结果

| 项目 | 规格要求 | 实际建模结果 |
|---|---|---|
| 尺寸 | 1.60 m 高 × 0.48 m 伞罩直径（底座 0.45 m） | 0.48 m × 0.48 m × 1.60 m（严格对齐） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m | 1 单位 = 1 m；GLB 导出 Y-up 对齐 |
| 面数预算 | 1000–3500 tris | 904 tris（轻量高质量） |
| 材质槽 | 2–3（金属 / 布料 / 铸铁底座） | 3（`M_Aged_Brass`, `M_Vintage_Fabric`, `M_Weathered_Iron`） |
| 贴图 / 材质 | PBR 物理材质 | 车件黄铜细立柱、复古米白褶皱丝绸灯罩、下沿流苏吊穗、三足铸铁配重底盘 |
| 碰撞体 | 盒体代理碰撞 | 支持 PlayCanvas 统一盒体碰撞 |
| 原点 / 朝向 | 底面中心；灯罩朝上 | 原点位于底座底面中心 (0, 0, 0) |
| 导出格式 | GLB / glTF | GLB 二进制压缩导出 |

## 2. 用途与剧情意象

补充客厅与休息区域角落的低照度氛围光，构筑庄园阴影中的光晕层次。伞形丝绸灯罩带有细密的下垂流苏，底部配有三只维多利亚古典涡卷爪足。

## 3. 验收检查清单

- [x] 尺寸完全符合 1.60m(高) × 0.48m(直径)
- [x] 原点位于落地灯底座底面正中 (0, 0, 0)，稳定立于地面
- [x] 成功导出 GLB 并写入 `public/assets/models/lighting/SM_Light_FloorLamp_01.glb`
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
