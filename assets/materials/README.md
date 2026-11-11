# 材质组合

材质由贴图集和引擎参数组合而成，通常不需要单独生成模型。建议先完成贴图，再在 PlayCanvas 中建立材质资产。

| 材质 ID | 基础贴图 | 用途 | 关键参数 |
|---|---|---|---|
| MAT_Wall_OldPlaster | T_Wall_OldPlaster_01 | 墙体、门框、天花板 | 高粗糙度，低金属度 |
| MAT_Floor_WoodWorn | T_Floor_WoodWorn_01 | 地板、楼梯踏步 | 中高粗糙度，法线 |
| MAT_Wood_Dark | T_Wood_Mahogany_01 | 护墙板、门扇、书架、家具、相框 | 中粗糙度，无地板拼缝 |
| MAT_Stone_Ashlar | T_Stone_Ashlar_01 | 外墙切石、烟囱、门柱、露台栏杆 | 中高粗糙度，深灰缝法线 |
| MAT_Roof_Slate | T_Roof_Slate_01 | 陡坡屋面石板瓦、门廊坡顶 | 雨夜半湿粗糙度，叠瓦法线 |
| MAT_Ground_WetMud | T_Ground_WetMud_01 | 雨夜地面、前院草坪与山体土石 | 积水低粗糙度斑块 |
| MAT_Foliage_Pine | T_Foliage_Pine_01 | 枯树篱、海岸黑松 | 高粗糙度，针叶法线 |
| MAT_Fabric_Worn | T_Fabric_Worn_01 | 波斯走廊地毯、沙发、床品窗帘 | 高粗糙度，提花纹样 |
| MAT_Metal_Tarnished | T_Grime_DustWear_Set_01 | 铁艺大门、灯具、留声机铜号角、保险箱 | 高金属度，氧化擦痕 |
| MAT_Tile_Bathroom | T_Tile_Bathroom_01 | 浴室墙地砖 | 釉面低粗糙度，砖缝高粗糙度 |
| MAT_Glass_Dirty | 无（引擎材质） | 窗玻璃、灯罩 | 透明，低粗糙度，注意排序 |

## 注意事项

- 同一材质尽量复用，不要为每个物体复制一套贴图。
- 透明材质数量要克制，避免排序问题和额外绘制开销。
- 材质参数应在目标浏览器中实际观察，不要只凭编辑器预览。
