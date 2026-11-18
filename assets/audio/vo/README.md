# 语音

NPC 身份、台词与触发条件已由故事线 V0.7 确认，**但正式版是否启用完整配音仍未决定**（`docs/午夜别墅_PRD_v1.3.md` 待确认项 5）。因此本分类当前交付的是**清单、规格与资产登记**，不是音频文件；在没有确认方案前不要批量生成或录制正式语音。

> 当前盘点（2026-11-18）：对话共 84 个节点、165 条 NPC 台词、13 条对话内旁白，另有序章/结局旁白与伊芙琳蜡筒录音等待定批次。逐句清单由 `npm run export:vo` 生成到 [manifest/](./manifest/README.md)，**台词一改就重跑，不要手改 CSV**。

## 分类索引

| 优先级 | 资产 ID | 名称 | 覆盖内容 | 片段 | 状态 | README |
|---|---|---|---:|---:|---|---|
| P1 | `VO_NpcArthur` | 亚瑟台词 | `npc_arthur` 全部节点 | 76 | 待录制（方案待确认） | [vo_npc_arthur](./vo_npc_arthur/README.md) |
| P1 | `VO_NpcHousekeeper` | 霍尔太太台词 | `npc_housekeeper` 全部节点 | 54 | 待录制（方案待确认） | [vo_npc_housekeeper](./vo_npc_housekeeper/README.md) |
| P1 | `VO_NpcDoctor` | 格雷医生台词 | `npc_doctor` 全部节点 | 35 | 待录制（方案待确认） | [vo_npc_doctor](./vo_npc_doctor/README.md) |
| 待定 | `VO_Narrator` | 对话内旁白 | 对话节点中的 `narration` 台词 | 13 | 待定 | [vo_narrator](./vo_narrator/README.md) |
| P1 | `VO_EvelynCylinder` | 伊芙琳蜡筒录音 | `INT_prop_phonograph` 的引用段落 | 5 | 待录制（方案待确认） | [vo_evelyn_cylinder](./vo_evelyn_cylinder/README.md) |
| 待定 | `VO_NPC_Placeholder` | NPC 语音（旧占位） | 无实际内容 | 1 | 待音频方案确认 | [vo_npc_placeholder](./vo_npc_placeholder/README.md) |

准确的片段数、字数与估算时长以 [manifest/README.md](./manifest/README.md) 为准（自动生成）。

## 清单（录音表）

```bash
npm run export:vo
```

| 文件 | 用途 |
|---|---|
| `manifest/vo_lines.csv` | 逐句录音表：片段 ID、角色、节点、句序、台词、称谓变体、字数、估算秒数、任务步骤、进入条件、情节节拍、运行文件名 |
| `manifest/vo_lines.json` | 同源机器可读版本，供后续工具与接入校验使用 |
| `manifest/README.md` | 统计摘要（角色、节拍、称谓句数量） |

CSV 直接对应「一句一个文件」的运行粒度：对话是所有台词逐句推进的，语音不能按整段节点切分，否则玩家按 E 跳过时会出现声音与字幕错位。

## 目录与命名约定

```text
assets/audio/vo/<角色资产>/README.md                       # 资产登记、声音卡、验收与授权
assets/audio/vo/manifest/                                  # 自动生成的清单
public/assets/audio/vo/VO_NpcArthur_<节点ID>_L01.ogg       # 节点内第 1 句
public/assets/audio/vo/VO_NpcArthur_<节点ID>_R01.ogg       # 重复交谈短句
public/assets/audio/vo/VO_Narrator_<节点ID>_L02.ogg        # 同一节点里的旁白
public/assets/audio/vo/VO_EvelynCylinder_INT_prop_phonograph_P01.ogg
```

- **例外说明：语音以「角色」为资产单元，不按每句建目录。** 165 条台词如果各自建资产目录，会让 `assets/audio` 的索引和登记失去意义；句级信息由文件名与清单承载。
- 文件名中的节点 ID 是稳定标识（`src/content/dialogues/*.ts` 的 `id`），句序 `L01` 从 1 开始，`R` 表示 `reenterLines`。节点增删、台词增删都必须重跑 `npm run export:vo`，否则接入时会对不上号。
- 语音文件不循环，不使用 AudioSprite 串联；一句一个文件便于打断与按节点懒加载。

## 通用技术规格

| 项目 | 要求 |
|---|---|
| 源文件 | WAV / 48 kHz / 24-bit / 单声道 |
| 运行文件 | OGG Vorbis / 48 kHz / 单声道 / q4–5 |
| 响度 | 约 −18 LUFS（integrated），真峰值 ≤ −2 dBTP |
| 空间化 | 2D UI 语音，**不烘焙混响**；室内空间感由场景总线与混响发送提供 |
| 句首尾 | 各留 80–120 ms 自然气口与尾音，不要附加长静音 |
| 时长 | 单句建议 1.5–15 秒，上限 20 秒 |
| 一致性 | 同一角色跨全部节点使用同一音色与语速基准；情绪只做幅度变化，不做音色变化 |
| 字幕 | 语音必须与当前行文本逐字一致（含称谓替换后的结果）；台词改动即需重录该句 |

## 接入前提（当前均未实现）

`src` 中还没有 `AudioManager` 或任何音频播放代码，`SettingsPanel` 只有「主音量」和「音效音量」。语音接入前需要：

1. `AudioManager` 增加独立 **Voice 总线**，与 Ambience / Music / SFX 分离，并支持暂停、场景切换淡出与资源释放。
2. 设置面板增加「对话音量」滑杆，并纳入存档持久化。
3. 对话播放与字幕的同步规则：进入一句即播放；按 E 应**打断当前句**再推进文本，而不是只推进文本让声音继续。
4. 按节点预加载：总计约 12–15 分钟语音，按角色目录与当前节点懒加载，不整体预载。

## 待确认事项

1. **是否启用完整配音**（PRD v1.3 待确认项 5）。未确认前只做样音试听，不做全量。
2. **对话内旁白是否配音**；若要，序章（约 285 字）与三结局（约 1117 字）是否用同一叙述者。
3. **称谓句处理**：7 条台词含 `{honorific}` 占位（运行时替换为「先生/小姐」）。建议改写为不含称谓的句子；保留称谓则每句需录两版。
4. **语音来源与授权**：真人配音或 AI TTS 的商用条款、音色授权、是否需要披露 AI 生成。

## 状态定义

- **待录制**：清单与规格已就绪，尚未产出音频。
- **待定**：是否制作尚未决定（旁白、旧占位）。
- **待验收**：已有运行文件，尚未完成试听、格式与浏览器接入检查。
- **已完成**：文件路径与清单一致、验收通过、来源与授权记录完整。
