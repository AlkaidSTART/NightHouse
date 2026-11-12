import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CLUE_FLAGS, CLUE_IDS } from '../src/content/clues.ts';
import { content } from '../src/content/index.ts';
import { quests } from '../src/content/quests.ts';
import { KNOWN_STORY_FLAGS } from '../src/content/storyFlags.ts';
import type { DialogueNode, StoryCondition } from '../src/shared/types/content.ts';

const nodeById = new Map<string, DialogueNode>();
for (const node of content.dialogues) {
  nodeById.set(node.id, node);
}

const npcIds = new Set(content.npcs.map((npc) => npc.id));
const knownFlags = new Set<string>([...KNOWN_STORY_FLAGS, ...CLUE_FLAGS]);
const questStepIds = new Set(
  quests.flatMap((quest) => quest.steps.map((step) => step.id)),
);

function assertKnownConditions(where: string, conditions?: readonly StoryCondition[]): void {
  for (const condition of conditions ?? []) {
    assert.ok(
      knownFlags.has(condition.flag),
      `${where} 引用了未登记的剧情标记：${condition.flag}`,
    );
  }
}

test('对话节点 ID 唯一，且归属已登记的 NPC', () => {
  assert.equal(nodeById.size, content.dialogues.length);
  for (const node of content.dialogues) {
    assert.ok(npcIds.has(node.npcId), `${node.id} 的 npcId 未登记：${node.npcId}`);
    assert.ok(node.lines.length > 0 || node.choices.length > 0, `${node.id} 是空节点`);
    assertKnownConditions(`${node.id} 节点条件`, node.conditions);
    for (const taskId of node.taskIds ?? []) {
      assert.ok(
        questStepIds.has(taskId),
        `${node.id} 引用了不存在的任务步骤：${taskId}`,
      );
    }
    for (const choice of node.choices) {
      assertKnownConditions(`${node.id}.${choice.id} 选项条件`, choice.conditions);
      for (const taskId of choice.taskIds ?? []) {
        assert.ok(
          questStepIds.has(taskId),
          `${node.id}.${choice.id} 引用了不存在的任务步骤：${taskId}`,
        );
      }
      for (const effect of choice.effects ?? []) {
        switch (effect.type) {
          case 'set-flag':
            assert.ok(
              knownFlags.has(effect.key),
              `${node.id}.${choice.id} 设置了未登记的标记：${effect.key}`,
            );
            break;
          case 'discover-clue':
            assert.ok(
              CLUE_IDS.has(effect.key),
              `${node.id}.${choice.id} 发现未知线索：${effect.key}`,
            );
            break;
          case 'unlock-dialogue':
            assert.ok(
              nodeById.has(effect.key),
              `${node.id}.${choice.id} 解锁了不存在的对话：${effect.key}`,
            );
            break;
        }
      }
    }
  }
});

test('所有选项跳转目标存在，NPC 入口存在', () => {
  for (const node of content.dialogues) {
    for (const choice of node.choices) {
      if (choice.next !== null) {
        assert.ok(
          nodeById.has(choice.next),
          `${node.id}.${choice.id} 跳转到不存在的节点：${choice.next}`,
        );
      }
    }
  }

  for (const npc of content.npcs) {
    const entry = nodeById.get(npc.dialogueEntryId);
    assert.ok(entry, `${npc.id} 的入口不存在：${npc.dialogueEntryId}`);
    assert.equal(entry.npcId, npc.id);
  }
});

test('每个 NPC 的节点都能从入口到达，且存在结束路径', () => {
  // 场景站位会按剧情进度选择不同入口，这些入口不在 NPC 的默认入口之下。
  const extraEntries: Readonly<Record<string, readonly string[]>> = {
    npc_arthur: [
      'npc_arthur_dinner_01',
      'npc_arthur_confront_01',
      'npc_arthur_midnight_01',
    ],
    npc_doctor: ['npc_doctor_midnight_01'],
  };

  for (const npc of content.npcs) {
    const seen = new Set<string>();
    const queue = [
      npc.dialogueEntryId,
      ...(extraEntries[npc.id] ?? []),
    ];
    while (queue.length > 0) {
      const id = queue.shift();
      if (!id || seen.has(id)) {
        continue;
      }
      seen.add(id);
      const node = nodeById.get(id);
      assert.ok(node, `跳转目标不存在：${id}`);
      for (const choice of node.choices) {
        if (choice.next !== null) {
          queue.push(choice.next);
        }
      }
    }

    for (const node of content.dialogues) {
      if (node.npcId === npc.id) {
        assert.ok(seen.has(node.id), `${node.id} 无法从 ${npc.id} 的入口到达`);
      }
    }
  }

  const canExit = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of content.dialogues) {
      if (canExit.has(node.id)) {
        continue;
      }
      const exits = node.choices.some(
        (choice) => choice.next === null || canExit.has(choice.next),
      );
      if (exits) {
        canExit.add(node.id);
        changed = true;
      }
    }
  }

  for (const node of content.dialogues) {
    assert.ok(canExit.has(node.id), `${node.id} 没有任何路径可以结束对话`);
  }
});
