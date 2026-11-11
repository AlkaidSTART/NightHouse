# SM_Arch_Fireplace_01 · 壁炉与炉台石沿

> 资产类型：静态 3D 模型 ｜ 优先级：P0 ｜ 状态：✅ 已建模

| 项目 | 内容 |
|---|---|
| 使用位置 | 客厅与书房各一处；书房石沿是伊芙琳死亡现场与关键调查区域 |
| 依赖 / 复用 | 无 |

## 1. 英文生成提示词

```text
A classic late-Victorian marble and cast iron fireplace, 1.8 m wide, 1.35 m high and 0.65 m deep, fluted pilasters on sides, deep mantelpiece shelf with stepped moldings, recessed dark brick firebox with ornate cast-iron grate, projecting dark stone hearth slab at base with faint scratch marks, photorealistic, realistic old villa construction, muted desaturated palette, game-ready topology, clean UVs.
```

## 2. 用途

客厅与书房核心环境叙事资产，书房炉台石沿是死者伊芙琳头部撞击痕迹与灰烬碎片的关键调查交互点。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 尺寸 | 1.8 m × 1.35 m × 0.65 m（宽 × 高 × 深） |
| 单位 | 米；Y 轴向上；1 单位 = 1 m |
| 面数预算 | 800–2500 tris |
| 材质槽 | 3（大理石雕花架、深色炉前石沿、铸铁炉膛） |
| 贴图 | 1K PBR |
| 碰撞体 | COL_Arch_Fireplace_01，盒体碰撞代理 |
| 原点 / 朝向 | 底面中心 (0, 0, 0)；炉膛朝向 +Y |
| 导出格式 | GLB / glTF |
| 运行路径 | public/assets/models/architecture/SM_Arch_Fireplace_01.glb |
| 工程文件 | assets/models/architecture/sm_arch_fireplace/SM_Arch_Fireplace_01.blend |
| 三视图 | assets/models/architecture/sm_arch_fireplace/SM_Arch_Fireplace_01_three_views.png |

## 4. 交付检查

- [x] 尺寸与真实比例一致（1 单位 = 1 m）
- [x] 原点、朝向和枢轴符合规格
- [x] 法线方向正确，无明显穿插和重复面
- [x] UV 已展开，材质分配完整
- [x] 材质槽数量符合预算
- [x] 提供简化盒体碰撞代理（COL_Arch_Fireplace_01）
- [x] 在 PlayCanvas 场景路径导出 GLB 测试通过
