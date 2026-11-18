import type { DialogueSpeaker } from '../../shared/types/content';

export interface DialogueVoiceAssetInput {
  nodeId: string;
  speaker: DialogueSpeaker;
  lineIndex: number;
  isReenter: boolean;
  npcId: string;
  text: string;
  hasHonorificVariant: boolean;
  honorific: 'sir' | 'miss';
}

const VOICE_ASSET_BY_NPC: Readonly<Record<string, string>> = {
  npc_arthur: 'VO_NpcArthur',
  npc_housekeeper: 'VO_NpcHousekeeper',
  npc_doctor: 'VO_NpcDoctor',
};

const SPEAKER_NPC_ID: Readonly<Record<string, string>> = {
  格雷医生: 'npc_doctor',
  霍尔太太: 'npc_housekeeper',
};

/** 将对话系统的显示台词映射到由 `export:vo` 生成的句级语音资产。 */
export function resolveDialogueVoiceUrl(
  input: DialogueVoiceAssetInput,
): string | null {
  if (input.speaker === 'player') {
    return null;
  }

  const index = input.lineIndex + 1;
  const suffix = `${input.isReenter ? 'R' : 'L'}${index.toString().padStart(2, '0')}`;
  if (input.speaker === 'narration') {
    return `/assets/audio/vo/VO_Narrator_${input.nodeId}_${suffix}.ogg`;
  }

  const text = input.text.trim();
  const prefix = /^【([^】]+)】\s*/.exec(text);
  const speakerNpcId = prefix?.[1]
    ? SPEAKER_NPC_ID[prefix[1]] ?? input.npcId
    : input.npcId;
  const asset = VOICE_ASSET_BY_NPC[speakerNpcId];
  if (!asset) {
    return null;
  }

  const honorificSuffix =
    input.hasHonorificVariant && input.honorific === 'miss' ? '_MISS' : '';
  return `/assets/audio/vo/${asset}_${input.nodeId}_${suffix}${honorificSuffix}.ogg`;
}

export const EVELYN_CYLINDER_VOICE_URLS: readonly string[] = [
  1, 2, 3, 4, 5,
].map(
  (lineNo) =>
    `/assets/audio/vo/VO_EvelynCylinder_INT_prop_phonograph_P${lineNo.toString().padStart(2, '0')}.ogg`,
);
