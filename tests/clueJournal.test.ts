import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clues } from '../src/content/clues.ts';
import { npcs } from '../src/content/npcs.ts';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import { buildClueJournalView } from '../src/game/clues/clueJournal.ts';

const regionNames = new Map(
  villaGreybox.regions.map((region) => [region.id, region.name]),
);
const npcNames = new Map(npcs.map((npc) => [npc.id, npc.name]));

function build(discoveredClueIds: readonly string[]) {
  return buildClueJournalView({
    clues,
    discoveredClueIds,
    regionNames,
    npcNames,
  });
}

test('线索面板：只列出已发现的线索，忽略未知 ID', () => {
  const view = build([
    'clue_evelyn_letter',
    'clue_tide_table',
    'clue_not_registered',
  ]);

  assert.deepEqual(
    view.entries.map((entry) => entry.id),
    ['clue_evelyn_letter', 'clue_tide_table'],
  );
  assert.equal(view.total, 2);
  assert.equal(view.mainCount, 2);
  assert.equal(view.supportingCount, 0);
  assert.equal(view.ambientCount, 0);
});

test('线索面板：随身线索与房间名称显示为可读地点', () => {
  const view = build(['clue_evelyn_letter', 'clue_tide_table']);
  const letter = view.entries.find((entry) => entry.id === 'clue_evelyn_letter');
  const tide = view.entries.find((entry) => entry.id === 'clue_tide_table');

  assert.equal(letter?.locationLabel, '随身');
  assert.equal(tide?.locationLabel, '书房');
});

test('线索面板：主线排在辅助与环境线索之前', () => {
  const view = build([
    'clue_newspaper',
    'clue_evelyn_letter',
    'clue_pendulum',
  ]);

  assert.deepEqual(
    view.entries.map((entry) => entry.priority),
    ['main', 'supporting', 'supporting'],
  );
  assert.equal(view.entries[0]?.id, 'clue_evelyn_letter');
});

test('线索面板：相关 NPC 显示姓名而不是内部 ID', () => {
  const view = build(['clue_hall_testimony']);
  assert.deepEqual(view.entries[0]?.relatedNpcNames, ['霍尔太太']);
});

test('线索面板：没有发现线索时返回空列表', () => {
  const view = build([]);
  assert.deepEqual(view.entries, []);
  assert.equal(view.total, 0);
  assert.equal(view.mainCount, 0);
  assert.equal(view.supportingCount, 0);
  assert.equal(view.ambientCount, 0);
});

test('线索面板：自由搜索到的世界档案单独统计', () => {
  const view = build(['clue_greyharbour', 'clue_family_motto']);

  assert.equal(view.total, 2);
  assert.equal(view.ambientCount, 2);
  assert.deepEqual(
    view.entries.map((entry) => entry.priority),
    ['ambient', 'ambient'],
  );
});
