import type { StoryCondition, StoryFlagValue } from '../../shared/types/content';

export type StoryFlags = Readonly<Record<string, StoryFlagValue>>;

/** 未写 equals 的条件表示「该标记为 true」；未设置的标记视为不满足。 */
export function isConditionMet(
  flags: StoryFlags,
  condition: StoryCondition,
): boolean {
  const value = flags[condition.flag];
  return condition.equals === undefined
    ? value === true
    : value === condition.equals;
}

export function areConditionsMet(
  flags: StoryFlags,
  conditions: readonly StoryCondition[],
): boolean {
  return conditions.every((condition) => isConditionMet(flags, condition));
}

/** 外层为「或」，内层为「且」。空的外层数组视为不满足。 */
export function isAnyConditionGroupMet(
  flags: StoryFlags,
  groups: readonly (readonly StoryCondition[])[],
): boolean {
  return groups.some((group) => areConditionsMet(flags, group));
}
