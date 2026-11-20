import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { presentEnding } from '../src/content/endings.ts';
import { buildEndingPerformance } from '../src/content/endingPerformance.ts';
import { parseEndingVoiceCatalog, type EndingVoiceCatalog } from '../src/content/endingVoiceCatalogData.ts';
import assets from '../src/content/endingAudioAssets.json' with { type: 'json' };
import type { StoryFlagValue } from '../src/shared/types/content.ts';

interface ManifestClip {
  clipId: string;
  group: string;
  text: string;
  runtimePath: string;
}

const manifest = JSON.parse(
  readFileSync('assets/audio/vo/ending_manifest/ending_vo.json', 'utf8'),
) as { clips: ManifestClip[] };

/** 用文字清单构造目录，不依赖本机 44 个 OGG；时长只影响播放，不影响映射。 */
const catalog: EndingVoiceCatalog = parseEndingVoiceCatalog({
  version: 1,
  run: 'test_fixture',
  clips: manifest.clips.map((clip) => ({
    clipId: clip.clipId,
    group: clip.group,
    text: clip.text,
    url: clip.runtimePath,
    durationSeconds: 1,
  })),
});
const emptyCatalog = parseEndingVoiceCatalog({ version: 1, run: 'none', clips: [] });

function performance(id: string, flags: Record<string, StoryFlagValue> = {}, source = catalog) {
  const view = presentEnding(id, flags); assert.ok(view);
  const result = buildEndingPerformance(view, flags, source, assets.effects); assert.ok(result); return result;
}

test('四种结局均先呈现同一六段回收，按真实变体映射，不泄漏其他分支', () => {
  const strong = { 'story.evidence_presented': true, 'clue.shipping_ledger': true, 'clue.insurance_policy': true };
  const cases = [performance('ending_signed'), performance('ending_signed', { 'clue.captains_log': true }),
    performance('ending_refused'), performance('ending_refused', strong), performance('ending_echo')];
  const counts = [7, 8, 7, 11, 12];
  for (const [index, item] of cases.entries()) {
    assert.equal(item.voiceAvailable, true);
    assert.equal(item.paragraphs.filter((p) => p.section === 'truth').length, 6);
    assert.equal(item.paragraphs.filter((p) => p.section === 'ending').length, counts[index]);
    assert.deepEqual(item.paragraphs.slice(0, 6), cases[0]?.paragraphs.slice(0, 6));
  }
  assert.equal(cases[0]?.paragraphs.some((p) => p.id === 'VO_Ending_Signed_P08'), false);
  assert.equal(cases[1]?.paragraphs.some((p) => p.id === 'VO_Ending_Signed_P08'), true);
});

test('隐藏结局点名后立即全静音一秒，只播放一次十三下；弱拒签只有十二下', () => {
  const echo = performance('ending_echo');
  const index = echo.steps.findIndex((step) => step.kind === 'voice' && step.paragraphId === 'VO_Ending_Echo_P05');
  assert.deepEqual(echo.steps[index + 1], { kind: 'silence', milliseconds: 1000, quiet: true });
  const clock = echo.steps[index + 2]; assert.ok(clock?.kind === 'effect');
  assert.ok(clock.url.endsWith('clock_thirteen.ogg'));
  assert.equal(echo.steps.filter((step) => step.kind === 'effect').length, 1);
  const weak = performance('ending_refused');
  const weakClocks = weak.steps.filter((step) => step.kind === 'effect');
  assert.equal(weakClocks.length, 1);
  assert.ok(weakClocks.every((step) => step.kind === 'effect' && step.url.endsWith('clock_twelve.ogg')));
});

test('签署钟声疏远，强拒签使用原文之后的单独第十三下收尾', () => {
  const signed = performance('ending_signed');
  assert.ok(signed.steps.some((step) => step.kind === 'effect' && step.url.endsWith('clock_thirteen_distant.ogg')));
  const strong = performance('ending_refused', { 'story.evidence_presented': true, 'clue.shipping_ledger': true, 'clue.insurance_policy': true });
  const penultimate = strong.steps[strong.steps.length - 2];
  assert.ok(penultimate?.kind === 'effect' && penultimate.url.endsWith('clock_thirteenth.ogg'));
});

test('源正文变化时拒绝旧配音映射，但仍保留完整字幕供阅读', () => {
  const view = presentEnding('ending_echo', {}); assert.ok(view);
  const changed = buildEndingPerformance({ ...view, paragraphs: ['正文已修改'] }, {}, catalog, assets.effects);
  assert.ok(changed); assert.equal(changed.voiceAvailable, false);
  assert.deepEqual(changed.paragraphs.filter((p) => p.section === 'ending').map((p) => p.text), ['正文已修改']);
  assert.equal(buildEndingPerformance({ ...view, id: 'unknown' }, {}, catalog, assets.effects), null);
});

test('公开版没有旁白目录时四个分支仍显示完整字幕，并只播放原创音效', () => {
  const strong = { 'story.evidence_presented': true, 'clue.shipping_ledger': true, 'clue.insurance_policy': true };
  const cases: Array<{ id: string; flags: Record<string, StoryFlagValue>; clock: string; branch: number }> = [
    { id: 'ending_signed', flags: {}, clock: 'clock_thirteen_distant.ogg', branch: 7 },
    { id: 'ending_signed', flags: { 'clue.captains_log': true }, clock: 'clock_thirteen_distant.ogg', branch: 8 },
    { id: 'ending_refused', flags: strong, clock: 'clock_thirteenth.ogg', branch: 11 },
    { id: 'ending_refused', flags: {}, clock: 'clock_twelve.ogg', branch: 7 },
    { id: 'ending_echo', flags: {}, clock: 'clock_thirteen.ogg', branch: 12 },
  ];
  for (const item of cases) {
    const result = performance(item.id, item.flags, emptyCatalog);
    assert.equal(result.voiceAvailable, false);
    assert.equal(result.paragraphs.filter((p) => p.section === 'truth').length, 6);
    assert.equal(result.paragraphs.filter((p) => p.section === 'ending').length, item.branch);
    assert.deepEqual(result.paragraphs.slice(0, 6).map((p) => p.id),
      ['VO_Ending_TruthRecap_P01', 'VO_Ending_TruthRecap_P02', 'VO_Ending_TruthRecap_P03',
        'VO_Ending_TruthRecap_P04', 'VO_Ending_TruthRecap_P05', 'VO_Ending_TruthRecap_P06']);
    assert.equal(result.steps.some((step) => step.kind === 'voice'), false);
    const effects = result.steps.filter((step) => step.kind === 'effect');
    assert.equal(effects.length, 1);
    assert.ok(effects[0]?.kind === 'effect' && effects[0].url.endsWith(item.clock));
    assert.ok(result.roomUrl.endsWith('room_rain.ogg'));
  }
});

test('所有原创音效运行文件存在且有数据；旁白目录缺失不阻止演出', () => {
  assert.equal(assets.effects.length, 13);
  for (const effect of assets.effects) {
    const file = `public${effect.url}`;
    assert.ok(existsSync(file), `缺少 ${file}`); assert.ok(statSync(file).size > 0);
    assert.equal(new TextDecoder().decode(readFileSync(file).slice(0, 4)), 'OggS');
    assert.ok(effect.durationSeconds > 0);
  }
});
