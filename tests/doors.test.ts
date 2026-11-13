import assert from 'node:assert/strict';
import { test } from 'node:test';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import {
  createCollisionWorld,
  PLAYER_RADIUS,
} from '../src/game/collision/CollisionWorld.ts';
import { DoorSystem, AUTO_CLOSE_DELAY } from '../src/game/scene/DoorSystem.ts';
import {
  areConditionsMet,
  isAnyConditionGroupMet,
  isConditionMet,
} from '../src/game/story/conditions.ts';
import type { StoryFlagValue } from '../src/shared/types/content';
import type { Vec3Tuple } from '../src/shared/types/save';
import type { SceneDoor } from '../src/shared/types/scene';

function setup(flags: Record<string, StoryFlagValue>, unlockAll = false) {
  const collision = createCollisionWorld(villaGreybox);
  const changes: [string, boolean][] = [];
  const doors = new DoorSystem({
    doors: villaGreybox.doors,
    collision,
    getFlags: () => flags,
    unlockAll,
    onChange: (id, open) => changes.push([id, open]),
  });
  return { collision, doors, changes };
}

test('剧情条件：缺省为 true 判定，equals 精确匹配', () => {
  assert.equal(isConditionMet({}, { flag: 'a' }), false);
  assert.equal(isConditionMet({ a: true }, { flag: 'a' }), true);
  assert.equal(isConditionMet({ a: 1 }, { flag: 'a' }), false);
  assert.equal(isConditionMet({ a: 'sign' }, { flag: 'a', equals: 'sign' }), true);
  assert.equal(areConditionsMet({ a: true }, [{ flag: 'a' }, { flag: 'b' }]), false);
  assert.equal(isAnyConditionGroupMet({ b: true }, [[{ flag: 'a' }], [{ flag: 'b' }]]), true);
  assert.equal(isAnyConditionGroupMet({}, []), false);
});

test('上锁的门打不开，并返回反馈而不是静默失败', () => {
  const { doors, changes } = setup({});
  const result = doors.use('DOOR_study', -8.5, -1);
  assert.equal(result.kind, 'locked');
  assert.equal(doors.isOpen('DOOR_study'), false);
  assert.equal(changes.length, 0);
  assert.equal(doors.getPrompt('DOOR_study'), '书房门（锁着）');
});

test('门默认可交互，只有显式关闭后才从交互目标中排除', () => {
  const frontDoor = villaGreybox.doors.find((door) => door.id === 'DOOR_front');
  assert.ok(frontDoor);
  assert.equal(setup({}).doors.isInteractive(frontDoor.id), true);

  const backgroundDoor: SceneDoor = {
    ...frontDoor,
    id: 'DOOR_background',
    interactive: false,
  };
  const collision = createCollisionWorld({ ...villaGreybox, doors: [backgroundDoor] });
  const doors = new DoorSystem({
    doors: [backgroundDoor],
    collision,
    getFlags: () => ({}),
    unlockAll: false,
    onChange: () => undefined,
  });

  assert.equal(doors.isInteractive('DOOR_background'), false);
  assert.equal(doors.isLocked('DOOR_background'), false);
  assert.equal(doors.getPrompt('DOOR_background'), '打开正门');
});

test('剧情标记满足后门可以打开，并真的放行', () => {
  const flags: Record<string, StoryFlagValue> = {};
  const { doors, collision } = setup(flags);
  const out: Vec3Tuple = [0, 0, 0];

  collision.move(out, -8.5, 0, -1, 0, -2, PLAYER_RADIUS);
  assert.ok(out[2] > -2, '门关着时不应进入书房');

  flags['story.met_arthur'] = true;
  assert.deepEqual(doors.use('DOOR_study', -8.5, -1), { kind: 'opened' });
  collision.move(out, -8.5, 0, -1, 0, -2, PLAYER_RADIUS);
  assert.ok(out[2] < -2.5, `门开后应能进入书房，实际 z=${out[2]}`);
});

test('露台门的两个解锁条件任一满足即可', () => {
  assert.equal(setup({}).doors.isLocked('DOOR_terrace'), true);
  assert.equal(setup({ 'story.heard_recording': true }).doors.isLocked('DOOR_terrace'), false);
  assert.equal(setup({ 'clue.hall_testimony': true }).doors.isLocked('DOOR_terrace'), false);
});

test('玩家站在门洞里时不能关门', () => {
  const { doors } = setup({});
  assert.equal(doors.isOpen('DOOR_parlor'), true);
  assert.equal(doors.use('DOOR_parlor', -4, 3.5).kind, 'blocked');
  assert.equal(doors.isOpen('DOOR_parlor'), true);
  assert.deepEqual(doors.use('DOOR_parlor', -2, 3.5), { kind: 'closed' });
  assert.deepEqual(doors.use('DOOR_parlor', -2, 3.5), { kind: 'opened' });
});

test('走查开关不会打开永久锁闭的装饰门', () => {
  const { doors } = setup({}, true);
  assert.equal(doors.isLocked('DOOR_evelyn_room'), false);
  for (const door of villaGreybox.doors.filter((item) => item.sealed)) {
    assert.equal(doors.use(door.id, 0, 0).kind, 'locked');
  }
});

test('玩家打开的门在无人靠近时自动关上', () => {
  const { doors } = setup({ 'story.met_arthur': true });
  assert.deepEqual(doors.use('DOOR_study', -8.5, -1), { kind: 'opened' });

  doors.update(AUTO_CLOSE_DELAY - 0.1, 0, 0);
  assert.equal(doors.isOpen('DOOR_study'), true, '计时未到不应关门');

  doors.update(0.2, 0, 0);
  assert.equal(doors.isOpen('DOOR_study'), false);
  assert.equal(doors.getPrompt('DOOR_study'), '打开书房门');
});

test('计时到点时玩家还在门边，自动关门会等他走开', () => {
  const { doors } = setup({ 'story.met_arthur': true });
  doors.use('DOOR_study', -8.5, -1);

  // 门中心在 (-8.5, -2)，玩家站在门边（距离 0.5 m）。
  doors.update(AUTO_CLOSE_DELAY + 1, -8.5, -1.5);
  assert.equal(doors.isOpen('DOOR_study'), true);

  doors.update(0.1, 0, 0);
  assert.equal(doors.isOpen('DOOR_study'), false);
});

test('初始就敞开的门不会被自动关上', () => {
  const { doors } = setup({});
  assert.equal(doors.isOpen('DOOR_parlor'), true);
  doors.update(1000, 0, 0);
  assert.equal(doors.isOpen('DOOR_parlor'), true);
});
