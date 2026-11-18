import type { DialogueSpeaker } from './content';

export interface DialogueLineView {
  speaker: DialogueSpeaker;
  /** 说话人显示名；旁白为 null。 */
  name: string | null;
  text: string;
  /** 当前正在播放的台词语音；进入选项阶段后为 null。 */
  audioUrl: string | null;
}

export interface DialogueChoiceView {
  id: string;
  text: string;
  /** 当前选项在提问参考中的位置；非提问项为 null。 */
  guideOrder: number | null;
  /** 当前选项在本次交谈中的提问状态。 */
  guideStatus: DialogueGuideStatus | null;
}

export type DialogueGuideStatus = 'asked' | 'next' | 'later';

export interface DialogueGuideStepView {
  choiceId: string;
  label: string;
  status: DialogueGuideStatus;
}

export interface DialogueGuideView {
  hint: string | null;
  steps: readonly DialogueGuideStepView[];
}

export interface DialogueView {
  npcId: string;
  npcName: string;
  nodeId: string;
  /** 当前对话所属的情节节拍，例如「第二幕 · 调查」；无节拍时为 null。 */
  beatLabel: string | null;
  /** 当前剧情步骤对应的目标提示，例如「问出那晚的搬运经过」。 */
  contextLabel: string | null;
  /** 当前显示的台词；选项阶段停留在本节点最后一句。 */
  line: DialogueLineView | null;
  choices: readonly DialogueChoiceView[];
  /** 选项阶段的建议提问顺序；台词阶段或没有配置时为 null。 */
  guide: DialogueGuideView | null;
  canContinue: boolean;
}
