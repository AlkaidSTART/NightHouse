# SFX_PickupPaper · 拾取 / 翻动纸张

> 资产类型：音效 ｜ 优先级：P0 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_PickupPaper` |
| 使用位置 | 信件、诊疗记录、遗嘱副本、旧报纸堆 `INT_prop_newspaper_stack`、保险箱账本与保单 `INT_prop_safe`、书桌摊开证据 `INT_prop_study_desk_drawer`、门厅签字桌 `INT_prop_signing_table`（B10 签字/拒签） |
| 依赖 / 复用 | 所有文件类可检视物打开、线索获取及 B10 终局签署/拒签演出 |
| 剧情用途 | 为信件/纸张检视、把核心书证并排摊在桌面（`story.case_ready` / `story.evidence_presented`）以及午夜在遗嘱上签下「艾略特·维恩」或放下蘸水笔提供细腻的触觉反馈 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**合集主提示词（单文件 4 段式，每段间隔 0.5 秒静音）：**

```text
Four distinct close-mic antique paper and document handling sounds separated by half-second silences: (1) picking up and unfolding a crisp folded 1890s cotton-rag letter sheet; (2) placing a heavy leather-bound shipping ledger and a bundle of insurance documents firmly onto a wooden desk; (3) rustling through a stack of dry brittle old newspapers; (4) a metal fountain dip pen scratching a signature on thick parchment will paper and setting the wooden pen down on the table. Dry close recording, no music, no voices.
```

**分段独立生成提示词（Sub-prompts）：**

- **Sub-1 `letter_unfold`（拾取/展开单张信件、诊疗记录、船员名单、半张照片，时长 0.9 秒）：**
  ```text
  Picking up and unfolding a dry antique folded cotton-rag letter paper, crisp soft paper fiber crease, close microphone, dry, no music, no voices.
  ```
- **Sub-2 `ledger_bundle_place`（取出保险箱厚账本/保单 `INT_prop_safe`，或在书桌/门厅签字桌把证据一件件摊在桌上 `story.case_ready` / `ending_refused` strong，时长 1.2 秒）：**
  ```text
  Setting a heavy cloth-bound accounting ledger and a tied bundle of parchment papers firmly onto a mahogany table, solid paper weight thump and cord slide, close mic, dry, no music.
  ```
- **Sub-3 `newspaper_stack`（翻看储物间旧报纸堆 `INT_prop_newspaper_stack`，时长 1.0 秒）：**
  ```text
  Lifting and shifting dry yellowing 19th-century broadsheet newspapers in a stack, brittle newsprint rustle, close mic, dry, no music.
  ```
- **Sub-4 `pen_sign_and_drop`（门厅签字桌 B10：`ending_signed` 蘸水笔签下姓名，或 `ending_refused` 把笔放下、把遗嘱推到桌中，时长 1.6 秒）：**
  ```text
  Steel nib dip pen scratching a short signature across heavy parchment paper, followed by placing the wooden pen holder down onto a wooden desk and sliding the document away, close mic, dry, no music.
  ```

**负向提示词（Negative prompt）**

```text
paper tearing violently, crumpling trash ball, modern ballpoint click, printer sound, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** antique letter unfold, heavy ledger place on desk, old newspaper stack rustle, dip pen writing on parchment

## 2. 用途

为线索获取提供轻柔但明确的反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.5–1.2 秒 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_PickupPaper.ogg |

## 4. 生成后检查

- [ ] 时长、源文件格式、运行格式和响度符合规格
- [ ] 无削波、爆音和明显底噪
- [ ] 循环接缝无缝（如要求）
- [ ] 没有意外的音乐、人声或可识别版权内容
- [ ] 在耳机和桌面音箱上分别试听
- [ ] 浏览器中通过 `AudioManager` 播放测试通过
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

不要使用过度夸张的纸张声；线索反馈还可以叠加 UI 提示音。
