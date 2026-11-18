import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import {
  EVELYN_CYLINDER_VOICE_URLS,
  resolveDialogueVoiceUrl,
} from '../src/game/audio/voiceAssets.ts';

test('resolveDialogueVoiceUrl：按说话人、重入、称谓和玩家台词映射路径', () => {
  assert.equal(
    resolveDialogueVoiceUrl({
      nodeId: 'npc_arthur_intro',
      speaker: 'npc',
      lineIndex: 0,
      isReenter: false,
      npcId: 'npc_arthur',
      text: '你来了。路上不好走吧——桥断了。',
      hasHonorificVariant: false,
      honorific: 'sir',
    }),
    '/assets/audio/vo/VO_NpcArthur_npc_arthur_intro_L01.ogg',
  );

  assert.equal(
    resolveDialogueVoiceUrl({
      nodeId: 'npc_arthur_intro',
      speaker: 'npc',
      lineIndex: 0,
      isReenter: true,
      npcId: 'npc_arthur',
      text: '还有什么事？',
      hasHonorificVariant: false,
      honorific: 'sir',
    }),
    '/assets/audio/vo/VO_NpcArthur_npc_arthur_intro_R01.ogg',
  );

  assert.equal(
    resolveDialogueVoiceUrl({
      nodeId: 'npc_arthur_dinner_01',
      speaker: 'npc',
      lineIndex: 1,
      isReenter: false,
      npcId: 'npc_arthur',
      text: '【格雷医生】我们在聊这栋房子的老规矩。',
      hasHonorificVariant: false,
      honorific: 'sir',
    }),
    '/assets/audio/vo/VO_NpcDoctor_npc_arthur_dinner_01_L02.ogg',
  );

  assert.equal(
    resolveDialogueVoiceUrl({
      nodeId: 'npc_arthur_dinner_will',
      speaker: 'npc',
      lineIndex: 2,
      isReenter: false,
      npcId: 'npc_arthur',
      text: '【霍尔太太】少爷，汤已经撤了。',
      hasHonorificVariant: false,
      honorific: 'sir',
    }),
    '/assets/audio/vo/VO_NpcHousekeeper_npc_arthur_dinner_will_L03.ogg',
  );

  assert.equal(
    resolveDialogueVoiceUrl({
      nodeId: 'npc_housekeeper_intro',
      speaker: 'npc',
      lineIndex: 0,
      isReenter: false,
      npcId: 'npc_housekeeper',
      text: '您好，小姐。',
      hasHonorificVariant: true,
      honorific: 'miss',
    }),
    '/assets/audio/vo/VO_NpcHousekeeper_npc_housekeeper_intro_L01_MISS.ogg',
  );

  assert.equal(
    resolveDialogueVoiceUrl({
      nodeId: 'npc_arthur_intro',
      speaker: 'player',
      lineIndex: 0,
      isReenter: false,
      npcId: 'npc_arthur',
      text: '你是亚瑟？',
      hasHonorificVariant: false,
      honorific: 'sir',
    }),
    null,
  );

  assert.equal(
    resolveDialogueVoiceUrl({
      nodeId: 'npc_arthur_evelyn_02',
      speaker: 'narration',
      lineIndex: 1,
      isReenter: false,
      npcId: 'npc_arthur',
      text: '他抬手看怀表。',
      hasHonorificVariant: false,
      honorific: 'sir',
    }),
    '/assets/audio/vo/VO_Narrator_npc_arthur_evelyn_02_L02.ogg',
  );
});

test('EVELYN_CYLINDER_VOICE_URLS：按顺序包含 5 段蜡筒录音路径', () => {
  assert.deepEqual(EVELYN_CYLINDER_VOICE_URLS, [
    '/assets/audio/vo/VO_EvelynCylinder_INT_prop_phonograph_P01.ogg',
    '/assets/audio/vo/VO_EvelynCylinder_INT_prop_phonograph_P02.ogg',
    '/assets/audio/vo/VO_EvelynCylinder_INT_prop_phonograph_P03.ogg',
    '/assets/audio/vo/VO_EvelynCylinder_INT_prop_phonograph_P04.ogg',
    '/assets/audio/vo/VO_EvelynCylinder_INT_prop_phonograph_P05.ogg',
  ]);
});

test('所有 NPC、伊芙琳与旁白语音清单条目均存在对应的运行时 OGG 文件', () => {
  const manifestPath = path.resolve('assets/audio/vo/manifest/vo_lines.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    clips: Array<{
      voiceId: string;
      fileName: string;
      textAltFileName: string | null;
    }>;
  };

  const voiceClips = manifest.clips.filter((clip) =>
    [
      'npc_arthur',
      'npc_housekeeper',
      'npc_doctor',
      'npc_evelyn',
      'narrator',
    ].includes(clip.voiceId),
  );
  assert.equal(voiceClips.length, 183);

  let checkedFiles = 0;
  for (const clip of voiceClips) {
    const filePath = path.resolve('public/assets/audio/vo', clip.fileName);
    assert.ok(fs.existsSync(filePath), `缺少语音文件: ${clip.fileName}`);
    assert.ok(fs.statSync(filePath).size > 0, `语音文件为空: ${clip.fileName}`);
    checkedFiles += 1;

    if (clip.textAltFileName) {
      const altPath = path.resolve(
        'public/assets/audio/vo',
        clip.textAltFileName,
      );
      assert.ok(
        fs.existsSync(altPath),
        `缺少称谓变体语音文件: ${clip.textAltFileName}`,
      );
      assert.ok(
        fs.statSync(altPath).size > 0,
        `称谓变体语音文件为空: ${clip.textAltFileName}`,
      );
      checkedFiles += 1;
    }
  }

  assert.equal(checkedFiles, 190);
});
