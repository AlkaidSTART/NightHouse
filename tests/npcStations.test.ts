import assert from 'node:assert/strict';
import { test } from 'node:test';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import { selectNpcStations } from '../src/game/scene/npcStations.ts';
import type { StoryFlags } from '../src/game/story/conditions.ts';

function stations(flags: StoryFlags): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [npcId, spot] of selectNpcStations(villaGreybox.npcSpots, flags)) {
    result[npcId] = spot.id;
  }
  return result;
}

const ARRIVED: StoryFlags = { 'story.arrived': true };

test('NPC 站位：刚进门时只有管家在门口，亚瑟尚未出场', () => {
  assert.deepEqual(stations(ARRIVED), {
    npc_housekeeper: 'NPC_housekeeper_front_door',
  });
});

test('NPC 站位：管家谈完后亚瑟出现在客厅', () => {
  assert.deepEqual(
    stations({ ...ARRIVED, 'story.arthur_called': true }),
    {
      npc_housekeeper: 'NPC_housekeeper_front_door',
      npc_arthur: 'NPC_arthur_parlor_fireplace',
    },
  );
});

test('NPC 站位：只点了对话选项（已见面）时亚瑟仍留在客厅', () => {
  assert.equal(
    stations({ ...ARRIVED, 'story.met_arthur': true }).npc_arthur,
    'NPC_arthur_parlor_fireplace',
  );
});

test('NPC 站位：亚瑟谈完后进入晚宴，医生到访后出现在正门', () => {
  const flags: StoryFlags = {
    ...ARRIVED,
    'story.arthur_called': true,
    'story.met_arthur': true,
    'story.arthur_talked': true,
    'story.met_doctor': true,
  };
  assert.deepEqual(stations(flags), {
    npc_housekeeper: 'NPC_housekeeper_dining_door',
    npc_arthur: 'NPC_arthur_dining_head',
    npc_doctor: 'NPC_doctor_front_door_b4',
  });
});

test('NPC 站位：十三下之后三人同时出现在 C5 规定的站位', () => {
  const flags: StoryFlags = {
    ...ARRIVED,
    'story.arthur_called': true,
    'story.met_arthur': true,
    'story.arthur_talked': true,
    'story.met_doctor': true,
    'story.clock_repaired': true,
  };
  assert.deepEqual(stations(flags), {
    npc_housekeeper: 'NPC_housekeeper_corridor_mouth',
    npc_arthur: 'NPC_arthur_gallery_rail',
    npc_doctor: 'NPC_doctor_dining_door',
  });
});

test('NPC 站位：掌握封口证据后亚瑟回到书房对质', () => {
  const flags: StoryFlags = {
    ...ARRIVED,
    'story.arthur_called': true,
    'story.met_arthur': true,
    'story.arthur_talked': true,
    'story.met_doctor': true,
    'story.clock_repaired': true,
    'story.knows_coverup': true,
  };
  assert.equal(stations(flags).npc_arthur, 'NPC_arthur_study_desk');

  const clueOnly: StoryFlags = { ...ARRIVED, 'clue.shipping_ledger': true };
  assert.equal(stations(clueOnly).npc_arthur, 'NPC_arthur_study_desk');
});

test('NPC 站位：午夜进入 B10，签字桌、门边、楼梯口各就各位', () => {
  const flags: StoryFlags = {
    ...ARRIVED,
    'story.arthur_called': true,
    'story.met_arthur': true,
    'story.arthur_talked': true,
    'story.met_doctor': true,
    'story.clock_repaired': true,
    'story.knows_coverup': true,
    'story.midnight': true,
  };
  assert.deepEqual(stations(flags), {
    npc_housekeeper: 'NPC_housekeeper_hall_door_b10',
    npc_arthur: 'NPC_arthur_signing_table',
    npc_doctor: 'NPC_doctor_stair_foot',
  });
});

test('NPC 站位：没有剧情条件时不生成任何角色', () => {
  assert.deepEqual(stations({}), {});
});

test('NPC 站位不落在碰撞家具内部', () => {
  const colliders = villaGreybox.boxes.filter((box) => box.collide);
  for (const spot of villaGreybox.npcSpots) {
    const [x, y, z] = spot.position;
    // 膝盖高度落在家具体积内，就说明站位踩进了桌椅、柜子或墙里。
    const knee = y + 0.3;
    const inside = colliders.find(
      (box) =>
        x > box.min[0] &&
        x < box.max[0] &&
        knee > box.min[1] &&
        knee < box.max[1] &&
        z > box.min[2] &&
        z < box.max[2],
    );
    assert.equal(inside, undefined, `${spot.id} 落在 ${inside?.id} 内部`);
  }
});

/** 门扇绕合页从关闭位扫到全开位的 90° 扇形。 */
function insideDoorSwing(
  door: (typeof villaGreybox.doors)[number],
  x: number,
  z: number,
): boolean {
  const dx = x - door.hinge[0];
  const dz = z - door.hinge[2];
  if (Math.hypot(dx, dz) > door.width) {
    return false;
  }
  const angle =
    door.axis === 'x'
      ? door.swing === 1
        ? Math.atan2(-dz, dx)
        : Math.atan2(dz, dx)
      : door.swing === 1
        ? Math.atan2(dx, dz)
        : Math.atan2(-dx, dz);
  return angle >= 0 && angle <= Math.PI / 2;
}

test('NPC 站位不在任何门的开合扇形里', () => {
  for (const spot of villaGreybox.npcSpots) {
    for (const door of villaGreybox.doors) {
      if (door.sealed) {
        continue;
      }
      assert.equal(
        insideDoorSwing(door, spot.position[0], spot.position[2]),
        false,
        `${spot.id} 位于 ${door.id} 的开合扇形内`,
      );
    }
  }
});
