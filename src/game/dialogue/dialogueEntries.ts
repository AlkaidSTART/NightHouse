import type { StoryFlags } from '../story/conditions.ts';
import { isConditionMet } from '../story/conditions.ts';

export interface DialogueEntry {
  nodeId: string;
  /**
   * 已经和该 NPC 谈过时，入口台词不再重播，直接进入话题选项。
   * 场景专用的入口（晚宴、对质、午夜）始终播放台词。
   */
  skipOpeningLines: boolean;
}

function entry(nodeId: string, skipOpeningLines = false): DialogueEntry {
  return { nodeId, skipOpeningLines };
}

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
): DialogueEntry | null {
  switch (npcId) {
    case 'npc_arthur':
      if (
        spotId === 'NPC_arthur_signing_table' &&
        isConditionMet(flags, { flag: 'story.midnight' })
      ) {
        return entry('npc_arthur_midnight_01');
      }
      if (
        spotId === 'NPC_arthur_study_desk' &&
        (isConditionMet(flags, { flag: 'story.knows_coverup' }) ||
          isConditionMet(flags, { flag: 'clue.shipping_ledger' }))
      ) {
        return entry('npc_arthur_confront_01');
      }
      if (
        spotId === 'NPC_arthur_dining_head' &&
        isConditionMet(flags, { flag: 'story.met_arthur' })
      ) {
        return entry('npc_arthur_dinner_01');
      }
      return entry(
        'npc_arthur_intro',
        isConditionMet(flags, { flag: 'story.met_arthur' }),
      );

    case 'npc_housekeeper':
      return entry(
        'npc_housekeeper_intro',
        isConditionMet(flags, { flag: 'story.met_housekeeper' }),
      );

    case 'npc_doctor':
      if (
        spotId === 'NPC_doctor_stair_foot' &&
        isConditionMet(flags, { flag: 'story.midnight' })
      ) {
        return entry('npc_doctor_midnight_01');
      }
      return entry(
        'npc_doctor_intro',
        isConditionMet(flags, { flag: 'story.doctor_talked' }),
      );

    default:
      return null;
  }
}
