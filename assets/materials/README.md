# 材质组合

材质由贴图集和引擎参数组合而成，通常不需要单独生成模型。建议先完成贴图，再在 PlayCanvas 中建立材质资产。

| 材质 ID | 基础贴图 | 用途 | 关键参数 |
|---|---|---|---|
| MAT_Wall_OldPlaster | T_Wall_OldPlaster_01 | 墙体、门框、天花板 | 高粗糙度，低金属度 |
| MAT_Floor_WoodWorn | T_Floor_WoodWorn_01 | 地板、楼梯 | 中高粗糙度，轻微法线 |
| MAT_Fabric_Worn | T_Fabric_Worn_01 | 沙发、床品 | 高粗糙度，无金属度 |
| MAT_Wood_Dark | T_Floor_WoodWorn_01（调整色调） | 家具、门、相框 | 中粗糙度，低金属度 |
| MAT_Metal_Tarnished | T_Grime_DustWear_Set_01（叠加） | 灯具、钥匙、把手 | 中金属度，高粗糙度 |
| MAT_Glass_Dirty | 无（引擎材质） | 窗玻璃、灯罩 | 透明，低粗糙度，注意排序 |

## 注意事项

- 同一材质尽量复用，不要为每个物体复制一套贴图。
- 透明材质数量要克制，避免排序问题和额外绘制开销。
- 材质参数应在目标浏览器中实际观察，不要只凭编辑器预览。
