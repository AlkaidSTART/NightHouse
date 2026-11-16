# 音频资产

本目录管理《午夜别墅》的音频资产文档。每个资产使用一个独立目录，目录内必须有 `README.md`；README 是资产登记、AI 音效模型制作输入、验收和授权追踪的共同入口。

> 当前盘点（2026-11-16）：40/40 个已规划资产目录均有 README，并已完成全场景（10 个区域、12 扇门、36 个检视点、2 个核心谜题、8 个闪回、10 个回响、3 个结局）匹配审查与子变体提示词补全；正式运行音频文件尚未加入；素材来源与许可证仍待生成或选材后填写。`VO_NPC_Placeholder` 仍待配音方案确认。

## 分类索引

| 分类 | 内容 | 资产数 | 优先级分布 | 索引 |
|---|---|---:|---|---|
| 环境音 | 区域底噪、天气、空间氛围（覆盖全部 10 个场景区域） | 6 | P1 ×5，P2 ×1 | [ambience/README.md](./ambience/README.md) |
| 音效 | 交互、材质、钟表、留声机、门锁、剧情瞬间 | 29 | P0 ×5，P1 ×16，P2 ×8 | [sfx/README.md](./sfx/README.md) |
| 音乐 / 紧张层 | 可叠加的同调同速 tension stem（D 根音 / 60 BPM） | 4 | P1 ×3，P2 ×1 | [music/README.md](./music/README.md) |
| 语音 | NPC 对话（是否启用待音频方案确认） | 1 | 待定 ×1 | [vo/README.md](./vo/README.md) |

## 目录与文件约定

```text
assets/audio/<分类>/<资产目录>/README.md       # 文档、制作输入与验收记录
public/assets/audio/<分类>/<Asset_ID>.ogg      # 清理后的运行文件（主文件或单文件 AudioSprite）
```

- 资产目录名使用小写蛇形，例如 `sfx_glass_tap`。
- 资产 ID 和运行文件名使用 PascalCase，例如 `SFX_GlassTap`。
- 一个资产目录只对应一个稳定资产 ID；同一资产的动作分段或材质子变体（如开门/关门/锁死/铁门、钟表分步动作、脚步多变体）统一在该资产 README 的「子变体 / 分段生成提示词」中登记，不另起含义重叠的顶层目录。
- 原始 WAV、录音工程和外部下载可放在资产目录或外部归档中；大文件优先使用 Git LFS 或外部归档。
- `public/assets/audio/` 只放浏览器实际加载的运行文件，不放工程文件、临时文件或未授权素材。

## AI 音效模型批量生成规范（供下游生成模型直接读取）

当使用其他模型（如 ElevenLabs Sound Effects、Stable Audio、AudioGen、Foley 生成模型等）根据本目录文档生成音效时，必须遵守以下生成约束：

1. **时代与声学基调（1897 年维多利亚晚期石砌海崖宅邸）：**
   - 室内为深色木护墙板、厚地毯、石砌壁炉与高挑门厅；门厅与书房为早期电灯（旋钮/拨杆机械开关），其余为煤气灯与烛火。
   - **严禁现代音色**：禁止出现现代合成器旋律、电子蜂鸣 UI、现代塑料开关、冲锋衣摩擦、现代汽车/交通底噪或夸张的 Jump Scare 恐怖冲击音。
2. **多变体与多阶段音效（Set / Multi-stage）的输出格式：**
   - **单文件串联（推荐，适配 `public/assets/audio/<分类>/<Asset_ID>.ogg` 单路径）**：同一资产包含多个随机变体（如 `SFX_FootstepWood_Set` 的 4–6 步）或多个动作分段（如 `SFX_Clock_Mechanism`、`SFX_DoorOpenClose`）时，在单条音频中按顺序排列各子段，**每段之间保留 `0.4–0.5 秒` 纯静音（`-∞ dBFS`）**，供运行时 `AudioManager` 按时间戳（AudioSprite）切片播放。
   - **分文件独立生成后合并**：若下游模型单次生成单个短动作效果更好，请优先按各 README 中的「子变体 / 分段提示词（Sub-prompts）」逐条生成独立 WAV，再按 `0.4 秒` 静音间隔拼接为单个运行 `.ogg`，或按 `<Asset_ID>_< sub_id >.ogg` 导出并在 README 第 6 节登记时间戳。
3. **干声优先（Dry Close-Mic）原则：**
   - 除明确要求空间尾音的签名音（如 `SFX_Clock_Chime_Thirteen`）外，所有 3D 点声源与近场交互音（脚步、开关门、抽屉、纸张、钥匙、转盘）必须生成**近距离干声（close microphone, dry, no hall reverb）**，避免烘焙大混响导致在狭小房间（如无窗储物间 `villa_storage`）中失真。
4. **门厅落地钟的静默约束：**
   - 门厅落地钟在 `story.clock_repaired` 之前处于**停摆状态**。任何环境音（尤其是 `AMB_HallRainWindow_Loop` 和 `AMB_HouseNight_Loop`）**严禁**包含钟表滴答声或报时声，走钟声完全由独立的 `SFX_Clock_Tick_Loop` 控制。
5. **紧张层（Tension Stems）的调性与速度统一：**
   - `MUS_Tension_Base_Loop`、`MUS_Tension_Pulse_Loop`、`MUS_Tension_Shimmer_Loop`、`MUS_Tension_Sub_Swell` 必须统一以 **`D`（D1/D2 低频根音，无三音或暗淡 D 小调/弗里吉亚色彩）** 为音高中心，循环层统一为 **`60 BPM`、精确 `60.0 秒`**，确保多层叠加时不产生谐波打架或节奏漂移。

## 全场景音频覆盖总表（对齐 `villaGreybox.ts` 与 `inspectables.ts`）

### 1. 十个场景区域（`SceneRegion`）环境与脚步映射

| 区域 ID | 区域名称 | 主环境层（Ambience） | 叠加 / 滤波策略 | 地面材质与脚步资产 |
|---|---|---|---|---|
| `scene_gate` | 室外车道与门廊 | `AMB_CliffWindSea_Loop` | 叠加 `AMB_HallRainWindow_Loop`（室外雨声层，去室内混响，+2 dB） | 碎石车道/门廊石阶：`SFX_FootstepStone_Set` |
| `villa_hall` | 一层门厅（挑空） | `AMB_HallRainWindow_Loop` | 与全局 `AMB_HouseNight_Loop` 交叉淡化；修钟后挂载 3D `SFX_Clock_Tick_Loop` | 木地板/主楼梯：`SFX_FootstepWood_Set` |
| `villa_parlor` | 一层客厅 | `AMB_HallRainWindow_Loop` | 叠加壁炉点声源 `AMB_StudyFireRain_Loop`（低音量 -4 dB）；小座钟近场轻复用 `SFX_Clock_Tick_Loop`（+3 半音、-8 dB） | 木地板：`SFX_FootstepWood_Set`；壁炉前沙发区：`SFX_FootstepCarpet_Set` |
| `villa_dining` | 一层餐厅 | `AMB_HallRainWindow_Loop` | 叠加 `AMB_HouseNight_Loop`；偶发点缀 `SFX_DishesClink` | 木地板：`SFX_FootstepWood_Set` |
| `villa_corridor` | 一层走廊 & 二层回廊/走廊 | `AMB_CorridorCreak_Loop` | 与 `AMB_HouseNight_Loop` 叠加，保留长走廊反射感 | 走廊长地毯：`SFX_FootstepCarpet_Set`；二层回廊木板：`SFX_FootstepWood_Set` |
| `villa_study` | 一层书房 | `AMB_StudyFireRain_Loop` | 播放蜡筒时挂载 `SFX_Gramophone_Hiss_Loop` | 木地板：`SFX_FootstepWood_Set`；炉前新地毯：`SFX_FootstepCarpet_Set` |
| `villa_storage` | 一层储物间（无窗） | `AMB_HouseNight_Loop` | 仅保留 `AMB_HouseNight_Loop` 并施加 800 Hz 低通滤波，制造密闭无窗感 | 木地板：`SFX_FootstepWood_Set` |
| `villa_evelyn_room` | 二层伊芙琳卧室（暗窗） | `AMB_HouseNight_Loop` | 叠加低通滤波后的 `AMB_HallRainWindow_Loop`（-6 dB，表现厚窗帘隔绝的闷雨声） | 卧室地毯/木地板：`SFX_FootstepCarpet_Set` / `SFX_FootstepWood_Set` |
| `villa_bathroom` | 二层浴室 | `AMB_BathroomDrip_Loop` | 打开药柜触发 `echo_cold_spot` 时瞬时抽掉 300–1200 Hz 中频 | 瓷砖地面：`SFX_FootstepStone_Set`（干声微调 +1 半音） |
| `villa_cliff` | 西侧露台与寡妇崖 | `AMB_CliffWindSea_Loop` | 首次靠近栏杆叠加 `SFX_CliffHum` | 湿石阶与露台：`SFX_FootstepStone_Set` |

### 2. 闪回（`fb_*`）与回响（`echo_*`）音频组合映射

| 编号 | 触发场景 / 物件 | 过渡音 | 核心动作 / 氛围音效 |
|---|---|---|---|
| `fb_letter` | 开场读退信 | `SFX_FlashbackSwell` | `SFX_MatchCandle`（烛火）+ `SFX_PickupPaper` |
| `fb_summer` | 读伊芙琳旧信 | `SFX_FlashbackSwell` | `AMB_CliffWindSea_Loop`（切入 3 秒海风） |
| `fb_photo` | 检视客厅全家福 | `SFX_FlashbackSwell` | `SFX_PickupKey`（子变体：裁纸剪合拢咔嚓声）+ `SFX_PickupPaper` |
| `fb_fireplace` | 检视书房壁炉 | `SFX_FlashbackSwell` | `AMB_StudyFireRain_Loop`（火苗爆裂增强）+ `SFX_FabricRustle`（争执衣料摩擦） |
| `fb_pendulum` | 检视衣柜铜摆锤 | `SFX_FlashbackSwell` | `SFX_Clock_Mechanism`（停摆咔哒）+ `SFX_FabricRustle`（羊毛外套包裹） |
| `fb_luggage` | 检视储物间行李箱 | `SFX_FlashbackSwell` | `SFX_PickupPaper` + `SFX_FabricRustle` |
| `fb_gramophone` | 取得/播放蜡筒 | `SFX_FlashbackSwell` | `SFX_Gramophone_Play` + `SFX_Gramophone_Hiss_Loop` |
| `fb_cliff` | 检视崖边纪念石 | `SFX_FlashbackSwell` | `AMB_CliffWindSea_Loop` + 远景低通 `SFX_Clock_Chime_Thirteen`（单响尾音） |
| `echo_clock_thirteen` | 修好落地钟 / 午夜 | `MUS_Tension_Sub_Swell` | `SFX_Clock_Chime_Thirteen` + `SFX_Clock_Mechanism`（暗格弹开） |
| `echo_mirror_delay` | 经过一层走廊镜 | — | `SFX_GlassTap` + `AMB_CorridorCreak_Loop` |
| `echo_piano_note` | 接近客厅钢琴 | — | `SFX_PianoSingleNote`（中央 C4 单音；备选 `SFX_MusicBoxNote`） |
| `echo_study_lamp` | 首次进入书房 | — | `SFX_LightSwitch`（早期电灯开关咔哒与微弱电流闪动） |
| `echo_cliff_song` | 靠近露台栏杆 | — | `AMB_CliffWindSea_Loop` + `SFX_CliffHum` |
| `echo_photo_glare` | 侧看全家福 | — | `SFX_GlassTap` |
| `echo_door_ajar` | 经过二楼走廊 | — | `SFX_DoorCreak`（卧室门缓开一条缝） |
| `echo_gramophone` | 拿到蜡筒后进书房 | `MUS_Tension_Sub_Swell` | `SFX_Gramophone_Hiss_Loop` + `MUS_Tension_Shimmer_Loop` |
| `echo_cold_spot` | 打开浴室药柜 | — | `SFX_DrawerOpenClose` + `AMB_BathroomDrip_Loop`（瞬间抽中频）+ `SFX_GlassTap` |
| `echo_footsteps` | 门厅/走廊静止 10s | — | `SFX_FootstepWood_Set`（二楼远景低通滤波 + 木梁吱呀） |

## 每个 README 必须包含

1. 资产 ID、中文名称、类型、优先级和制作状态。
2. 使用位置、剧情依赖和用途，且能说明其服务于探索、NPC 互动、线索、谜题或剧情推进中的哪一项。
3. 可执行的制作输入：主生成提示词、子变体/分段提示词（如适用）、负向提示词、授权素材库检索词、录音要求或明确的占位原因。
4. 音频技术规格：时长、源文件与运行格式、声道、响度、循环、总线、空间化和运行路径。
5. 生成后的试听与浏览器接入检查。
6. 来源、作者、许可证、商用许可、署名要求、日期、修改说明和原始文件位置。
7. 混音边界、替代方案、已知风险或待确认事项。

只写提示词而没有用途、规格、验收和授权记录的 README，不算完成。

## 通用技术规范

- 源文件：48 kHz / 24-bit WAV；运行文件：48 kHz OGG Vorbis。
- 声道：近距离交互音优先单声道；环境、音乐、UI 和需要固定立体声画面的音频使用立体声。
- 响度：环境约 -20 LUFS，音乐 -23～-20 LUFS；一次性音效按峰值控制，详见各资产 README。
- 循环：环境音与 tension stem 必须无缝循环；所有 tension stem 使用相同长度和循环点。
- 自动播放：浏览器要求用户主动开始游戏后，才能初始化或恢复音频上下文。
- 播放入口：统一由 `AudioManager` 管理；区域环境、紧张层和一次性音效分别通过明确控制器接入。
- 暂停与释放：暂停、场景切换和资源释放时必须停止或淡出对应声音，避免重复播放和泄漏。

## 建议的接入边界

- `AudioManager`：音频上下文、总线音量、暂停与恢复、资源释放。
- `AmbienceController`：区域环境循环的交叉淡化。
- `TensionDirector`：根据剧情标记输出 0–3 的紧张强度，控制 stem 叠加。
- `SfxPlayer`：一次性音效、随机变体、3D 定位与距离衰减。

以上模块当前属于接入设计，不代表已经实现。实际实现前仍需完成音频系统与设置界面。

## 新增或替换资产

1. 先确认资产属于现有 40 项之一，或已有明确的剧情/玩法用途。
2. 复制 [AUDIO_ASSET_README_TEMPLATE.md](../_templates/AUDIO_ASSET_README_TEMPLATE.md) 到对应分类下的新资产目录，并命名为 `README.md`。
3. 填写稳定资产 ID、用途、制作输入和技术规格，再在分类 README 的索引表中登记。
4. 选中或生成素材后，立即填写来源、许可证、署名要求和原始文件位置。
5. 按 README 第 4 节完成试听、格式和浏览器接入检查。
6. 只把最终运行文件放到 `public/assets/audio/<分类>/`，并确认路径与 README 一致。

## 状态与完成标准

- **待生成**：规格和制作输入已明确，但尚无合格音频。
- **待音频方案确认**：是否制作、语言或表现形式尚未决定，不得提前制作正式内容。
- **待验收**：已有运行文件，尚未完成试听、格式或浏览器接入检查。
- **已完成**：运行文件存在、路径一致、验收通过，且来源与许可证记录完整。

当前所有资产仍处于“待生成”或“待音频方案确认”，不能把目录和 README 的存在视为音频已经交付。
