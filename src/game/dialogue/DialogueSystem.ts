import type {
  DialogueChoice,
  DialogueLine,
  DialogueNode,
  StoryEffect,
  StoryFlagValue,
} from '../../shared/types/content';
import type {
  DialogueChoiceView,
  DialogueLineView,
  DialogueView,
} from '../../shared/types/dialogue';
import type { StoryFlags } from '../story/conditions.ts';
import { areConditionsMet } from '../story/conditions.ts';
import { resolveDialogueEntry } from './dialogueEntries.ts';

export interface DialogueHost {
  getFlags(): StoryFlags;
  setFlag: (key: string, value: StoryFlagValue) => void;
  discoverClue: (clueId: string) => void;
  recordChoice: (nodeId: string, choiceId: string) => void;
  /** 会话内容变化时回调；关闭会话时传 null。 */
  onChange: (view: DialogueView | null) => void;
  unlockDialogue?: (dialogueId: string) => void;
}

export interface DialogueSystemOptions {
  dialogues: readonly DialogueNode[];
  npcNames: ReadonlyMap<string, string>;
  host: DialogueHost;
}

interface Session {
  nodeId: string;
  /** 下一条要显示的台词；等于 lines.length 时表示进入选项阶段。 */
  lineIndex: number;
}

const SPEAKER_PREFIX = /^【([^】]+)】\s*(.*)$/;

/** 把台词里的 {honorific} 替换成开场选择的称谓。 */
export function resolveDialogueText(text: string, flags: StoryFlags): string {
  const honorific = flags['player.honorific'] === 'miss' ? '小姐' : '先生';
  return text.replaceAll('{honorific}', honorific);
}

export class DialogueSystem {
  private readonly nodes = new Map<string, DialogueNode>();
  private readonly npcNames: ReadonlyMap<string, string>;
  private readonly host: DialogueHost;
  private session: Session | null = null;

  constructor(options: DialogueSystemOptions) {
    this.npcNames = options.npcNames;
    this.host = options.host;
    for (const node of options.dialogues) {
      if (this.nodes.has(node.id)) {
        throw new Error(`对话节点 ID 重复：${node.id}`);
      }
      this.nodes.set(node.id, node);
    }
  }

  get active(): boolean {
    return this.session !== null;
  }

  get currentNpcId(): string | null {
    if (!this.session) {
      return null;
    }
    return this.nodes.get(this.session.nodeId)?.npcId ?? null;
  }

  openForNpc(npcId: string, spotId: string): boolean {
    const entryId = resolveDialogueEntry(npcId, spotId, this.host.getFlags());
    return entryId !== null && this.open(entryId);
  }

  open(entryId: string): boolean {
    const node = this.nodes.get(entryId);
    if (!node) {
      return false;
    }
    if (!areConditionsMet(this.host.getFlags(), node.conditions ?? [])) {
      return false;
    }
    if (node.lines.length === 0 && this.availableChoices(node).length === 0) {
      return false;
    }

    this.session = { nodeId: node.id, lineIndex: 0 };
    this.emit();
    return true;
  }

  /** 推进当前节点的台词；最后一句之后进入选项阶段。 */
  advance(): void {
    const session = this.session;
    if (!session) {
      return;
    }
    const node = this.nodes.get(session.nodeId);
    if (!node) {
      this.close();
      return;
    }
    if (node.lines.length === 0 || session.lineIndex >= node.lines.length) {
      return;
    }

    session.lineIndex += 1;
    if (
      session.lineIndex >= node.lines.length &&
      this.availableChoices(node).length === 0
    ) {
      this.close();
      return;
    }
    this.emit();
  }

  choose(choiceId: string): boolean {
    const session = this.session;
    if (!session) {
      return false;
    }
    const node = this.nodes.get(session.nodeId);
    if (!node || session.lineIndex < node.lines.length) {
      return false;
    }

    const choice = this.availableChoices(node).find(
      (candidate) => candidate.id === choiceId,
    );
    if (!choice) {
      return false;
    }

    for (const effect of choice.effects ?? []) {
      this.applyEffect(effect);
    }
    this.host.recordChoice(node.id, choice.id);

    if (choice.next === null) {
      this.close();
      return true;
    }

    const next = this.nodes.get(choice.next);
    if (
      !next ||
      !areConditionsMet(this.host.getFlags(), next.conditions ?? [])
    ) {
      console.warn(`对话跳转目标不可用：${node.id} → ${choice.next}`);
      this.close();
      return false;
    }

    session.nodeId = next.id;
    session.lineIndex = 0;
    if (next.lines.length === 0 && this.availableChoices(next).length === 0) {
      this.close();
      return true;
    }
    this.emit();
    return true;
  }

  close(): void {
    if (!this.session) {
      return;
    }
    this.session = null;
    this.host.onChange(null);
  }

  view(): DialogueView | null {
    const session = this.session;
    if (!session) {
      return null;
    }
    const node = this.nodes.get(session.nodeId);
    if (!node) {
      return null;
    }

    const npcName = this.npcNames.get(node.npcId) ?? node.npcId;
    const lines = node.lines.map((line) => this.resolveLine(line, npcName));
    const lineIndex = Math.min(session.lineIndex, lines.length - 1);
    const line = lines.length > 0 ? lines[lineIndex] ?? null : null;
    const canContinue = session.lineIndex < node.lines.length;
    const choices: DialogueChoiceView[] = canContinue
      ? []
      : this.availableChoices(node).map((choice) => ({
          id: choice.id,
          text: choice.text,
        }));

    return {
      npcId: node.npcId,
      npcName,
      nodeId: node.id,
      line,
      choices,
      canContinue,
    };
  }

  private availableChoices(node: DialogueNode): DialogueChoice[] {
    const flags = this.host.getFlags();
    return node.choices.filter((choice) =>
      areConditionsMet(flags, choice.conditions ?? []),
    );
  }

  private applyEffect(effect: StoryEffect): void {
    switch (effect.type) {
      case 'set-flag':
        this.host.setFlag(effect.key, effect.value ?? true);
        break;
      case 'discover-clue':
        this.host.discoverClue(effect.key);
        break;
      case 'unlock-dialogue':
        if (this.host.unlockDialogue) {
          this.host.unlockDialogue(effect.key);
        } else {
          console.warn(`未处理解锁对话效果：${effect.key}`);
        }
        break;
    }
  }

  private resolveLine(
    line: DialogueLine,
    npcName: string,
  ): DialogueLineView {
    const text = resolveDialogueText(line.text, this.host.getFlags());
    if (line.speaker === 'npc') {
      const match = SPEAKER_PREFIX.exec(text);
      const name = match?.[1]?.trim();
      const rest = match?.[2]?.trim();
      if (name && rest) {
        return { speaker: 'npc', name, text: rest };
      }
      return { speaker: 'npc', name: npcName, text };
    }
    if (line.speaker === 'player') {
      return { speaker: 'player', name: '我', text };
    }
    return { speaker: 'narration', name: null, text };
  }

  private emit(): void {
    this.host.onChange(this.view());
  }
}
