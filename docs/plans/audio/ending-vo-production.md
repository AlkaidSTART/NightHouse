# 结局配音制作执行记录

状态：44 段分段旁白与 13 份结局音效已生成、验证并接入结局演出；全量测试、类型检查、lint、构建与 Chrome 无头回归通过。旁白 OGG 与本机目录不入库，公开构建回退为完整字幕加原创音效。百炼公开条款已复核：随游戏使用有条件可行，AI 标识待落实，公开仓库分发未放行。人工听读与实机试听仍未完成。

目标：先完成可复核的配音稿与短样试听，再制作全部结局音频。旁白服务于案件因果回收与分支后果表达，保留既有结局 ID、条件和存档。

## 实施计划与验收

| 步骤 | 动作 | 验收 | 状态 |
|---|---|---|---|
| 1 | 核对剧情文档、运行文本、音色及资产 | 覆盖四分支、签署证据附加段，区分草稿与已用正文 | 已核对 |
| 2 | 导出分段清单和短样方案 | JSON / CSV 与源文本一致，ID 唯一，短样目标小于 10 秒 | 已导出 |
| 3 | 准备合成工具 | 默认离线预览，全量要求文案摘要确认；已有输出拒绝覆盖，失败停批 | 已通过离线检查；真实调用未验证 |
| 4 | 合成试听（已获用户授权） | 3 音色 × 3 短句，9 次 API 调用；逐条检查解码并人工听读 | 已合成，实际干声共 31.76 秒；解码通过，人工试听待用户复核 |
| 5 | 确认音色和完整文案 | 共享稿、引语转述方式、姓名读法和时长明确 | 已选龙安灵心；沿用现有稿件合成，人工听读与定稿仍未完成 |
| 6 | 全量合成与制作音效 | 44 段旁白齐全；授权、生成记录、音量和十二／十三下钟声通过复核 | 44 段 + 13 份音效，技术检查通过；旁白发布门禁待完成 |
| 7 | 接入与回归 | 字幕、结束后结算、跳过、失败回退、退出清理和浏览器验证 | 已完成：单元测试 + Chrome 无头回归 8/8 |

本批只准备制作工具、音频资产与结局演出，不改变运行时剧情、结局条件或存档结构；未采用候选剧情增补，也未引入依赖。

## 文本来源与待确认项

- 四分支直接由 `src/content/endings.ts` 的 `presentEnding` 导出，不手工复制到第二套配音脚本。
- 共享真相回收的六段从 `ending-vo-truth-recap.md` 的“文案草稿”读取，状态保留 draft。案件事实已对照世界观 §5.3 与警告信来源核对；没有新增结局事实。
- 签署 P08 仅在 `hasAnyEvidence(storyFlags)` 为 true 时使用；无证据签署只播放 P01–P07。
- 引号对白统一由旁白转述是本次试听方案，未写入正式剧情规范。
- 共享稿估时约 113 秒，高于总计划原定 50–85 秒。先试听实际语速；如需缩稿，应确认文案后重导出，不能靠高速念稿硬凑时长。
- 隐藏结局文稿的点名后还有 NPC 反应、对话和钟声描述，原方案提出“名字后静音约 1 秒再响钟”，二者在接入时需确定对应时点，不能静默删改原文或重复播放钟声。
- 强拒签权威文档收尾还提到落地钟搬离时的第十三下；当前运行正文未包含该收尾段。接入前应确认是否将其加入字幕与旁白，当前清单忠于现有运行正文。

## 已导出的清单

位置：`assets/audio/vo/ending_manifest/`，由 `npm run export:ending-vo` 生成。

| 分组 | 条数 | 字符（含标点） | 预计秒数 |
|---|---:|---:|---:|
| TruthRecap | 6 | 428 | 113 |
| Signed（含可选 P08） | 8 | 199 | 55 |
| RefusedStrong | 11 | 418 | 111 |
| RefusedWeak | 7 | 154 | 43 |
| Echo | 12 | 493 | 128 |

总计 44 段、1692 字符，约 7.5 分钟干声（不含钟声与演出停顿）。同一结局只用共享稿加自身分支，不播放其他分支。

## 首轮试听

模型：`qwen-audio-3.1-tts-plus`。当前系统音色仅四种；排除高亢热情的龙安欢后，先试听以下三种：

| 音色 | ID | 需要留意 |
|---|---|---|
| 龙安灵心 | `longanlingxin_v3.1` | 温暖女声，已用于霍尔太太；不要听成 NPC 心声 |
| 龙安风悦 | `longanfengyue_v3.1` | 自然女声，已用于伊芙琳蜡筒；不要把中性旁白误认成伊芙琳 |
| 许南川 | `xunanchuan_v3.1` | 磁性男声，已用于亚瑟与格雷；留意角色混淆 |

每种均读以下三条，预计分别 7.1 / 4.5 / 3.1 秒，总计 9 次调用、44.1 秒：

1. 她挣脱时向后跌倒，后脑撞上壁炉石沿，当场死于意外。
2. 塞缪尔·克罗斯，舱面学徒，十六岁。
3. 没有人再提伊芙琳。

实际估时以导出清单为准。现有对话旁白是 Flash 的 `xuyuyuan_v3.1`，Plus 不支持该音色。若三种候选均不能建立独立旁白身份，应另行评估音色设计或保留 Flash 旁白的一致性，不把音色跨模型硬套。暂不复刻或设计新音色。

## 命令

```bash
npm run export:ending-vo
npm run tts:ending -- samples
npm run tts:ending -- production --voice longanlingxin_v3.1
```

以上都是本地操作，后两条仅预览。真实合成须先确认调用范围、文本和音色。

执行条件：Node 22+、FFmpeg；`Bailian-KEY`（只从环境读）；`BAILIAN_TTS_SCRIPT`（本机技能 `bailian-tts/scripts/tts.mjs` 的绝对路径）；`BAILIAN_TTS_ORIGIN`（已确认的百炼业务空间 HTTPS origin）。本批复用技能记录的既有百炼北京业务空间，仅为子进程设置 origin，未修改全局环境；Key 只检查存在性，未读取或输出其值。

```bash
# 确认 9 次试听调用后执行；不要在此命令中写 Key。
npm run tts:ending -- samples --execute --run-id audition_01

# 试听定音色、定稿后，先获取预览输出的 textSha256；确认该文案才执行。
npm run tts:ending -- production --voice longanlingxin_v3.1 --execute --run-id production_01 --approved-text-sha256 APPROVED_HASH
```

两类执行均复用技能脚本发起请求，不重复实现网络鉴权与下载。请求只包含剧情文本、音色和表演指令，发送到阿里百炼；失败立即停止，无自动重试。生成记录只保留制作元数据，不写 Key 或临时下载 URL。批次使用独立名称，重录不覆盖旧源文件。

技能目前请求原生 24 kHz WAV；工具另产出 48 kHz 单声道 OGG Vorbis q5，`loudnorm I=-20 TP=-3 LRA=7`。重采样不等于原生 48 kHz，也不声称实际合成已验证。若决定改用原生 48 kHz，应先在技能补参数并验证模型实际输出，不能只修改清单标签。当前输出保留在制作目录，不自动发布到 `public/`；需在试听与授权复核后正式交付。

## 音效与接入缺口

目前已跟踪的 `public/assets/audio/sfx/`、`ambience/`、`music/` 只有占位文件，仓库中未找到可用的源 WAV / MP3 / OGG。目录 README 不能当作已完成音频。

- 钟声：制作标准单响与第十三下变体；十二／十三次调度与尾音需验证。弱拒签不补第十三下。
- 签署：笔尖和折纸；拒签：纸张落桌、木楼梯脚步、门锁与雨中脚步。
- 补齐低房间底噪与留声机空转；有授权且可复用的素材优先，TTS 技能不生成这些声音。
- 接入现有结局 UI 前，明确点名与钟声时序，增加共享回收字幕、当前段高亮、跳过、加载失败回退、音量联动和退出清理。
- 资产确认后再启用演出，缺失资源不能让玩家额外等待或出现逐段 404 请求。

## 来源与授权

官方模型与音色能力已核对：

- https://help.aliyun.com/zh/model-studio/tts-model
- https://help.aliyun.com/zh/model-studio/qwen-audio-tts-voice-list
- https://help.aliyun.com/zh/model-studio/qwen-audio-tts-http-api

44 段旁白由百炼官方 `qwen-audio-3.1-tts-plus`（系统音色 `longanlingxin_v3.1`）生成。2026-11-20 已复核正式 API 条款、公开 GitHub 仓库的许可边界和文件标签，见[结局旁白来源与授权复核](../../../assets/audio/vo/vo_ending/README.md)。随游戏发布前仍须确认实际订单与落地标识；没有把 OGG 放进公开 MIT 仓库的放行依据。音效为项目原创合成，无需第三方署名。生成 JSON 中的 `pending_review` 是合成当时的记录，发布状态以后续复核为准。

## 本轮验证与续接

实际执行：`npm run export:ending-vo`、`npm run tts:ending -- samples`、`node --test tests/endingVoPlan.test.ts`（5 项通过）、`npm test`（273 项通过）、`npm run typecheck`、`npm run lint`、`npm run build`、`git diff --check`。构建成功，但有 PlayCanvas 分包超过 500 kB 的体积提示；本批未修改引擎打包。

制作工具准备阶段未执行真实 TTS、人工试听、音频解码或浏览器验证；该阶段仅验证离线制作流程。`.gitignore` 只放行新增的三个制作脚本，源音频与样音继续排除在版本管理外。

### audition_01 实际结果

用户确认“生成吧”后执行 9 次调用，全部成功，无追加合成请求。生成模型 `qwen-audio-3.1-tts-plus`；仍未选择正式音色。生成日期与逐条参数见 `assets/audio/vo/vo_ending/generation_samples_audition_01.json`。

- 试听页面：`assets/audio/vo/vo_ending/samples/audition_01/index.html`，双击本地打开，无需服务。
- 每种音色各有三条独立 OGG 和一个 `comparison.ogg`，按因果 → 点名 → 结尾排列，段间增加 0.6 秒静音。
- 9 条干声总长 **31.76 秒**。合并试听：龙安灵心 11.64 秒、龙安风悦 11.76 秒、许南川 12.10 秒（含间隔）。
- 原始 WAV 均为 24 kHz、16-bit、单声道；OGG 为 48 kHz、Vorbis、单声道。
- 严格解码发现原始 WAV 的 RIFF / data 长度仍是大于实际文件的流式占位值。保留所有原始文件，另存 `_normalized.wav` 副本，仅修正这两个长度字段，PCM 样本逐字节相同。
- 9 份修正 WAV、9 份单句 OGG、3 份合并 OGG 均通过 `ffprobe` 参数检查与 `ffmpeg -v error -xerror ... -f null -` 完整解码，共 21 份；验证报告与 PCM 哈希见 `assets/audio/vo/vo_ending/verification_samples_audition_01.json`。
- 尚未人工听读或独立测量转码后响度；不能将技术检查视为发音与表演验收。商业许可与署名仍待复核。未发布至 `public/`。
- 后续全量制作前应在制作流程补上 WAV 占位长度修正；不要因为容器头问题重新付费合成。

### long_sample_01 实际结果

用户同意选用龙安灵心并制作长样片。模型 `qwen-audio-3.1-tts-plus`，音色 `longanlingxin_v3.1`；沿用共享真相回收稿的全部六段，一次请求，不改变文案。共 428 个字符，含段间换行的请求文本为 438 个字符。保留统一旁白指令，并增加“减少安慰感，保持客观叙述；按自然段保留呼吸空间，姓名逐个清楚读出”。

- 单次付费调用成功；没有生成其余分支或追加全量请求。
- 试听页面：`assets/audio/vo/vo_ending/samples/long_sample_01/index.html`，附完整文稿。
- OGG：`truth_recap.ogg`；修正封装的 WAV：`truth_recap_normalized.wav`；百炼原始 WAV 保留为 `truth_recap.wav`。
- 输出时长 **90.00 秒**；WAV 为原生 24 kHz、16-bit、单声道，OGG 为 48 kHz Vorbis 单声道。
- 原始 WAV 同样带占位长度；在副本中仅修正 RIFF / data 长度，PCM 逐字节相同。修正 WAV 与 OGG 均通过 `ffprobe` 检查和 `ffmpeg -v error -xerror` 完整解码。
- OGG 编码后实测：综合响度 **-20.09 LUFS**，真峰值 **-2.94 dBTP**，响度范围 **2.5 LU**；没有达到数字削波峰值。真峰值略高于处理时的 -3 dBTP 目标，不把预设值当作实测结果。
- 生成参数与文本记录：`assets/audio/vo/vo_ending/generation_long_sample_01.json`；技术验证：`assets/audio/vo/vo_ending/verification_long_sample_01.json`。
- 本地页面所有音频链接存在，显示正文与本次请求稿逐段一致；未启动本机服务。
- 尚未人工听辨：尤其需要确认是否完整读到最后一句、船名与四名船员姓名、段间停顿、是否过于温柔。解码和文本一致性不能代替听读验收。
- 90 秒略高于原先 50–85 秒目标，但明显短于离线估算的 113 秒。试听后再决定维持节奏还是压缩文案；这条连续长样片不代替正式 P01–P06 独立片段。

### production_01 实际结果

用户确认“继续，做完剩下的任务”后，用龙安灵心合成全部分段旁白。44 次请求全部成功，无重试；失败即停的机制未触发。

- 生成记录：`assets/audio/vo/vo_ending/generation_production_production_01.json`（逐条文本、指令、时间与封装修正）；验证报告：`assets/audio/vo/vo_ending/verification_production_01.json`。
- 44 段干声总长 **337.57 秒（约 5 分 38 秒）**，比离线估算的 449 秒短。
- 每段均保存百炼原始 WAV、仅修正 RIFF/data 长度的 `_normalized.wav`（PCM 逐字节不变）与 48 kHz OGG。
- 44 份 OGG 全部通过 `ffprobe` 参数检查、`ffmpeg -v error -xerror` 完整解码与编码后 `loudnorm` 测量；真峰值均低于 -2.5 dBTP。
- 运行文件已放入本地 `public/assets/audio/vo/ending/`，并同步到 `src/content/endingAudioAssets.json` 供运行时映射；正文与生成时不一致会拒绝旧录音并回退纯文本。放入本地运行目录不等于已获公开发布许可。

### 音效实际结果

`scripts/generateEndingSfx.mjs` 原创合成 13 份音效（种子 18971113），没有使用第三方素材。钟声次数在采样层面完成排列，运行时不再用定时器重复触发，因此卡顿不会漏敲或多敲。署名与来源见 `assets/audio/sfx/ending/README.md`，峰值、哈希与实测响度见验证报告。

### 接入实现

- `src/content/endingPerformance.ts`：纯映射层，把共享回收稿、运行正文、音效与钟声时序对齐；旁白缺失或正文改动时仍生成完整字幕并退化为音效演出。
- `src/content/endingPerformanceLocal.ts`、`src/content/endingVoiceCatalog.ts`：读取本机旁白目录；目录由 `npm run export:ending-voice-catalog` 从验证报告重建，逐条校验文件、哈希、OggS 头与时长。
- `vite.config.ts`：`endingVoiceCatalogPlugin` 在构建时注入 `virtual:ending-voice-catalog`；目录损坏会阻止构建，公开构建缺少目录时注入空目录。
- `src/game/audio/EndingAudioPlayer.ts`：拥有本次演出的全部轨道与计时器，支持暂停/恢复、跳过、失败回退、音量分类、静默环境音、退出与重复进入的完全释放。
- `src/ui/ending/EndingOverlay.tsx`：共享回收与分支分段标题、当前段高亮与自动滚动、进度提示、跳过/重播/返回，结算只在演出结束后出现；没有旁白时完整字幕与结算立即可用，并提供独立的音效重播。
- `src/game/core/GameBootstrap.ts`：进入结局时先停掉对话语音，避免与旁白重叠。

### 公开版与本地旁白分离

公开仓库不等于允许独立再分发这 44 段生成音频，因此运行文件与目录都不入库：

- 44 个 OGG 保留在本地 `public/assets/audio/vo/ending/`；`endingVoiceCatalog.local.json` 由验证报告生成并被忽略，`npm run export:ending-voice-catalog` 会逐条核对哈希与时长。
- 共享回收字幕改为提交的 `src/content/endingTruthRecap.json`，并有测试确保它与制作文档逐段一致；分支字幕直接取自 `presentEnding`。
- 没有目录时，四个分支仍显示 6 段共享回收加完整分支正文，只播放该分支的标志性钟声、房间雨声与留声机空转；结局界面明确提示旁白未随版本提供。
- 本地完整版与公开版共用同一套回归页：有目录时验证高亮、暂停/继续、跳过、重播与 44 段旁白；没有目录时验证完整字幕、结算、仅原创音效请求和音频清理。

### 浏览器回归（本机 Chrome 157 无头）

首轮 `browser_01` 为 6 过 2 待复核，失败原因是测试脚本本身：首次渲染断言早于 React 提交，`--virtual-time-budget` 下原生音频元数据不会推进。保留首轮证据后，改为等待真实时间与页面完成标记重测：

- `browser_02`、`browser_03`、`browser_04` 均为 8/8 通过；截图与 DOM 见对应目录下的 `ending.png`、`dom.html`、`result.json`。
- `local_full_01`（本机有旁白目录）8/8 通过：四个分支字幕、当前段高亮、暂停/继续、跳过、重播、退出、自动播放拒绝回退、主静音、卸载释放，以及 Chrome 读取 2 段旁白＋13 份音效的实际时长。
- `clean_clone_01`（只含拟提交文件的全新克隆，无旁白目录）8/8 通过：四个分支完整字幕与结算立即可用，仅请求 13 份原创音效、没有旁白请求，自动播放拒绝与卸载清理正常。
- 回归中修正了两处真实 UI 问题：共享回收段标题与进度文字重复显示；首个按钮抢焦点存在误触跳过风险。

### 顺带修正的发布缺陷

`vite.config.ts` 的发布白名单原本只保留模型、渲染图、场景与贴图，**会把整个 `public/assets/audio/` 从生产构建中删除**，包括既有的 183 条对话语音。已加入 `audio` 根目录，并新增 `tests/publicAssetPublishing.test.ts` 防止回归；本地构建保留公开音频与 13 份原创音效，公开快照构建确认不含旁白目录。

## 尚未完成

1. 人工听读 44 段：发音、人名与船名、断句、情绪尺度与段间停顿。
2. 耳机与桌面音箱实机试听，尤其检查钟声与旁白的掩蔽关系。
3. 核实实际账号/订单与文案权利，落实玩家可见的 AI 提示，并确认最终交付格式的隐式标识。若要把 44 个旁白 OGG 上传到公开仓库，另外确认分发和再许可权利。
4. 真实玩家流程下的完整演出验证（现有浏览器回归使用隔离测试页，未跑通游戏内 B10 全流程）。
5. 若认为合成拟音写实度不足，替换为授权清楚的拟音录音，保留现有路径与时序。

历史记忆 CLI `nmem` 在当前终端不可用，因此以本文件保存制作范围与下一步，不声称已写回外部记忆。

结局演出、字幕与原创音效已提交；旁白 OGG 与本机目录按公开分发门禁保留在本地。下一步为完整人工试听和确认旁白标识；取得公开分发答复后再评估旁白入库。
