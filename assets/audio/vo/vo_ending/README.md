# 结局旁白 · 来源与授权复核

复核日期：2026-11-20。范围为 `production_01` 的 44 段正式旁白，不覆盖试听样片、既有 NPC 语音或 13 份项目原创结局音效。

## 资产来源

- **生成方与日期**：2026-11-20 由阿里云百炼华北 2（北京）的正式语音合成 HTTP API 生成。[官方模型页](https://help.aliyun.com/zh/model-studio/qwen-audio-3-1-tts-plus)列明推理服务供应商是阿里云百炼，且该模型不支持模型广场体验。
- **模型与音色**：`qwen-audio-3.1-tts-plus`；[官方音色表](https://help.aliyun.com/zh/model-studio/qwen-audio-tts-voice-list#qwen-tts31-plus-voices)的系统音色龙安灵心 `longanlingxin_v3.1`。输入为项目结局文案和表演指令，未上传参考录音或使用自行复刻的音色。
- **资产追溯**：[批次生成记录](./generation_production_production_01.json)的 44 个段落与 `public/assets/audio/vo/ending/` 下 44 个 OGG 文件名一致。原始 WAV 保存于本地 `source/production_01/`，不入库；运行资产的处理为修正副本 WAV 封装长度、响度处理并转为 48 kHz 单声道 OGG Vorbis。
- **当前入库方式**：44 个运行 OGG 与 `endingVoiceCatalog.local.json` 只在本机保留，均被 `.gitignore` 忽略。本机运行 `npm run export:ending-voice-catalog` 从验证报告重建目录，并逐条校验文件、哈希、OggS 头与时长；构建时由 Vite 注入，目录损坏会直接阻止构建。公开构建没有目录时，四个结局仍显示完整字幕并播放项目原创音效，不请求旁白。

## 允许用途与边界

| 用途 | 复核结论 |
|---|---|
| 随成品游戏播放，包括免费演示或付费版本 | **按公开正式 API 条款，原则上可用。** 前提是发布方有输入文案及相应使用权、实际账号或订单没有另行限制、未侵害第三方权利，并落实适用的生成内容标识。当前批次尚未完成标识核验，不宜直接上线。 |
| 提交 OGG 到公开 GitHub 仓库、供他人独立复用或按 MIT 再许可 | **未放行。** 游戏内使用与赋予第三方复制、再分发或训练用途的权利不是一回事。未查到对本批 OGG 按 MIT 再许可的明确依据。 |
| 署名与 AI 披露 | 查阅的正式 API 条款及模型/音色文档未见固定的片尾供应商署名要求；这不免除 AI 生成内容标识。拟在结局播放界面提示「结局旁白为 AI 合成语音」，分发页面按渠道要求声明，不使用供应商商标或徽标暗示背书。 |

- [《阿里云百炼服务协议》](https://terms.alicdn.com/legal-agreement/terms/common_platform_service/20230728213935489/20230728213935489.html)（2026-09-02 生效）第 7.5 条：对于百炼或其关联公司提供的模型，在输入有合法知识产权且无另约或法定例外时，合成内容的知识产权归用户；协议不保证输出本身享有可处分的知识产权。第 7.6 条要求商用前评估权利风险；第 4.3.1 条要求输入合法并按适用规定标识；第 4.6 条另限服务、模型转售和利用模型输出训练或开发竞品；第 7.2 条限制使用供应商标识。标准公开协议已核对，本次未登录账号核对签约主体或专有订单条款。
- [《阿里云百炼体验功能特别说明》](https://terms.alicdn.com/legal-agreement/terms/common_platform_service/20260716114753386/20260716114753386.html)第 5 条对体验入口生成物禁止商用、第三方提供和分发；不把它套用于已核对的正式 HTTP API 批次，也不把正式 API 的结论外推到体验入口。
- [GitHub 公共仓库状态](https://api.github.com/repos/AlkaidSTART/NightHouse)为公开，根目录有 [MIT License](../../../../LICENSE)。[GitHub 服务条款 D.4–D.6](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#d-user-generated-content)还涉及托管与训练权限、站内 fork 和向已有许可证的仓库贡献内容。不能靠单加署名或 MIT 例外声明就认定上传权限齐备。如只确认可随游戏发布，应通过适用条款允许的发布流程单独交付，保留代码与音频的授权区分，不把音频作为公开仓库素材或独立素材包提供。

## AI 标识检查和发布条件

- [《人工智能生成合成内容标识办法》](https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm)自 2025-09-01 施行。第 4、5 条区分服务提供者的显式和隐式标识；第 10 条要求经网络信息内容传播服务发布时主动声明并使用平台标识功能，同时不得恶意删除、篡改、伪造或隐匿标识。这里是发布预先合成的旁白，游戏不提供实时生成服务；不要把服务提供者的所有义务机械地套到固定游戏资产上，也不要把内部 README 当成玩家实际看到的声明。相关标识技术标准为 [GB 45438-2025](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=F32EA2A561F1886CD8D606513512D547)。
- [百炼 HTTP API 文档](https://help.aliyun.com/zh/model-studio/qwen-audio-tts-http-api)的 `enable_aigc_tag` 默认 `false`，列出的隐式标识支持格式为 WAV、MP3、Opus，不含当前 OGG Vorbis。已核对本批调用脚本未传该参数。`ffprobe` 检查 44 个原始 WAV 与 44 个运行 OGG：没有报告可识别的 AIGC 元数据字段，OGG 只报告 `encoder`。这不是对音频信号中是否有水印的鉴定，也不能证明转码曾删除标识。
- **游戏发布前**：由发布方核对实际订单与文案权利，落实玩家可见的 AI 提示及渠道声明；向百炼确认这批文件的隐式标识状态，以及 OGG Vorbis 如何保留或补齐适用标识。若无法验证最终交付文件的标识，可评估换用厂商支持的交付格式；保留原件，不伪造服务商字段，不擅自去除标识。
- **公开入库状态**：当前实现不提交也不推送 44 个 OGG 或本机目录，公开仓库中的结局是完整字幕加原创音效。若以后取得针对本模型和系统音色生成文件的书面答复，明确允许的渠道、第三方许可和署名，可再评估公开入库，并核对 GitHub D.4–D.6、百炼第 4.6 条及与代码 MIT 许可的边界。
