import type { EndingDefinition } from '../../shared/types/content';
import type { StoryFlags } from './conditions.ts';
import { areConditionsMet } from './conditions.ts';

/**
 * 按 `endings` 数组顺序返回第一个条件全部满足的结局。
 * 结局定义按优先级排列（数组越靠前优先级越高），命中即停。
 */
export function resolveEnding(
  flags: StoryFlags,
  endings: readonly EndingDefinition[],
): EndingDefinition | null {
  for (const ending of endings) {
    if (areConditionsMet(flags, ending.conditions)) {
      return ending;
    }
  }
  return null;
}
