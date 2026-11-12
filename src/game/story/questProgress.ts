import type {
  QuestDefinition,
  QuestStep,
  StoryCondition,
} from '../../shared/types/content';
import type { StoryFlags } from './conditions.ts';
import { isAnyConditionGroupMet } from './conditions.ts';

export interface ActiveObjective {
  quest: QuestDefinition;
  step: QuestStep;
  /** 从 0 开始的步骤序号，用于面板上的进度显示。 */
  index: number;
  total: number;
}

/**
 * 某一步是否完成。`doneWhen` 采用「外层或、内层且」，空数组视为未完成，
 * 避免一个缺少条件的数据项被静默跳过。
 */
export function isStepComplete(
  flags: StoryFlags,
  doneWhen: readonly (readonly StoryCondition[])[],
): boolean {
  return doneWhen.length > 0 && isAnyConditionGroupMet(flags, doneWhen);
}

/**
 * 返回第一个任务里第一个未完成的步骤。所有步骤都完成时返回 null。
 * 这是纯函数：目标进度完全由剧情标记推导，因此存档只需保存标记。
 */
export function resolveActiveObjective(
  flags: StoryFlags,
  quests: readonly QuestDefinition[],
): ActiveObjective | null {
  for (const quest of quests) {
    for (let index = 0; index < quest.steps.length; index += 1) {
      const step = quest.steps[index];
      if (!step) {
        continue;
      }
      if (!isStepComplete(flags, step.doneWhen)) {
        return { quest, step, index, total: quest.steps.length };
      }
    }
  }
  return null;
}

/**
 * 当前任务步骤 ID。所有任务都完成或没有任务时返回 null。
 * 进度完全由剧情标记推导，因此可安全地作为全局共享值使用。
 */
export function resolveActiveStepId(
  flags: StoryFlags,
  quests: readonly QuestDefinition[],
): string | null {
  return resolveActiveObjective(flags, quests)?.step.id ?? null;
}
