# AN_NPC_Idle_01 · NPC 待机动画

> 资产类型：动画片段 ｜ 优先级：P0 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 所有站立 NPC |
| 依赖 / 复用 | SK_NPC_Base_01 |

## 快速使用

复制动作描述 → 在 Mixamo / Blender / 动作生成工具中制作 → 重定向到目标骨架 → 导出 GLB → 放到「运行路径」。

## 1. 动作描述（可直接用于动作生成或动画师简报）

```text
A subtle idle loop for a realistic adult NPC standing in an old villa. Weight shifts slowly from one foot to the other, small breathing motion in the chest and shoulders, occasional blink, hands relaxed at the sides. Loop seamlessly at 30 fps, in place, no root motion.
```

**检索关键词：** idle, standing breathing, subtle weight shift, relaxed hands, seamless loop

## 2. 用途

让 NPC 在场景中保持自然呼吸和轻微重心变化，避免完全静止。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 60–120 帧（2–4 秒） |
| 帧率 | 30 fps |
| 循环 | 无缝循环 |
| 根运动 | 无根位移（in-place） |
| 目标骨架 | SK_NPC_Base_01 标准人形骨架 |
| 导出格式 | GLB（动画嵌入角色或独立片段） |
| 运行路径 | public/assets/animations/AN_NPC_Idle_01.glb |

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

动作幅度要克制，避免游戏角色像在“表演待机”。
