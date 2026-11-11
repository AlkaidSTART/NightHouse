# SM_Light_TableLamp_01 · 书房复古绿罩台灯

> 资产类型：静态 3D 模型 ｜ 优先级：P1 ｜ 状态：✅ 已完成建模与三视图生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 书房书桌、卧室床头柜、客厅边柜 |
| 依赖 / 复用 | 无 |
| 运行时路径 | `public/assets/models/lighting/SM_Light_TableLamp_01.glb` (17.4 KB) |
| 源工程路径 | `assets/models/lighting/sm_light_table_lamp/SM_Light_TableLamp_01.blend` |
| 三视图参考 | `assets/models/lighting/sm_light_table_lamp/sm_light_tablelamp_01_three_views.png` |

## 三视图效果展示

![SM_Light_TableLamp_01 三视图](./sm_light_tablelamp_01_three_views.png)

## 1. 资产技术规格与建模结果

| 项目 | 规格要求 | 实际建模结果 |
|---|---|---|
| 尺寸 | 0.30 m 宽 × 0.20 m 深 × 0.50 m 高 | 0.30 m × 0.20 m × 0.50 m（严格对齐） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m | 1 单位 = 1 m；GLB 导出 Y-up 对齐 |
| 面数预算 | 800–3000 tris | 784 tris（面数紧凑优化） |
| 材质槽 | 2–3（金属 / 玻璃 / 大理石底座） | 3（`M_Aged_Brass`, `M_Banker_Glass`, `M_Dark_Marble`） |
| 贴图 / 材质 | PBR 物理材质 | 做旧黄铜支架、祖母绿层叠包心玻璃罩、墨绿大理石压重底盘 |
| 碰撞体 | 盒体代理碰撞 | 支持 PlayCanvas 统一盒体碰撞 |
| 原点 / 朝向 | 底面中心；灯罩朝上 | 原点位于底座底面中心 (0, 0, 0) |
| 导出格式 | GLB / glTF | GLB 二进制压缩导出 |

## 2. 用途与剧情意象

书房桌面核心局部光源（经典 Banker's Lamp 银行家灯造型），是玩家调查书房桌面上「信件初稿」「潮汐表」「航运账本」时的标志性环境焦点。配有可活动枢轴侧面旋钮与下垂铜珠拉线开关。

## 3. 验收检查清单

- [x] 尺寸完全符合 0.30m(宽) × 0.20m(深) × 0.50m(高)
- [x] 原点位于台灯底座底面正中 (0, 0, 0)，放置于桌面不会悬空或穿透
- [x] 包含绿罩、拉线、大理石底座等维多利亚写实关键特征
- [x] 成功导出 GLB 并写入 `public/assets/models/lighting/SM_Light_TableLamp_01.glb`
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
