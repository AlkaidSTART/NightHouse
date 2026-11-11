# 贴图与 2D 内容

本目录收录「贴图与 2D 内容」类资产。每个子目录对应一个资产，README 中可直接复制生成提示词。

| 优先级 | 资产 ID | 名称 | 状态 |
|---|---|---|---|
| P0 | [T_Wall_OldPlaster_01](./t_wall_old_plaster/README.md) | 旧灰泥墙面贴图 | 已生成 |
| P0 | [T_Floor_WoodWorn_01](./t_floor_wood_worn/README.md) | 旧木地板贴图 | 已生成 |
| P0 | T_Wood_Mahogany_01 | 桃花心木 / 胡桃木细木工贴图（护墙板、门扇、家具） | 已生成 |
| P0 | T_Stone_Ashlar_01 | 维多利亚切石砌体外墙贴图 | 已生成 |
| P0 | T_Roof_Slate_01 | 深灰蓝石板瓦屋面贴图 | 已生成 |
| P1 | T_Ground_WetMud_01 | 雨夜泥地 / 湿草丛与苔藓地面贴图 | 已生成 |
| P1 | T_Foliage_Pine_01 | 海岸黑松针叶与松枝贴图 | 已生成 |
| P1 | T_Foliage_Hedge_01 | 庄园修剪树篱与灌木叶片贴图 | 已生成 |
| P1 | T_Bark_Pine_01 | 海岸老松树皮与枯木青苔树皮贴图 | 已生成 |
| P1 | [T_Fabric_Worn_01](./t_fabric_worn/README.md) | 维多利亚提花地毯与旧织物贴图 | 已生成 |
| P1 | T_Tile_Bathroom_01 | 浴室小规格瓷砖贴图 | 已生成 |
| P2 | [T_Grime_DustWear_Set_01](./t_grime_dust_wear_set/README.md) | 旧金属铜锈 / 铁艺磨损贴图 | 已生成 |
| P0 | [TEX_Document_LetterPage](./documents/tex_document_letter_page/README.md) | 信件页面（2D 内容） | 已生成底图 |
| P0 | [TEX_Document_DiaryPage](./documents/tex_document_diary_page/README.md) | 日记内页（2D 内容） | 已生成底图 |
| P1 | [TEX_Document_PhotoImage](./documents/tex_document_photo_image/README.md) | 照片图像内容（2D 内容） | 已生成 |

## 线索与场景 2D 内容（`public/assets/textures/documents/`）

以下内容通过通用纸张 / 书籍 / 相框 / 石碑载体 + 专属 2D 贴图与 UI 呈现，不单独建 3D 模型。完整对应关系见 [V1.1 清单](../../docs/午夜别墅_3D资产与建模清单_v1.1.md) 第 16 节。

| 优先级 | 2D 资产 ID | 对应线索 / 用途 | 状态 |
|---|---|---|---|
| P0 | TEX_Document_Will | `clue_will_clause`（餐厅长桌 / 门厅签字桌遗嘱副本底图） | 已生成 |
| P0 | TEX_Document_TideTable | `clue_tide_table`（书房墙面 1897 灰港潮汐表） | 已生成 |
| P0 | TEX_Document_MedicalRecord | `clue_medical_record`（书房书桌格雷医生诊疗记录底图） | 已生成 |
| P0 | TEX_Document_ShippingLedger | `clue_shipping_ledger`（航运账本对开表格与赤字红框底图） | 已生成 |
| P0 | TEX_Document_InsurancePolicy | `clue_insurance_policy`（北方联合海事保险保单底图） | 已生成 |
| P0 | TEX_Document_CaptainsLog | `clue_captains_log`（马丁·肖船长日志内页底图） | 已生成 |
| P0 | TEX_Document_CrewNames | `clue_crew_names`（四名遇难船员名单折纸底图） | 已生成 |
| P0 | TEX_Document_ShipPainting / TEX_Document_ShipPainting_Back | `clue_ship_painting`（客厅「珀耳塞福涅号」油画正面与背面罗马数字题记） | 已生成 |
| P0 | TEX_Document_FamilyPortrait | `clue_family_photo`（客厅壁炉上方被剪去右侧的全家福） | 已生成 |
| P1 | TEX_Document_Newspaper | `clue_newspaper`（储物间 1896.03.16《灰港纪事》沉船报道） | 已生成 |
| P1 | TEX_Document_CutPhoto | `clue_family_photo`（伊芙琳卧室梳妆镜背面被剪下的半张照片） | 已生成 |
| P1 | TEX_Document_OldLetters | `clue_evelyn_old_letters`（系麻绳与干枯灰港石楠花的旧信件捆） | 已生成 |
| P1 | TEX_MemorialStone_Inscription | 结局演出（寡妇崖纪念石碑面风化铭文） | 已生成 |
| P2 | TEX_Document_WaxCylinderLabel | `clue_gramophone_cylinder`（留声机蜡筒盒盖手写 `E.` 标签） | 已生成 |

`TEX_Document_LetterPage` 需支持警告信、举报信初稿和保险商信稿三个文本变体。
