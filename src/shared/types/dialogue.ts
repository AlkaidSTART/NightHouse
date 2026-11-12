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
  /** 当前显示的台词；选项阶段停留在本节点最后一句。 */
  line: DialogueLineView | null;
  choices: readonly DialogueChoiceView[];
  canContinue: boolean;
}
