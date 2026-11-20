# 结局音效 · 原创程序合成

状态：13 份运行 OGG 已生成并通过解码检查；主观写实程度仍待人工试听。

这些音频由项目脚本 `scripts/generateEndingSfx.mjs` 原创生成，没有使用素材库、第三方录音或外部生成服务。允许用途遵循本仓库项目资产的使用约定，不额外要求第三方署名；不为本仓库另行授予开源许可证。

生成记录与参数：`generation_procedural_01.json`；确定性种子 `18971113`。源 WAV 位于忽略提交的 `source/procedural_01/`；运行音频位于 `public/assets/audio/sfx/ending/`，48 kHz 单声道 OGG Vorbis q5。钟声使用衰减正弦分音与轻微失谐，其他声音使用带限噪声、瞬态与包络。它们是合成拟音，不能描述为真实维多利亚落地钟或历史现场录音。

| 文件 | 用途 |
|---|---|
| clock_standard | 标准单响，3.6 秒 |
| clock_thirteenth | 第十三下变体，轻微失谐，6 秒尾音 |
| clock_twelve | 弱拒签严格十二下，间隔 1.35 秒 |
| clock_thirteen | 隐藏结局十三下，最后一响为变体 |
| clock_thirteen_distant | 签署结局低音量十三下 |
| signed_pen / signed_fold | 笔尖与折纸 |
| refused_evidence / refused_stairs | 证据落桌与楼梯脚步 |
| refused_latch / refused_departure | 门锁与离开脚步 |
| room_rain / gramophone_hiss | 克制的房间雨声与留声机空转，可循环 |

钟声整段的采样级排列保证次数不受浏览器定时器影响。运行时分别调整旁白、音效和底噪音量；所有可跳过的声音均随结局关闭释放，不在玩家退出后继续播放。原始波形峰值与运行文件哈希见生成记录，严格解码、编码后响度见 `assets/audio/vo/vo_ending/verification_production_01.json`。

本轮只为结局制作这些音效，没有将它们自动接入探索阶段的门、钟谜题或其他交互，避免扩展改动范围。正式发布前仍需耳机与普通音箱试听；如写实程度不足，应替换为授权清楚的拟音录音，保留当前稳定路径和播放时序。
