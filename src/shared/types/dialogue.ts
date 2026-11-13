import type { DialogueSpeaker } from './content';

export interface DialogueLineView {
  speaker: DialogueSpeaker;
  /** 说话人显示名；旁白为 null。 */
  name: string | null;
  text: string;
}

export interface DialogueChoiceView {
  id: string;
  text: string;
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
  canContinue: boolean;
}
