import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CLUE_FLAGS } from '../src/content/clues.ts';
import { content } from '../src/content/index.ts';
import { getItemByFlag, ITEM_IDS, items } from '../src/content/items.ts';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import { KNOWN_STORY_FLAGS } from '../src/content/storyFlags.ts';
import { DialogueSystem } from '../src/game/dialogue/DialogueSystem.ts';
import {
  buildInventoryView,
  countHeldInventoryItems,
} from '../src/game/inventory/inventory.ts';
import type { StoryFlagValue } from '../src/shared/types/content.ts';
import type { DialogueView } from '../src/shared/types/dialogue.ts';

const knownFlags = new Set<string>([...KNOWN_STORY_FLAGS, ...CLUE_FLAGS]);
const regionIds = new Set(villaGreybox.regions.map((region) => region.id));
const regionNames = new Map(
  villaGreybox.regions.map((region) => [region.id, region.name]),
);

test('背包物品定义：ID 唯一，且所有标记与区域合法', () => {
  assert.equal(ITEM_IDS.size, items.length);
  for (const item of items) {
    assert.ok(item.title.trim().length > 0, `${item.id} 缺少名称`);
    assert.ok(item.description.trim().length > 0, `${item.id} 缺少描述`);
    assert.ok(item.usage.trim().length > 0, `${item.id} 缺少用途说明`);
    assert.ok(
      knownFlags.has(item.flag),
      `${item.id} 使用了未登记的持有标记：${item.flag}`,
    );
    assert.ok(
      item.sourceLocationId === 'player' ||
        regionIds.has(item.sourceLocationId),
      `${item.id} 的来源区域无效：${item.sourceLocationId}`,
    );
    assert.ok(
      regionIds.has(item.targetLocationId),
      `${item.id} 的目标区域无效：${item.targetLocationId}`,
    );
    for (const cond of item.usedWhen ?? []) {
      assert.ok(
        knownFlags.has(cond.flag),
        `${item.id} 的使用条件引用了未登记标记：${cond.flag}`,
      );
    }
    assert.equal(getItemByFlag(item.flag)?.id, item.id);
  }
});

test('背包视图：按剧情标记派生持有物品、状态与当前区域提示', () => {
  const empty = buildInventoryView({
    items,
    flags: {},
    regionNames,
  });
  assert.equal(empty.total, 0);
  assert.equal(empty.items.length, 0);
  assert.equal(countHeldInventoryItems(items, {}), 0);

  const flags: Record<string, StoryFlagValue> = {
    'story.has_letter': true,
    'story.housekeeper_key': true,
    'item.storage_key': true,
    'clue.newspaper': true,
  };
  const view = buildInventoryView({
    items,
    flags,
    regionNames,
    currentRegionId: 'villa_evelyn_room',
  });

  assert.equal(view.total, 3);
  assert.equal(view.keyCount, 2);
  assert.equal(view.usableCount, 2);
  assert.equal(view.usedCount, 1);
  assert.equal(countHeldInventoryItems(items, flags), 3);

  const housekeeperKey = view.items.find(
    (entry) => entry.id === 'item_housekeeper_key',
  );
  assert.ok(housekeeperKey);
  assert.equal(housekeeperKey.title, '伊芙琳卧室钥匙');
  assert.equal(housekeeperKey.status, 'usable');
  assert.equal(housekeeperKey.statusLabel, '可开锁');
  assert.equal(housekeeperKey.sourceLabel, '餐厅');
  assert.equal(housekeeperKey.targetRegionLabel, '伊芙琳的卧室');
  assert.equal(housekeeperKey.isAtTargetRegion, true);

  const storageKey = view.items.find(
    (entry) => entry.id === 'item_storage_key',
  );
  assert.ok(storageKey);
  assert.equal(storageKey.status, 'used');
  assert.equal(storageKey.statusLabel, '已开锁');
  assert.equal(storageKey.isAtTargetRegion, false);
});

function showChoices(system: DialogueSystem): DialogueView {
  let view = system.view();
  assert.ok(view);
  while (view.canContinue) {
    system.advance();
    view = system.view();
    assert.ok(view);
  }
  return view;
}

test('霍尔太太对话：进入房间钥匙节点即收入钥匙，且可在单次对话内同时完成取钥匙与夜间证词', () => {
  const flags: Record<string, StoryFlagValue> = {
    'story.arrived': true,
    'story.met_housekeeper': true,
    'story.housekeeper_warm': true,
    'player.honorific': 'sir',
  };
  const system = new DialogueSystem({
    dialogues: content.dialogues,
    choiceGuides: content.dialogueChoiceGuides,
    npcNames: new Map(content.npcs.map((npc) => [npc.id, npc.name])),
    host: {
      getFlags: () => flags,
      getActiveTaskId: () => 'step_coverup',
      setFlag: (key, value) => {
        flags[key] = value;
      },
      discoverClue: () => {},
      recordChoice: () => {},
      onChange: () => {},
    },
  });

  // 路径 1：先问夜间证词，在证词末尾直接向霍尔太太索取钥匙。
  assert.equal(
    system.openForNpc('npc_housekeeper', 'NPC_housekeeper_dining_door'),
    true,
  );
  showChoices(system);
  assert.equal(system.choose('ask_evelyn'), true);
  showChoices(system);
  assert.equal(system.choose('ask_night'), true);
  showChoices(system);
  assert.equal(system.choose('press'), true);
  showChoices(system);
  assert.equal(system.choose('ask_alive'), true);

  const night04View = showChoices(system);
  assert.equal(night04View.nodeId, 'npc_housekeeper_night_04');
  assert.ok(night04View.choices.some((c) => c.id === 'ask_room'));
  assert.equal(system.choose('ask_room'), true);

  // 进入 npc_housekeeper_room_01 时即已拿到钥匙与开门权限，即使直接按收起也不会漏拿。
  const roomView = system.view();
  assert.equal(roomView?.nodeId, 'npc_housekeeper_room_01');
  assert.equal(flags['story.knows_coverup'], true);
  assert.equal(flags['story.housekeeper_key'], true);
  assert.equal(flags['story.evelyn_room_open'], true);

  const bag = buildInventoryView({ items, flags, regionNames });
  assert.ok(bag.items.some((item) => item.id === 'item_housekeeper_key'));
});

test('霍尔太太对话：若只问完夜间搬运就离开，重新对话时入口仍提示为下一步', () => {
  const flags: Record<string, StoryFlagValue> = {
    'story.arrived': true,
    'story.met_housekeeper': true,
    'story.housekeeper_warm': true,
    'player.honorific': 'sir',
  };
  const system = new DialogueSystem({
    dialogues: content.dialogues,
    choiceGuides: content.dialogueChoiceGuides,
    npcNames: new Map(content.npcs.map((npc) => [npc.id, npc.name])),
    host: {
      getFlags: () => flags,
      getActiveTaskId: () => 'step_coverup',
      setFlag: (key, value) => {
        flags[key] = value;
      },
      discoverClue: () => {},
      recordChoice: () => {},
      onChange: () => {},
    },
  });

  system.openForNpc('npc_housekeeper', 'NPC_housekeeper_dining_door');
  showChoices(system);
  system.choose('ask_evelyn');
  showChoices(system);
  system.choose('ask_night');
  showChoices(system);
  system.choose('press');
  showChoices(system);
  system.choose('ask_alive');
  showChoices(system);
  system.choose('leave');

  assert.equal(flags['story.knows_coverup'], true);
  assert.equal(flags['story.housekeeper_key'], undefined);

  // 重新打开对话时，因尚未拿到钥匙，ask_evelyn 仍保持为 next 状态。
  system.openForNpc('npc_housekeeper', 'NPC_housekeeper_dining_door');
  const reenterView = showChoices(system);
  const askEvelyn = reenterView.choices.find((c) => c.id === 'ask_evelyn');
  assert.equal(askEvelyn?.guideStatus, 'next');
});
