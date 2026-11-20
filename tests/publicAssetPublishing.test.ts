import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isRuntimePublicAssetKept } from '../vite.config.ts';
import assets from '../src/content/endingAudioAssets.json' with { type: 'json' };
import {
  EVELYN_CYLINDER_VOICE_URLS,
  resolveDialogueVoiceUrl,
} from '../src/game/audio/voiceAssets.ts';

test('生产构建保留全部运行时音频：结局音效与既有人声都在发布白名单内', () => {
  const runtimePaths = [
    ...assets.effects.map((effect) => effect.url),
    ...EVELYN_CYLINDER_VOICE_URLS,
    resolveDialogueVoiceUrl({
      nodeId: 'npc_arthur_intro',
      speaker: 'npc',
      lineIndex: 0,
      isReenter: false,
      npcId: 'npc_arthur',
      text: '你来了。',
      hasHonorificVariant: false,
      honorific: 'sir',
    }),
  ];
  for (const path of runtimePaths) {
    assert.ok(path, '运行时路径不能为空');
    // 发布插件按 `public/assets/` 下的根目录裁剪，这里对齐到同一相对路径。
    assert.ok(path.startsWith('/assets/'), '运行时路径应位于 /assets/ 下');
    assert.ok(
      isRuntimePublicAssetKept(path.replace(/^\/assets\//, '')),
      `构建会删除 ${path}，玩家将收到 404`,
    );
  }
});

test('发布白名单仍会裁剪非运行时目录，避免把工程资产带上线', () => {
  assert.equal(isRuntimePublicAssetKept('audio/vo/ending/a.ogg'), true);
  assert.equal(isRuntimePublicAssetKept('models/characters/npc.glb'), true);
  assert.equal(isRuntimePublicAssetKept('models/props/clock.glb'), false);
  assert.equal(isRuntimePublicAssetKept('audio'), true);
  assert.notEqual(isRuntimePublicAssetKept('audio_backup/x.ogg'), true);
});
