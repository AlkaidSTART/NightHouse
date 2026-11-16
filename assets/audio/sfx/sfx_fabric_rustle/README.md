# SFX_FabricRustle · 衣物与床单摩擦

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_FabricRustle` |
| 使用位置 | 门厅最里侧湿斗篷 `INT_prop_cloak`、餐厅第 13 席椅背灰羊毛披肩 `INT_prop_shawl`、书房炉前厚地毯 `INT_prop_study_rug`、卧室衣柜旧羊毛外套 `INT_prop_wardrobe`、浴室毛巾架旧毛巾 `INT_prop_towel_rack`；以及闪回 `fb_fireplace`（争执拉扯衣袖）、`fb_pendulum`（用羊毛外套裹住摆锤）、`fb_luggage` |
| 依赖 / 复用 | 织物类可检视物与闪回演出 |
| 剧情用途 | 服务于多处核心双读线索：门厅潮湿的 `E.A.` 羊毛斗篷、裹着铜摆锤的厚外套、餐厅第 13 席的羊毛披肩、浴室洗不净暗渍的旧毛巾，以及那晚用床单裹尸抬下楼的织物摩擦感 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

```text
Four distinct close-mic antique textile foley variations separated by 0.4-second silences: (1) lifting the heavy damp hem of an old Victorian wool cloak; (2) unfolding a thick wool coat wrapped around a heavy object; (3) soft linen bedsheet and wool shawl movement; (4) handling a folded coarse cotton towel. Warm muted natural fibers, strictly no modern synthetic nylon swish, dry close microphone, no music, no voices.
```

**负向提示词（Negative prompt）**

```text
synthetic nylon jacket swish, Gore-Tex rustle, zipper, velcro, tearing cloth, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** heavy wool cloak rustle, antique coat fabric movement, linen bedsheet foley, cotton towel unfold, close mic dry

## 2. 用途

衣柜、行李箱、床单裹尸闪回和窗帘的细节层。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.5–1.5 秒（4 个变体） |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -8 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_FabricRustle.ogg |

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

- 触发：衣柜、行李箱、闪回演出。
- 总线：SFX。
- 空间化：3D 点声源或 2D 闪回层。
- 避免听起来像现代冲锋衣；旧羊毛要闷、粗、短。
