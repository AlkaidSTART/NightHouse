# 午夜别墅 · Midnight Villa

单人第一人称写实悬疑探索游戏，运行在桌面浏览器。

当前仓库是依据 `docs/` 中的 PRD、游戏设计文档、技术架构文档和资产清单搭建的 **MVP 工程脚手架**。

## 技术栈

- **PlayCanvas Engine 2**：3D 渲染、相机、场景与交互检测
- **React 19 + TypeScript**：首页、HUD、暂停等 2D 界面
- **Vite 8**：开发服务器与构建
- **IndexedDB（idb）**：版本化本地存档与设置

## 开发

```bash
npm install
npm run dev        # 启动开发服务器
npm run typecheck  # TypeScript 类型检查
npm run lint       # ESLint
npm test           # 单元测试与灰盒验收测试（Node 内置测试运行器，无额外依赖）
npm run build      # 类型检查 + 生产构建
npm run export:glb # 把全宅灰盒导出为 public/assets/scenes/scene_villa_full.glb
npm run preview    # 预览构建产物
```

## 目录结构

```text
src/
├── app/                    # React 应用入口、页面切换与游戏视图
├── ui/                     # 首页、HUD、暂停/开始浮层
├── game/
│   ├── core/               # GameBootstrap 与游戏事件契约
│   ├── scene/              # 场景搭建、门与锁
│   ├── collision/          # 轻量碰撞：圆柱 vs 轴对齐盒、斜坡地面、射线
│   ├── player/             # 第一人称移动、视角与 Pointer Lock
│   ├── interaction/        # 相机中心射线、遮挡判定与交互目标注册
│   ├── story/              # 剧情条件判断
│   └── save/               # IndexedDB 存档、校验与迁移入口
├── content/                # 数据驱动内容；scenes/ 下是全宅灰盒的场景数据
└── shared/                 # 类型定义与类型化事件总线
tests/                      # 碰撞、门锁与灰盒验收测试
```

### 灰盒走查

对话与线索系统尚未实现，剧情门默认都锁着。开发服务器下用 `http://localhost:5173/?unlock=all` 打开，可以忽略门的剧情解锁条件，走遍全宅。这个开关只在开发构建中生效。

`game/` 与 `ui/` 只通过 `shared/events` 中的类型化事件通信，React 不直接操作 PlayCanvas 实体。

## 资产工作区

所有 3D 模型、贴图、动画和音频的生成提示词、技术规格与验收记录都在 `assets/`：

- 入口：[assets/README.md](./assets/README.md)
- 原始源文件与生成记录：`assets/`
- 清理后的运行资产：`public/assets/`

每个资产一个文件夹，README 中可直接复制英文生成提示词与负向提示词。

## 当前已完成

- Vite + React + TypeScript 严格模式工程
- PlayCanvas 初始化、资源释放、窗口尺寸响应
- 全宅灰盒：10 个区域、两层楼与主楼梯、门与剧情锁、全部交互点和 NPC 站位占位（见 `docs/午夜别墅_场景建模方案_v0.2.md`）
- 碰撞与地面检测、基础灯光、第一人称移动与视角
- Pointer Lock、暂停/恢复流程
- 相机中心射线交互（含墙体遮挡判定）与 HUD 提示
- IndexedDB 版本化存档：新建、读取、校验、自动保存、继续游戏
- 首页、HUD、开始浮层、暂停菜单
- 首屏与游戏运行时按需分包（PlayCanvas 不在首页 bundle 中）

## 尚未实现

- NPC、对话树、线索、任务、谜题、剧情状态机、结局
- 正式场景与 GLB 资产
- 音频系统与设置界面
- 对话、线索、谜题、存档等系统的自动化测试（目前只覆盖碰撞、门锁和灰盒验收）

剧情、角色与具体谜题内容仍按文档要求等待剧本阶段确认，脚手架不擅自生成既定设定。
