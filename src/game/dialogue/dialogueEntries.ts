import type { StoryFlags } from '../story/conditions.ts';
import { isConditionMet } from '../story/conditions.ts';
import type { DialogueBeatId } from '../story/dialogueBeat.ts';

export interface DialogueEntry {
  nodeId: string;
  /**
   * 已经和该 NPC 谈过时，入口台词不再重播；若节点提供 `reenterLines`，
   * 用一句当前情节的招呼替代，否则直接进入话题选项。
   */
  skipOpeningLines: boolean;
}

function entry(nodeId: string, skipOpeningLines = false): DialogueEntry {
  return { nodeId, skipOpeningLines };
}

/**
 * 场景站位到对话入口的映射。
 *
 * 对话按情节节拍隔离：每个节拍只暴露该节拍的入口枢纽，话题节点也只能
 * 在同一节拍内跳转。站位只用来区分同一节拍内的场景（例如 B5 的餐桌与
 * 书房），不再负责跨越情节挑选内容。
 */
export function resolveDialogueEntry(
  npcId: string,
  spotId: string,
  flags: StoryFlags,
  beat: DialogueBeatId | null,
): DialogueEntry | null {
  switch (npcId) {
    case 'npc_arthur': {
      if (beat === 'b10_midnight') {
        return entry('npc_arthur_midnight_01');
      }
      if (beat === 'b9_confrontation') {
        return entry('npc_arthur_confront_01');
      }
      if (beat === 'b5_investigation') {
        return spotId === 'NPC_arthur_dining_head'
          ? entry('npc_arthur_b5_dining_01')
          : entry('npc_arthur_b5_study_01');
      }
      if (beat === 'b3_dinner') {
        return entry('npc_arthur_dinner_01');
      }
      if (beat === 'b2_arthur') {
        return entry(
          'npc_arthur_intro',
          isConditionMet(flags, { flag: 'story.met_arthur' }),
        );
      }
      return null;
    }

    case 'npc_housekeeper': {
      if (beat === 'b10_midnight') {
        return entry('npc_housekeeper_midnight_01');
      }
      if (beat === 'b9_confrontation') {
        return isConditionMet(flags, { flag: 'story.knows_coverup' })
          ? entry('npc_housekeeper_confront_01')
          : entry('npc_housekeeper_b9_wait_01');
      }
      if (beat === 'b5_investigation') {
        return entry(
          'npc_housekeeper_b5_01',
          isConditionMet(flags, { flag: 'story.met_housekeeper' }),
        );
      }
      if (beat === 'b3_dinner') {
        return entry('npc_housekeeper_dinner_01');
      }
      if (beat === 'b2_arthur') {
        return entry('npc_housekeeper_wait_01');
      }
      if (beat === 'b1_arrival') {
        return entry(
          'npc_housekeeper_intro',
          isConditionMet(flags, { flag: 'story.met_housekeeper' }),
        );
      }
      return null;
    }

    case 'npc_doctor': {
      if (beat === 'b10_midnight') {
        return entry('npc_doctor_midnight_01');
      }
      if (beat === 'b9_confrontation') {
        return entry('npc_doctor_confront_wait_01');
      }
      if (beat === 'b5_investigation') {
        return entry(
          'npc_doctor_b5_01',
          isConditionMet(flags, { flag: 'story.doctor_talked' }),
        );
      }
      if (beat === 'b3_dinner') {
        return entry(
          'npc_doctor_intro',
          isConditionMet(flags, { flag: 'story.doctor_talked' }),
        );
      }
      return null;
    }

    default:
      return null;
  }
}
