# TEX_Document_LetterPage · 信件页面（2D 内容）

> 资产类型：PBR 贴图 / 2D 图像 ｜ 优先级：P0 ｜ 状态：可先生成空白纸张

| 项目 | 内容 |
|---|---|
| 使用位置 | 信件道具的正面贴图 / UI 查看图 |
| 依赖 / 复用 | 无 |

## 快速使用

复制提示词 → 在图像生成工具中生成 → 按规格裁切和调色 → 导出 PNG / WebP → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
An aged A4 letter page texture, blank yellowed paper with subtle creases, foxing, uneven edges and faint fiber texture, top-down flat scan, no readable text, no handwriting, even lighting, high resolution.
```

**负向提示词（Negative prompt）**

```text
readable text, handwriting, calligraphy, signature, watermark, logo, shadow, perspective, object, hands, background scene, low detail, blurry
```

## 2. 用途

提供可阅读的信件页面。同一纸张底图需支持三个文本变体：**伊芙琳的警告信**（`clue_evelyn_letter`，含信封背面与邮戳）、**举报信初稿** 和 **保险商信稿**。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 分辨率 | 2K（2048 × 2896，A4 比例） |
| 贴图通道 | BaseColor（含纸张纹理） |
| 平铺 | 不平铺 |
| 色彩空间 | BaseColor 使用 sRGB；Normal / Roughness / AO 使用线性 |
| 导出格式 | PNG / WebP（按通道） |
| 运行路径 | public/assets/textures/documents/TEX_Document_LetterPage.png |

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

正文属于剧情内容，文本以故事线 V0.7 为准。建议用独立文字层或 UI 渲染，不要把最终文案直接烘焙进底图；三个变体共用纸张底图，只替换文字层。
