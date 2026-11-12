import type { StoryFlags } from '../story/conditions.ts';
import { isConditionMet } from '../story/conditions.ts';

/**
 * 场景站位到对话入口的映射。
 *
 * 场景里同一名 NPC 有多个站位，但对话树只有一条主线。这里按站位和剧情进度
 * 选择入口，避免为每个站位复制一份节点；找不到特殊入口时回落到 NPC 的常规入口。
 */
export function resolveDialogueEntry(
  npcId: string,
  spotId: string,
  flags: StoryFlags,
): string | null {
  switch (npcId) {
    case 'npc_arthur':
      if (
        spotId === 'NPC_arthur_signing_table' &&
        isConditionMet(flags, { flag: 'story.midnight' })
      ) {
        return 'npc_arthur_midnight_01';
      }
      if (
        spotId === 'NPC_arthur_study_desk' &&
        (isConditionMet(flags, { flag: 'story.knows_coverup' }) ||
          isConditionMet(flags, { flag: 'clue.shipping_ledger' }))
      ) {
        return 'npc_arthur_confront_01';
      }
      if (
        spotId === 'NPC_arthur_dining_head' &&
        isConditionMet(flags, { flag: 'story.met_arthur' })
      ) {
        return 'npc_arthur_dinner_01';
      }
      return 'npc_arthur_intro';

    case 'npc_housekeeper':
      return 'npc_housekeeper_intro';

    case 'npc_doctor':
      if (
        spotId === 'NPC_doctor_stair_foot' &&
        isConditionMet(flags, { flag: 'story.midnight' })
      ) {
        return 'npc_doctor_midnight_01';
      }
      return 'npc_doctor_intro';

    default:
      return null;
  }
}
