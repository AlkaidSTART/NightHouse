# TEX_Document_DiaryPage · 日记内页（2D 内容）

> 资产类型：PBR 贴图 / 2D 图像 ｜ 优先级：P0 ｜ 状态：可先生成空白纸张

| 项目 | 内容 |
|---|---|
| 使用位置 | 日记道具的内页贴图 / UI 查看图 |
| 依赖 / 复用 | 无 |

## 快速使用

复制提示词 → 在图像生成工具中生成 → 按规格裁切和调色 → 导出 PNG / WebP → 放到「运行路径」。

## 1. 英文生成提示词（复制以下内容，可直接用于 Meshy / Tripo / Rodin 等）

```text
An aged diary page texture, blank off-white paper with faint ruled lines, subtle foxing, creases and worn edges, top-down flat scan, no readable text, no handwriting, even lighting, high resolution.
```

**负向提示词（Negative prompt）**

```text
readable text, handwriting, calligraphy, signature, watermark, logo, shadow, perspective, object, hands, background scene, low detail, blurry
```

## 2. 用途

提供伊芙琳日记页面的纸张和排版底图。最后几页记录日期、船名与四人名单，对应 `clue_evelyn_diary` 和 `clue_crew_names`。

## 3. 技术规格

| 项目 | 要求 |
|---|---|
| 分辨率 | 2K（2048 × 2896，A4 比例） |
| 贴图通道 | BaseColor（含纸张纹理和浅色横线） |
| 平铺 | 不平铺 |
| 色彩空间 | BaseColor 使用 sRGB；Normal / Roughness / AO 使用线性 |
| 导出格式 | PNG / WebP（按通道） |
| 运行路径 | public/assets/textures/documents/TEX_Document_DiaryPage.png |

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

日记正文以故事线 V0.7 为准。先生成空白页底图，后续用 UI 排版或替换文字层；不要把长段剧情文案烘焙进底图。
