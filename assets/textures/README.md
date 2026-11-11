# 贴图与 2D 内容

本目录收录「贴图与 2D 内容」类资产。每个子目录对应一个资产，README 中可直接复制生成提示词。

| 优先级 | 资产 ID | 名称 | 状态 |
|---|---|---|---|
| P0 | [T_Wall_OldPlaster_01](./t_wall_old_plaster/README.md) | 旧灰泥墙面贴图 | 待生成 |
| P0 | [T_Floor_WoodWorn_01](./t_floor_wood_worn/README.md) | 旧木地板贴图 | 待生成 |
| P1 | [T_Fabric_Worn_01](./t_fabric_worn/README.md) | 旧布料贴图 | 待生成 |
| P1 | T_Tile_Bathroom_01 | 浴室小规格瓷砖贴图 | 待建 |
| P2 | [T_Grime_DustWear_Set_01](./t_grime_dust_wear_set/README.md) | 灰尘 / 污渍 / 磨损叠加贴图 | 暂缓 |
| P0 | [TEX_Document_LetterPage](./documents/tex_document_letter_page/README.md) | 信件页面（2D 内容） | 可先生成空白纸张 |
| P0 | [TEX_Document_DiaryPage](./documents/tex_document_diary_page/README.md) | 日记内页（2D 内容） | 可先生成空白纸张 |
| P1 | [TEX_Document_PhotoImage](./documents/tex_document_photo_image/README.md) | 照片图像内容（2D 内容） | 待生成 |

## 待补 2D 内容

以下内容通过通用纸张 / 书籍 / 相框载体 + 可替换贴图或 UI 呈现，不单独建 3D 模型。完整对应关系见 [V1.1 清单](../../docs/午夜别墅_3D资产与建模清单_v1.1.md) 第 16 节。

| 优先级 | 2D 资产 ID | 对应线索 / 用途 |
|---|---|---|
| P0 | TEX_Document_Will | `clue_will_clause` |
| P0 | TEX_Document_TideTable | `clue_tide_table` |
| P0 | TEX_Document_MedicalRecord | `clue_medical_record` |
| P0 | TEX_Document_ShippingLedger | `clue_shipping_ledger` |
| P0 | TEX_Document_InsurancePolicy | `clue_insurance_policy` |
| P0 | TEX_Document_CaptainsLog | `clue_captains_log` |
| P0 | TEX_Document_CrewNames | `clue_crew_names` |
| P0 | TEX_Document_ShipPainting | `clue_ship_painting`（正面 / 背面两张） |
| P0 | TEX_Document_FamilyPortrait | `clue_family_photo` |
| P1 | TEX_Document_Newspaper | `clue_newspaper` |
| P1 | TEX_Document_CutPhoto | `clue_family_photo` |
| P1 | TEX_Document_OldLetters | `clue_evelyn_old_letters` |
| P1 | TEX_MemorialStone_Inscription | 结局演出 |
| P2 | TEX_Document_WaxCylinderLabel | `clue_gramophone_cylinder` |

`TEX_Document_LetterPage` 需支持警告信、举报信初稿和保险商信稿三个文本变体。
