# AN_NPC_Walk_01 · NPC 行走动画

> 资产类型：动画片段 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 需要在场景中移动的 NPC |
| 依赖 / 复用 | SK_NPC_Base_01 |

## 快速使用

复制动作描述 → 在 Mixamo / Blender / 动作生成工具中制作 → 重定向到目标骨架 → 导出 GLB → 放到「运行路径」。

## 1. 动作描述（可直接用于动作生成或动画师简报）

```text
A calm in-place walk cycle for a realistic adult NPC in an old villa. Natural arm swing, slight head movement, controlled steps, no foot sliding, no root motion. Loop seamlessly at 30 fps.
```

**检索关键词：** walk cycle, calm, in-place, natural arm swing, seamless loop

## 2. 用途

支持 NPC 在房间之间行走或剧情走位。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 24–36 帧（0.8–1.2 秒） |
| 帧率 | 30 fps |
| 循环 | 无缝循环 |
| 根运动 | 无根位移（in-place） |
| 目标骨架 | SK_NPC_Base_01 标准人形骨架 |
| 导出格式 | GLB（动画嵌入角色或独立片段） |
| 运行路径 | public/assets/animations/AN_NPC_Walk_01.glb |

## 4. 生成后检查

- [ ] 循环首尾帧无缝衔接
- [ ] 帧率和时长符合规格
- [ ] 没有根位移（in-place）
- [ ] 脚底无明显滑动
- [ ] 骨骼命名与目标骨架兼容
- [ ] 在 PlayCanvas 中与 SK_NPC_Base_01 绑定测试
- [ ] 动画文件体积符合预算
- [ ] 来源与许可证已记录

## 5. 授权与来源记录

| 字段 | 内容 |
|---|---|
| 来源 / 工具 | 待填写 |
| 作者 / 生成者 | 待填写 |
| 许可证 | 待填写 |
| 是否允许商用 | 待确认 |
| 署名要求 | 待确认 |
| 下载 / 生成日期 | 待填写 |
| 修改说明 | 待填写 |

## 6. 备注

只有确认 NPC 需要移动后再做；MVP 可先只使用 Idle。
