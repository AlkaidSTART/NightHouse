# SFX_DrawerOpenClose · 抽屉开合

> 资产类型：音效 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 资产 ID | `SFX_DrawerOpenClose` |
| 使用位置 | 书房书桌最下层抽屉 `INT_prop_study_desk_drawer`、卧室梳妆台抽屉与蜡筒木盒 `INT_prop_vanity_drawer`、卧室大衣柜 `INT_prop_wardrobe`、浴室药柜 `INT_prop_medicine_cabinet`、储物间行李箱 `INT_prop_luggage` 与旧物箱 `INT_prop_old_items_box` |
| 依赖 / 复用 | 家具容器类检视点（`InspectPanel` 打开时触发） |
| 剧情用途 | 精确匹配场景文本中的容器差异：如书房「最下层抽屉卡了一下才拉开」、梳妆台「抽屉里压着一只木盒」、卧室「打开衣柜」以及浴室「打开药柜」 |

## 快速使用

复制提示词到 AI 音效工具，或按检索关键词在授权音频库搜索。外部资源同样要填写授权记录。

## 1. 英文生成提示词（可直接用于 AI 音效工具）

**合集主提示词（单文件 4 段式，每段间隔 0.5 秒静音）：**

```text
Four distinct close-mic antique Victorian wooden furniture opening sounds separated by half-second silences: (1) a heavy wooden desk bottom drawer sticking slightly on its runners before sliding open with a brass pull clink; (2) a lighter wooden vanity drawer sliding open and lifting a small hinged wooden jewelry box lid; (3) a tall mahogany wardrobe cabinet door unlatching and creaking open; (4) a small wall-mounted wooden medicine cabinet door opening with a light glass-and-wood click. Dry close recording, no music, no voices.
```

**分段独立生成提示词（Sub-prompts）：**

- **Sub-1 `stuck_desk_drawer`（书房书桌最下层抽屉 `INT_prop_study_desk_drawer`：「最下层抽屉卡了一下才拉开」，时长 1.3 秒）：**
  ```text
  Old wooden desk drawer sticking briefly against dry wood runners, a firm tug overcoming resistance, then sliding open with a brass drop-handle clink, close mic, dry, no music.
  ```
- **Sub-2 `vanity_drawer_and_box`（卧室梳妆台抽屉与蜡筒木盒 `INT_prop_vanity_drawer` / 储物间旧物箱 `INT_prop_old_items_box`，时长 1.2 秒）：**
  ```text
  Small antique wooden vanity drawer sliding open smoothly followed by unclasping a small velvet-lined wooden box lid, close mic, dry, no music.
  ```
- **Sub-3 `wardrobe_door`（卧室大衣柜门 `INT_prop_wardrobe`，时长 1.4 秒）：**
  ```text
  Tall antique mahogany wardrobe door latch releasing and hollow wooden cabinet door swinging open with a low wood creak, close mic, dry, no music.
  ```
- **Sub-4 `medicine_cabinet_and_trunk`（浴室墙面药柜 `INT_prop_medicine_cabinet` / 储物间行李箱扣 `INT_prop_luggage`，时长 0.9 秒）：**
  ```text
  Small wooden wall medicine cabinet door opening with a light magnetic/brass catch click and subtle wood stop, close mic, dry, no music.
  ```

**负向提示词（Negative prompt）**

```text
modern metal ball-bearing office drawer, slam shut, glass breaking, music, melody, vocals, speech, sudden loud noises, clipping, distortion, heavy reverb, cartoon sound, low quality
```

**检索关键词：** stuck wooden desk drawer slide, antique wardrobe door open, small wooden box lid, medicine cabinet door click

## 2. 用途

为可调查家具提供开合反馈。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 时长 | 0.8–1.8 秒 |
| 格式 | 源文件 WAV：单声道 / 48 kHz / 24-bit；运行文件 OGG Vorbis：单声道 / 48 kHz |
| 响度 | 峰值低于 -6 dBFS |
| 循环 | 不循环 |
| 运行路径 | public/assets/audio/sfx/SFX_DrawerOpenClose.ogg |

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

抽屉和柜门可共用一条素材，但柜门应使用更低沉、更短的声音。
