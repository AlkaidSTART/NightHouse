import type { SceneNpcSpot } from '../../shared/types/scene';
import type { StoryFlags } from '../story/conditions.ts';
import { isAnyConditionGroupMet } from '../story/conditions.ts';

/**
 * 按剧情标记为每名 NPC 选出一个站位。
 *
 * 场景里同一角色有多个站位，但同一时刻只应该出现一个人。条件不满足的站位不生成，
 * 条件都满足时取 `priority` 最大的一个；优先级相同则保留数据中靠前的站位，结果稳定。
 */
export function selectNpcStations(
  spots: readonly SceneNpcSpot[],
  flags: StoryFlags,
): Map<SceneNpcSpot['npcId'], SceneNpcSpot> {
  const selected = new Map<SceneNpcSpot['npcId'], SceneNpcSpot>();

  for (const spot of spots) {
    if (!spot.activeWhen || !isAnyConditionGroupMet(flags, spot.activeWhen)) {
      continue;
    }
    const current = selected.get(spot.npcId);
    if (!current || (spot.priority ?? 0) > (current.priority ?? 0)) {
      selected.set(spot.npcId, spot);
    }
  }

  return selected;
}
