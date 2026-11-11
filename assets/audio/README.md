# 音频资产

本目录按用途分为四类。每个资产一个子目录，README 中包含可复制的生成提示词或检索关键词、技术规格、触发与混音备注和授权记录。

| 分类 | 内容 | 资产数 | 索引 |
|---|---|---|---|
| 环境音 | 区域底噪、天气、空间氛围 | 6 | [ambience/README.md](./ambience/README.md) |
| 音效 | 交互、材质、钟表、留声机、剧情瞬间 | 29 | [sfx/README.md](./sfx/README.md) |
| 音乐 / 紧张层 | 可叠加的 tension stem | 4 | [music/README.md](./music/README.md) |
| 语音 | NPC 对话（是否启用待音频方案确认） | 1 | [vo/README.md](./vo/README.md) |

## 通用规范

- 采样率：48 kHz / 24-bit。
- 声道：近距离交互音用单声道；环境、音乐、UI 和远景用立体声。
- 响度：环境约 -20 LUFS，音乐 -23～-20 LUFS；一次性音效按峰值控制，详见各资产 README。
- 循环：环境与紧张层必须无缝循环；所有 tension stem 使用相同长度和循环点。
- 命名：源目录使用小写蛇形，运行文件使用 PascalCase，资产 ID 稳定不变。
- 运行路径：`public/assets/audio/<分类>/<Asset_ID>.ogg`。
- 授权：每个资产必须在 README 第 5 节记录来源、许可证、商用许可和署名要求。

## 播放与接入

音频播放统一由 `AudioManager` 管理，不要在各模块重复创建播放器。浏览器自动播放策略要求玩家主动开始游戏后再初始化或恢复音频上下文。

建议的模块边界：

- `AudioManager`：音频上下文、总线音量、暂停与恢复、资源释放。
- `AmbienceController`：区域环境循环的交叉淡化。
- `TensionDirector`：根据剧情标记输出 0–3 的紧张强度，控制 stem 叠加。
- `SfxPlayer`：一次性音效、随机变体、3D 定位与距离衰减。

## 新增资产

1. 复制 [ASSET_README_TEMPLATE.md](../_templates/ASSET_README_TEMPLATE.md)，放到对应分类目录下，并改写为音频规格。
2. 在分类 README 的资产表中登记。
3. 生成后按 README 第 4 节检查，并填写第 5 节授权记录。
4. 清理后的运行文件放到 `public/assets/audio/<分类>/`。
