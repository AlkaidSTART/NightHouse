import {
  DIALOGUE_PLOT_LABEL,
  PLOT_DIALOGUE_ROUTES,
} from '../../content/dialogues/plotRoutes.ts';
import type { StoryFlags } from '../story/conditions.ts';
import { areConditionsMet } from '../story/conditions.ts';

export interface DialogueEntry {
  nodeId: string;
  /**
   * 已经和该 NPC 谈过时，入口台词不再重播；若节点提供 `reenterLines`，
   * 用一句当前情节的招呼替代，否则直接进入话题选项。
   */
  skipOpeningLines: boolean;
  /**
   * 当前剧情步骤允许展开的话题；null 表示不限制。导航选项不受此列表影响。
   */
  allowedChoiceIds: readonly string[] | null;
  /** 当前剧情步骤对应的目标提示。 */
  contextLabel: string | null;
}

export interface DialogueEntryContext {
  npcId: string;
  spotId: string;
  flags: StoryFlags;
  activeTaskId: string | null;
}

/**
 * 按当前任务步骤解析 NPC 的对话入口。
 *
 * 具体路由集中在 `content/dialogues/plotRoutes.ts`。同一 NPC 有多条候选
 * 路由时按数据顺序匹配，先满足站位与剧情条件者生效。
 */
export function resolveDialogueEntry({
  npcId,
  spotId,
  flags,
  activeTaskId,
}: DialogueEntryContext): DialogueEntry | null {
  if (activeTaskId === null) {
    return null;
  }

  const route = PLOT_DIALOGUE_ROUTES.find(
    (candidate) =>
      candidate.taskIds.includes(activeTaskId) &&
      candidate.npcId === npcId &&
      (candidate.spotIds === undefined || candidate.spotIds.includes(spotId)) &&
      areConditionsMet(flags, candidate.when ?? []),
  );
  if (!route) {
    return null;
  }

  return {
    nodeId: route.nodeId,
    skipOpeningLines:
      route.skipOpeningWhen !== undefined &&
      areConditionsMet(flags, route.skipOpeningWhen),
    allowedChoiceIds: route.allowedChoiceIds ?? null,
    contextLabel: DIALOGUE_PLOT_LABEL[activeTaskId] ?? null,
  };
}
