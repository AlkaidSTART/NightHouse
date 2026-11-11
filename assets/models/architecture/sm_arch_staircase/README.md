# SM_Arch_Staircase_01 · 主楼梯与栏杆

> 资产类型：静态 3D 模型 ｜ 优先级：P0 ｜ 状态：✅ 已建模

| 项目 | 内容 |
|---|---|
| 使用位置 | 门厅到二楼走廊，三层宅邸的必需动线 |
| 依赖 / 复用 | 无 |

## 1. 英文生成提示词

```text
A grand late-Victorian dark oak staircase, 1.4 m wide, 3.4 m total rise and 4.2 m depth, 16 steps with rounded nosing, ornate carved newel posts with turned finials, continuous molded handrail with delicate turned balusters, closed paneled stringers, worn dark wood varnish with scuffs on tread centers, muted desaturated palette, physically based material, no baked lighting, game-ready modular architecture.
```

## 2. 用途

门厅视觉中心，连接一层门厅与二层走廊的核心交通动线。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 尺寸 | 1.4 m × 3.4 m × 4.2 m（宽 × 高 × 深，16 级台阶） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m |
| 面数预算 | 1500–4500 tris |
| 材质槽 | 2 |
| 贴图 | 1K PBR（老橡木与微灰石膏） |
| 碰撞体 | COL_Arch_Staircase_01，斜坡通行代理 |
| 原点 / 朝向 | 起步踏面中心 (0, 0, 0)；沿 +Y 向上延伸 |
| 导出格式 | GLB / glTF |
| 运行路径 | public/assets/models/architecture/SM_Arch_Staircase_01.glb |
| 工程文件 | assets/models/architecture/sm_arch_staircase/SM_Arch_Staircase_01.blend |
| 三视图 | assets/models/architecture/sm_arch_staircase/SM_Arch_Staircase_01_three_views.png |

## 4. 交付检查

- [x] 尺寸与真实比例一致（1 单位 = 1 m）
- [x] 原点、朝向和枢轴符合规格
- [x] 法线方向正确，无明显穿插和重复面
- [x] UV 已展开，贴图与材质分配完整
- [x] 材质槽数量符合预算
- [x] 提供平滑斜坡碰撞代理（COL_Arch_Staircase_01）
- [x] 在 PlayCanvas 场景路径导出 GLB 测试通过
