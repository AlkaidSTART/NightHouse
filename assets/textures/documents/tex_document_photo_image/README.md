# TEX_Document_PhotoImage · 照片图像内容（2D 内容）

> 资产类型：PBR 贴图 / 2D 图像 ｜ 优先级：P1 ｜ 状态：待生成

| 项目 | 内容 |
|---|---|
| 使用位置 | 照片道具、相框的可替换图像 |
| 依赖 / 复用 | 无 |

## 快速使用

复制提示词 → 在图像生成工具中生成 → 按规格裁切和调色 → 导出 PNG / WebP → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
A vintage black-and-white family photograph, slightly blurred and grainy, faded sepia tones, soft vignette, people and setting intentionally indistinct, no readable text, high resolution scan.
```

**负向提示词（Negative prompt）**

```text
readable text, handwriting, calligraphy, signature, watermark, logo, shadow, perspective, object, hands, background scene, low detail, blurry
```

## 2. 用途

提供通用照片道具的视觉内容。人物、年代和构图以世界观 V0.7 与故事线 V0.7 为准；**全家福** 与 **被剪半张照片** 使用独立贴图 `TEX_Document_FamilyPortrait`、`TEX_Document_CutPhoto`。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 分辨率 | 1K–2K |
| 贴图通道 | BaseColor |
| 平铺 | 不平铺 |
| 色彩空间 | BaseColor 使用 sRGB；Normal / Roughness / AO 使用线性 |
| 导出格式 | PNG / WebP（按通道） |
| 运行路径 | public/assets/textures/documents/TEX_Document_PhotoImage.png |

## 4. 生成后检查

- [ ] 分辨率、比例和色彩空间符合规格
- [ ] 没有透视、阴影或背景物体
- [ ] 没有烘焙最终剧情文字；正文使用可替换文字层或 UI
- [ ] 边缘、纸张纹理和做旧效果自然
- [ ] 导出格式和文件体积符合预算
- [ ] 在目标分辨率下检查可读性
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

照片内容会直接传递剧情信息。本贴图只做通用照片；全家福、半张照片和油画分别使用独立贴图，不要把不同剧情信息混在同一张图里。
