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

### 生产构建

生产构建会把 PlayCanvas、React 和其余第三方依赖拆成独立 chunk；首页只加载 React 壳，进入游戏后才请求 PlayCanvas。`public/` 中用于建模、参考和后续制作的资产不会全部进入部署产物，目前只发布以下运行时目录：

- `public/assets/scenes/`
- `public/assets/models/characters/`
- `public/assets/renders/`
- `public/assets/textures/`

新增运行时资产类型时，需要同步更新 `vite.config.ts` 中的 `RUNTIME_PUBLIC_ASSET_ROOTS`。

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAlkaidSTART%2FNightHouse&project-name=midnight-villa&repository-name=midnight-villa)

仓库已包含 `vercel.json`，Vercel 会自动执行 `npm ci && npm run build`，发布 `dist/`。部署不需要后端、账号系统或环境变量；游戏进度仍保存在玩家浏览器的 IndexedDB 中。

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

剧情门按故事进度解锁（例如餐厅门与书房门要等见过亚瑟、卧室门要等霍尔太太交出钥匙）。开发服务器下用 `http://localhost:5173/?unlock=all` 打开，可以忽略门的剧情解锁条件，直接走查尚未到达的房间与 NPC 站位。这个开关只在开发构建中生效。

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
- 全宅灰盒：10 个区域、两层楼与主楼梯、门与剧情锁、全部交互点和 NPC 站位（见 `docs/午夜别墅_场景建模方案_v0.2.md`）
- 碰撞与地面检测、基础灯光、第一人称移动与视角、蹲下与跳跃
- Pointer Lock、暂停/恢复流程
- 相机中心射线交互（含墙体遮挡判定）与 HUD 提示
- IndexedDB 版本化存档：新建、读取、校验、自动保存、继续游戏
- 首页、HUD（任务目标、八方向路线、小地图、区域名）、开始浮层、暂停菜单、人物档案
- 三名 NPC 的预设对话树与「任务步骤 → 对话入口/话题」集中路由、会话内条件选项与出示证据
- 五条可追踪调查线：死因、亚瑟行动、家族骗保、伊芙琳录音与十三下钟声
- 线索发现与线索日志、交叉验证式任务推进、落地钟与保险箱谜题
- 结局判定与「继承体面 / 拒绝签字」两套演出（拒签含强/弱变体）
- 首屏与游戏运行时按需分包（PlayCanvas 不在首页 bundle 中）
- 自动化测试：碰撞、门锁与门扇、对话图与对话运行时、线索、调查线、任务、谜题、结局、交互距离、NPC 站位、路线指引、存档与灰盒验收

对话路由的配置位置、匹配顺序与新增内容检查项见
[`docs/午夜别墅_对话情节路由_v0.1.md`](./docs/午夜别墅_对话情节路由_v0.1.md)。

## 尚未实现

- 正式场景与 GLB 资产替换灰盒
- 音频系统与设置界面
- 第三方素材的授权与署名清单（目前仅使用项目内灰盒与占位资源）
