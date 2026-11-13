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
import {
  DIALOGUE_BEAT_LABEL,
  isInDialogueBeat,
  resolveActiveDialogueBeat,
  type DialogueBeatId,
} from '../story/dialogueBeat.ts';
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
  /**
   * 会话打开时锁定的情节节拍。对话中写入的标记可能立刻推进任务，
   * 但本段对话的话题集合保持不变，下一次交谈才切换到新节拍。
   */
  beat: DialogueBeatId | null;
  /** 当前剧情步骤的话题白名单；null 表示不限制。 */
  allowedChoiceIds: ReadonlySet<string> | null;
  /** 当前剧情步骤的目标提示。 */
  contextLabel: string | null;
  /** 本次会话当前节点要播放的台词（可能是重入短句）。 */
  lines: DialogueLine[];
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

interface OpenDialogueOptions {
  skipOpeningLines?: boolean;
  allowedChoiceIds?: readonly string[] | null;
  contextLabel?: string | null;
}

/** 把台词里的 {honorific} 替换成已保存的称谓；新游戏未设置时沿用默认称呼。 */
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
    const entry = resolveDialogueEntry({
      npcId,
      spotId,
      flags: this.host.getFlags(),
      activeTaskId: this.getActiveTaskId(),
    });
    return (
      entry !== null &&
      this.open(entry.nodeId, {
        skipOpeningLines: entry.skipOpeningLines,
        allowedChoiceIds: entry.allowedChoiceIds,
        contextLabel: entry.contextLabel,
      })
    );
  }

  open(
    entryId: string,
    options: OpenDialogueOptions = {},
  ): boolean {
    const node = this.nodes.get(entryId);
    if (!node) {
      return false;
    }
    const beat = resolveActiveDialogueBeat(this.getActiveTaskId());
    if (!isInDialogueBeat(node.taskIds, beat)) {
      return false;
    }
    if (!areConditionsMet(this.host.getFlags(), node.conditions ?? [])) {
      return false;
    }
    const allowedChoiceIds =
      options.allowedChoiceIds === undefined ||
      options.allowedChoiceIds === null
        ? null
        : new Set(options.allowedChoiceIds);
    const choices = this.availableChoices(node, beat, allowedChoiceIds);
    if (node.lines.length === 0 && choices.length === 0) {
      return false;
    }
    // 重复交谈时若本次任务已没有可聊的话题，不再重播台词。
    if (options.skipOpeningLines === true && choices.length === 0) {
      return false;
    }

    const reenterLines =
      options.skipOpeningLines === true && choices.length > 0
        ? node.reenterLines ?? []
        : [];
    const hideLine =
      options.skipOpeningLines === true &&
      choices.length > 0 &&
      reenterLines.length === 0;
    this.session = {
      nodeId: node.id,
      entryNodeId: node.id,
      npcId: node.npcId,
      beat,
      allowedChoiceIds,
      contextLabel: options.contextLabel ?? null,
      lines: reenterLines.length > 0 ? reenterLines : node.lines,
      lineIndex: reenterLines.length > 0 ? 0 : hideLine ? node.lines.length : 0,
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
    if (session.lines.length === 0 || session.lineIndex >= session.lines.length) {
      return;
    }

    session.lineIndex += 1;
    session.engaged = true;
    if (
      session.lineIndex >= session.lines.length &&
      this.availableChoices(
        node,
        session.beat,
        session.allowedChoiceIds,
      ).length === 0
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
    if (!node || session.lineIndex < session.lines.length) {
      return false;
    }

    const choice = this.availableChoices(
      node,
      session.beat,
      session.allowedChoiceIds,
    ).find((candidate) => candidate.id === choiceId);
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
      !isInDialogueBeat(next.taskIds, session.beat) ||
      !areConditionsMet(this.host.getFlags(), next.conditions ?? [])
    ) {
      console.warn(
        `对话跳转越过情节边界或条件不满足：${node.id} → ${choice.next}`,
      );
      this.close();
      return false;
    }

    const revisited = session.visited.has(next.id);
    session.nodeId = next.id;
    session.lines = next.lines;
    // 返回已经看过的节点时跳过台词，直接给出该节点的选项；
    // 否则「返回上一层」会把开场白或已听过的证词整段重播。
    session.lineIndex = revisited ? next.lines.length : 0;
    session.hideLine = revisited;
    session.visited.add(next.id);
    if (
      session.lineIndex >= next.lines.length &&
      this.availableChoices(
        next,
        session.beat,
        session.allowedChoiceIds,
      ).length === 0
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
    const lines = session.lines.map((line) => this.resolveLine(line, npcName));
    const lineIndex = Math.min(session.lineIndex, lines.length - 1);
    const line =
      session.hideLine || lines.length === 0 ? null : lines[lineIndex] ?? null;
    const canContinue = session.lineIndex < session.lines.length;
    const choices: DialogueChoiceView[] = canContinue
      ? []
      : this.availableChoices(
          node,
          session.beat,
          session.allowedChoiceIds,
        ).map((choice) => ({
          id: choice.id,
          text: choice.text,
        }));

    return {
      npcId: node.npcId,
      npcName,
      nodeId: node.id,
      beatLabel: session.beat ? DIALOGUE_BEAT_LABEL[session.beat] : null,
      contextLabel: session.contextLabel,
      line,
      choices,
      canContinue,
    };
  }

  private getActiveTaskId(): string | null {
    return this.host.getActiveTaskId?.() ?? null;
  }

  private availableChoices(
    node: DialogueNode,
    beat: DialogueBeatId | null,
    allowedChoiceIds: ReadonlySet<string> | null,
  ): DialogueChoice[] {
    const flags = this.host.getFlags();
    return node.choices.filter(
      (choice) =>
        areConditionsMet(flags, choice.conditions ?? []) &&
        isInDialogueBeat(choice.taskIds, beat) &&
        this.isChoiceAllowed(choice, allowedChoiceIds),
    );
  }

  /**
   * 剧情白名单只收窄可追问的话题；返回、离开和结束等导航选项始终保留，
   * 避免玩家因为剧情过滤而卡在对话里。
   */
  private isChoiceAllowed(
    choice: DialogueChoice,
    allowedChoiceIds: ReadonlySet<string> | null,
  ): boolean {
    return (
      allowedChoiceIds === null ||
      allowedChoiceIds.has(choice.id) ||
      choice.next === null ||
      choice.id === 'back'
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
