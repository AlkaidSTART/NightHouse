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

export interface ConversationEndEvent {
  npcId: string;
  /** 打开对话时使用的入口节点 ID。 */
  nodeId: string;
  /** 玩家至少推进过一句台词或做出过一次选择；只打开就关闭不算谈完。 */
  completed: boolean;
}

export interface DialogueHost {
  getFlags(): StoryFlags;
  /** 当前任务步骤 ID；用于把话题选项收窄到本次任务，未提供时不做过滤。 */
  getActiveTaskId?: () => string | null;
  setFlag: (key: string, value: StoryFlagValue) => void;
  discoverClue: (clueId: string) => void;
  recordChoice: (nodeId: string, choiceId: string) => void;
  /** 会话内容变化时回调；关闭会话时传 null。 */
  onChange: (view: DialogueView | null) => void;
  /** 会话关闭后回调，宿主据此推进剧情与 NPC 出场。 */
  onConversationEnd?: (event: ConversationEndEvent) => void;
  unlockDialogue?: (dialogueId: string) => void;
}

export interface DialogueSystemOptions {
  dialogues: readonly DialogueNode[];
  npcNames: ReadonlyMap<string, string>;
  host: DialogueHost;
}

interface Session {
  nodeId: string;
  entryNodeId: string;
  npcId: string;
  /** 下一条要显示的台词；等于 lines.length 时表示进入选项阶段。 */
  lineIndex: number;
  /** 本次会话里已经展示过的节点；返回这类节点时直接进入选项阶段，避免重播台词。 */
  visited: Set<string>;
  /** 跳过当前节点台词时不再显示最后一句，避免把上一话题的台词当成新的回应。 */
  hideLine: boolean;
  /** 玩家是否推进过台词或做过选择，用于区分「谈完」和「打开就关」。 */
  engaged: boolean;
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
    const entry = resolveDialogueEntry(npcId, spotId, this.host.getFlags());
    return (
      entry !== null &&
      this.open(entry.nodeId, { skipOpeningLines: entry.skipOpeningLines })
    );
  }

  open(
    entryId: string,
    options: { skipOpeningLines?: boolean } = {},
  ): boolean {
    const node = this.nodes.get(entryId);
    if (!node) {
      return false;
    }
    if (!areConditionsMet(this.host.getFlags(), node.conditions ?? [])) {
      return false;
    }
    const choices = this.availableChoices(node);
    if (node.lines.length === 0 && choices.length === 0) {
      return false;
    }
    // 重复交谈时若本次任务已没有可聊的话题，不再重播台词。
    if (options.skipOpeningLines === true && choices.length === 0) {
      return false;
    }

    const hideLine = options.skipOpeningLines === true && choices.length > 0;
    this.session = {
      nodeId: node.id,
      entryNodeId: node.id,
      npcId: node.npcId,
      lineIndex: hideLine ? node.lines.length : 0,
      visited: new Set([node.id]),
      hideLine,
      engaged: false,
    };
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
    session.engaged = true;
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

    session.engaged = true;
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

    const revisited = session.visited.has(next.id);
    session.nodeId = next.id;
    // 返回已经看过的节点时跳过台词，直接给出该节点的选项；
    // 否则「返回上一层」会把开场白或已听过的证词整段重播。
    session.lineIndex = revisited ? next.lines.length : 0;
    session.hideLine = revisited;
    session.visited.add(next.id);
    if (
      session.lineIndex >= next.lines.length &&
      this.availableChoices(next).length === 0
    ) {
      this.close();
      return true;
    }
    this.emit();
    return true;
  }

  close(): void {
    const session = this.session;
    if (!session) {
      return;
    }
    this.session = null;
    // 先关闭界面并交还控制权，再让宿主推进剧情，避免 NPC 在对话界面里当场换位。
    this.host.onChange(null);
    this.host.onConversationEnd?.({
      npcId: session.npcId,
      nodeId: session.entryNodeId,
      completed: session.engaged,
    });
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
    const line =
      session.hideLine || lines.length === 0 ? null : lines[lineIndex] ?? null;
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
    const activeTaskId = this.host.getActiveTaskId?.() ?? null;
    return node.choices.filter(
      (choice) =>
        areConditionsMet(flags, choice.conditions ?? []) &&
        this.isChoiceRelevant(choice, activeTaskId),
    );
  }

  /**
   * 话题选项只在当前任务步骤命中时显示；未标记任务的选项（返回、离开、
   * 态度回应）始终保留。任务全部完成（activeTaskId 为 null）时不过滤。
   */
  private isChoiceRelevant(
    choice: DialogueChoice,
    activeTaskId: string | null,
  ): boolean {
    if (!choice.taskIds || choice.taskIds.length === 0) {
      return true;
    }
    return activeTaskId === null || choice.taskIds.includes(activeTaskId);
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
