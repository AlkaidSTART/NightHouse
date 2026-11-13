import assert from 'node:assert/strict';
import { test } from 'node:test';
import { content } from '../src/content/index.ts';
import { endings, presentEnding } from '../src/content/endings.ts';
import { resolveEnding } from '../src/game/story/endingResolver.ts';
import type { StoryFlags } from '../src/game/story/conditions.ts';

test('结局路由：签字进入继承体面，拒签进入拒绝签字', () => {
  assert.equal(
    resolveEnding({ 'choice.midnight': 'sign' }, endings)?.id,
    'ending_signed',
  );
  assert.equal(
    resolveEnding({ 'choice.midnight': 'refuse' }, endings)?.id,
    'ending_refused',
  );
  assert.equal(resolveEnding({}, endings), null);
});

test('结局已接入内容注册表', () => {
  assert.equal(content.endings.length, 3);
  assert.deepEqual(
    content.endings.map((ending) => ending.id),
    ['ending_echo', 'ending_refused', 'ending_signed'],
  );
});

test('完整证据链的拒签优先进入隐藏结局', () => {
  assert.equal(
    resolveEnding(
      {
        'choice.midnight': 'refuse',
        'clue.captains_log': true,
        'clue.crew_names': true,
        'clue.insurance_policy': true,
        'story.heard_recording': true,
        'story.housekeeper_testimony': true,
        'story.arthur_confessed': true,
      },
      endings,
    )?.id,
    'ending_echo',
  );
});

test('隐藏结局返回独立演出视图', () => {
  const view = presentEnding('ending_echo', {});
  assert.ok(view);
  assert.equal(view.title, '让她说话');
  assert.equal(view.subtitle, '你让她说完了。');
  assert.ok(view.paragraphs.some((line) => line.includes('托马斯·布伦南')));
});

test('拒签结局按账本、赔付单与实际出示区分强/弱变体', () => {
  const strong = presentEnding('ending_refused', {
    'choice.midnight': 'refuse',
    'story.evidence_presented': true,
    'clue.shipping_ledger': true,
    'clue.insurance_policy': true,
  });
  assert.equal(strong?.subtitle, '你得到了真话。');

  const weak = presentEnding('ending_refused', {
    'choice.midnight': 'refuse',
    'clue.shipping_ledger': true,
  });
  assert.equal(weak?.subtitle, '你拒绝了，但没有人听见。');

  // 手上齐全但选择安静拒签时，不能凭空播放当众摊牌的强变体。
  const quiet = presentEnding('ending_refused', {
    'choice.midnight': 'refuse',
    'clue.shipping_ledger': true,
    'clue.insurance_policy': true,
  });
  assert.equal(quiet?.subtitle, '你拒绝了，但没有人听见。');
});

test('签字结局在持有证据时追加旁白', () => {
  const clean = presentEnding('ending_signed', { 'choice.midnight': 'sign' });
  assert.ok(clean);
  assert.equal(
    clean.paragraphs.some((line) => line.includes('留在书房')),
    false,
  );

  const withEvidence: StoryFlags = {
    'choice.midnight': 'sign',
    'clue.medical_record': true,
  };
  const evidence = presentEnding('ending_signed', withEvidence);
  assert.ok(evidence);
  assert.equal(
    evidence.paragraphs.at(-1),
    '你把那些纸留在了书房。它们会一直在那儿。',
  );
});

test('未知结局 ID 不返回演出视图', () => {
  assert.equal(presentEnding('ending_unknown', {}), null);
});
