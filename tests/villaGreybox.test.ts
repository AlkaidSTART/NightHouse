import assert from 'node:assert/strict';
import { test } from 'node:test';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import {
  CollisionWorld,
  createCollisionWorld,
  PLAYER_RADIUS,
} from '../src/game/collision/CollisionWorld.ts';
import { isOccluded } from '../src/game/interaction/occlusion.ts';
import { DoorSystem } from '../src/game/scene/DoorSystem.ts';
import type { Vec3Tuple } from '../src/shared/types/save';

// 这些测试对应《场景建模方案》§5.1 的灰盒验收清单。

const EYE = 1.7;
const WALK_SPEED = 2.6;
const F2 = 3.4;

type Waypoint = [x: number, z: number];

function openWorld(openDoorIds: 'all' | string[]): CollisionWorld {
  const collision = createCollisionWorld(villaGreybox);
  const doors = new DoorSystem({
    doors: villaGreybox.doors,
    collision,
    getFlags: () => ({}),
    unlockAll: true,
    onChange: () => {},
  });
  for (const door of villaGreybox.doors) {
    if (door.sealed || doors.isOpen(door.id)) {
      continue;
    }
    if (openDoorIds === 'all' || openDoorIds.includes(door.id)) {
      // 远处开门，避开「站在门洞里不能关门」的判定。
      assert.equal(doors.use(door.id, 999, 999).kind, 'opened');
    }
  }
  return collision;
}

/** 像玩家一样朝每个路点直线行走；返回走过的距离，走不到则抛错。 */
function walk(
  world: CollisionWorld,
  start: Vec3Tuple,
  route: Waypoint[],
): { distance: number; end: Vec3Tuple } {
  const state: Vec3Tuple = [...start];
  const next: Vec3Tuple = [0, 0, 0];
  let distance = 0;

  for (const [targetX, targetZ] of route) {
    let guard = 0;
    for (;;) {
      const dx = targetX - state[0];
      const dz = targetZ - state[2];
      const remaining = Math.hypot(dx, dz);
      if (remaining < 0.2) {
        break;
      }
      const step = Math.min(0.1, remaining);
      world.move(next, state[0], state[1], state[2], (dx / remaining) * step, (dz / remaining) * step, PLAYER_RADIUS);
      const moved = Math.hypot(next[0] - state[0], next[2] - state[2]);
      guard += 1;
      if (moved < 1e-4 || guard > 5000) {
        throw new Error(
          `卡在 (${state[0].toFixed(2)}, ${state[1].toFixed(2)}, ${state[2].toFixed(2)})，目标 (${targetX}, ${targetZ})`,
        );
      }
      distance += moved;
      state[0] = next[0];
      state[1] = next[1];
      state[2] = next[2];
    }
  }
  return { distance, end: state };
}

function sightClear(world: CollisionWorld, from: Vec3Tuple, to: Vec3Tuple): boolean {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.hypot(dx, dy, dz);
  const hit = world.raycast(from[0], from[1], from[2], dx / length, dy / length, dz / length, length);
  return !isOccluded(hit, length);
}

function interactablePosition(id: string): Vec3Tuple {
  const item = villaGreybox.interactables.find((entry) => entry.id === id);
  assert.ok(item, `缺少交互点 ${id}`);
  return item.position;
}

function npcHead(id: string): Vec3Tuple {
  const spot = villaGreybox.npcSpots.find((entry) => entry.id === id);
  assert.ok(spot, `缺少站位 ${id}`);
  return [spot.position[0], spot.position[1] + 1.6, spot.position[2]];
}

const SPAWN: Vec3Tuple = [0, 0, 38.5];

const TO_HALL: Waypoint[] = [[0, 34], [-3.5, 24], [-3.5, 19], [0, 12], [0, 8], [0, 5.6]];
const ACT_ONE: Waypoint[] = [
  ...TO_HALL,
  [-3, 3.5], [-6, 3.5], [-3, 3.5], // 客厅
  [0, 5.4], [3, 3.5], [4.8, 3.5], [3, 3.5], // 餐厅
  [1.5, 2.8], [-3, -1], [-8.5, -1], [-8.5, -3.5], [-8.5, -1], // 书房
  [-5, -1], [-5, -3.5], [-5, -1], // 储物间
  [-8.5, -1], [-8.5, -3.5], [-8.5, -1], // 回书房
  [-3, -1], [0, 2.5], // 回门厅
];
const HALL_TO_GALLERY: Waypoint[] = [[1.5, 2.8], [3.3, 2.6], [3.3, -1.2], [2, -1.3], [-1, -1.2]];
const ACT_TWO: Waypoint[] = [
  ...HALL_TO_GALLERY,
  [-5, -1], [-9.5, -1], [-9.5, 2], // 卧室
];
const BEDROOM_TO_STUDY: Waypoint[] = [
  [-9.5, -1], [-1, -1.2], [2, -1.3], [3.3, -1.2], [3.3, 2.6], [1.5, 2.8], // 下楼
  [-3, -1], [-8.5, -1], [-8.5, -3.5], // 一层走廊 → 书房
];

test('场景数据：ID 唯一，摆放点前缀符合约定', () => {
  const ids = [
    ...villaGreybox.boxes.map((item) => item.id),
    ...villaGreybox.doors.map((item) => item.id),
    ...villaGreybox.interactables.map((item) => item.id),
    ...villaGreybox.npcSpots.map((item) => item.id),
    ...villaGreybox.lights.map((item) => item.id),
    ...villaGreybox.spawns.map((item) => item.id),
  ];
  assert.equal(new Set(ids).size, ids.length, 'ID 有重复');
  assert.ok(villaGreybox.doors.every((item) => item.id.startsWith('DOOR_')));
  assert.ok(villaGreybox.interactables.every((item) => item.id.startsWith('INT_')));
  assert.ok(villaGreybox.npcSpots.every((item) => item.id.startsWith('NPC_')));
  assert.ok(villaGreybox.lights.every((item) => item.id.startsWith('LIGHT_')));
});

test('场景数据：10 个区域齐全，且与故事线的区域 ID 一致', () => {
  assert.deepEqual(
    villaGreybox.regions.map((region) => region.id).sort(),
    [
      'scene_gate',
      'villa_bathroom',
      'villa_cliff',
      'villa_corridor',
      'villa_dining',
      'villa_evelyn_room',
      'villa_hall',
      'villa_parlor',
      'villa_storage',
      'villa_study',
    ],
  );
});

test('交互点没有埋在障碍物内部', () => {
  const colliders = villaGreybox.boxes.filter((item) => item.collide);
  for (const item of villaGreybox.interactables) {
    const [x, y, z] = item.position;
    const inside = colliders.find(
      (box) =>
        x > box.min[0] && x < box.max[0] &&
        y > box.min[1] && y < box.max[1] &&
        z > box.min[2] && z < box.max[2],
    );
    assert.equal(inside, undefined, `${item.id} 位于 ${inside?.id} 内部`);
  }
});

test('出生点可以站立', () => {
  const world = openWorld([]);
  assert.ok(world.isStandable(SPAWN[0], SPAWN[2], SPAWN[1], PLAYER_RADIUS));
});

test('第一幕路线不上楼即可走完', () => {
  const world = openWorld('all');
  const { distance, end } = walk(world, SPAWN, ACT_ONE);
  assert.equal(end[1], 0, '第一幕不应离开一层');
  console.log(`  第一幕纯步行：${distance.toFixed(1)} m，约 ${(distance / WALK_SPEED).toFixed(0)} 秒`);
});

test('第二幕路线：上楼到卧室，再带着蜡筒回书房', () => {
  const world = openWorld('all');
  const hall = walk(world, SPAWN, TO_HALL).end;
  const up = walk(world, hall, ACT_TWO);
  assert.ok(Math.abs(up.end[1] - F2) < 1e-6, `卧室应在二层，实际高度 ${up.end[1]}`);
  const back = walk(world, up.end, BEDROOM_TO_STUDY);
  assert.equal(back.end[1], 0);
  assert.ok(back.end[2] < -2, '应回到书房内');
  console.log(`  门厅 → 卧室：${up.distance.toFixed(1)} m，约 ${(up.distance / WALK_SPEED).toFixed(0)} 秒`);
  console.log(`  卧室 → 书房：${back.distance.toFixed(1)} m，约 ${(back.distance / WALK_SPEED).toFixed(0)} 秒`);
});

test('二层的浴室和一层通往崖边的路线可达', () => {
  const world = openWorld('all');
  const hall = walk(world, SPAWN, TO_HALL).end;
  const gallery = walk(world, hall, HALL_TO_GALLERY).end;
  const bathroom = walk(world, gallery, [[-4.7, -1], [-4.7, -3.5]]).end;
  assert.ok(Math.abs(bathroom[1] - F2) < 1e-6);

  const cliff = walk(world, hall, [[1.5, 2.8], [-3, -1], [-10, -1], [-12.5, -1], [-16.5, -0.5], [-20.3, -0.5]]).end;
  assert.ok(Math.abs(cliff[1] - -1.2) < 1e-6, `崖边平台高度 ${cliff[1]}`);
});

test('门关着时进不去：每个上锁区域都被门挡住', () => {
  const world = openWorld(['DOOR_gate', 'DOOR_front']);
  const hall = walk(world, SPAWN, TO_HALL).end;
  const attempts: [string, Waypoint[]][] = [
    ['餐厅', [[3, 3.5], [4.8, 3.5]]],
    ['书房', [[1.5, 2.8], [-3, -1], [-8.5, -1], [-8.5, -3.5]]],
    ['储物间', [[1.5, 2.8], [-3, -1], [-5, -1], [-5, -3.5]]],
    ['露台', [[1.5, 2.8], [-3, -1], [-10, -1], [-12.5, -1]]],
  ];
  for (const [name, route] of attempts) {
    assert.throws(() => walk(world, hall, route), `${name}的门应挡住玩家`);
  }
  const gallery = walk(world, hall, HALL_TO_GALLERY).end;
  assert.throws(() => walk(world, gallery, [[-5, -1], [-9.5, -1], [-9.5, 2]]), '卧室门应挡住玩家');
  assert.throws(() => walk(world, gallery, [[-4.7, -1], [-4.7, -3.5]]), '浴室门应挡住玩家');
});

test('不能穿墙，也不能从回廊、露台或崖边掉下去', () => {
  const world = openWorld('all');
  const hall = walk(world, SPAWN, TO_HALL).end;
  const out: Vec3Tuple = [0, 0, 0];

  // 门厅向西直冲客厅与门厅之间的实墙。
  world.move(out, -3, 0, 1.5, -3, 0, PLAYER_RADIUS);
  assert.ok(out[0] > -4, `穿过了门厅西墙：x=${out[0]}`);

  // 回廊上向南冲出栏杆。
  const gallery = walk(world, hall, HALL_TO_GALLERY).end;
  world.move(out, gallery[0], gallery[1], gallery[2], 0, 3, PLAYER_RADIUS);
  assert.ok(Math.abs(out[1] - F2) < 1e-6, '从回廊掉了下去');
  assert.ok(out[2] < 0);

  // 露台上向北冲出栏杆；崖边平台上向西冲向海面。
  const cliff = walk(world, hall, [[1.5, 2.8], [-3, -1], [-10, -1], [-12.5, -1], [-16.5, -0.5], [-20.3, -0.5]]).end;
  world.move(out, -14, 0, 0, 0, -8, PLAYER_RADIUS);
  assert.ok(out[2] > -4, `越过了露台栏杆：z=${out[2]}`);
  world.move(out, cliff[0], cliff[1], -3, -6, 0, PLAYER_RADIUS);
  assert.ok(out[0] > -23, `越过了崖边：x=${out[0]}`);
  assert.ok(Math.abs(out[1] - -1.2) < 1e-6);
});

test('C5：十三下之后，从门厅中部能同时看到三个站位', () => {
  const world = openWorld('all');
  // 落地钟在回廊正下方，紧贴钟站着时看不到回廊上的人；
  // 玩家要退到门厅中部才能看到亚瑟（故事线 §4.1 的写法是「走出…会看见」）。
  const eye: Vec3Tuple = [-1, EYE, 2.6];
  for (const id of [
    'NPC_arthur_gallery_rail',
    'NPC_doctor_dining_door',
    'NPC_housekeeper_corridor_mouth',
  ]) {
    assert.ok(sightClear(world, eye, npcHead(id)), `${id} 被遮挡`);
  }
});

test('C7：门厅签字桌到走廊口、走廊口到书房门之间没有遮挡', () => {
  const world = openWorld('all');
  const table: Vec3Tuple = [0, EYE, 3.2];
  const corridorMouth: Vec3Tuple = [-3, EYE, -1];
  const studyDoor: Vec3Tuple = [-8.5, 1.2, -1.7];
  assert.ok(sightClear(world, table, corridorMouth));
  assert.ok(sightClear(world, corridorMouth, studyDoor));
});

test('C2：从车道能看到二层那扇不亮的窗', () => {
  const world = openWorld([]);
  const windowBox = villaGreybox.boxes.find((item) => item.id === 'window_evelyn');
  assert.ok(windowBox);
  assert.equal(windowBox.material, 'windowDark');
  const center: Vec3Tuple = [
    (windowBox.min[0] + windowBox.max[0]) / 2,
    (windowBox.min[1] + windowBox.max[1]) / 2,
    windowBox.max[2],
  ];
  assert.ok(sightClear(world, [0, EYE, 30], center));
  assert.ok(sightClear(world, [-3.5, EYE, 21], center));
});

test('画框背面和镜框背面只能从侧面看到', () => {
  const world = openWorld('all');
  const paintingBack = interactablePosition('INT_prop_ship_painting_back');
  assert.ok(!sightClear(world, [-5.25, EYE, 2], paintingBack), '油画背面不应从正面看到');
  assert.ok(sightClear(world, [-4.4, EYE, 0.42], paintingBack), '油画背面应能从侧面看到');

  const mirrorBack = interactablePosition('INT_prop_vanity_mirror_back');
  assert.ok(!sightClear(world, [-9, F2 + EYE, 3.65], mirrorBack), '镜框背面不应从正面看到');
  assert.ok(sightClear(world, [-10.6, F2 + EYE, 2.6], mirrorBack), '镜框背面应能从侧面看到');
});

test('隔着墙不能对准交互点', () => {
  const world = openWorld('all');
  // 潮汐表挂在书房南墙内侧，从走廊一侧看不到。
  assert.ok(!sightClear(world, [-7.25, EYE, -1], interactablePosition('INT_prop_tide_table')));
  // 走廊镜挂在走廊南墙，从客厅一侧看不到。
  assert.ok(!sightClear(world, [-7.6, EYE, 1], interactablePosition('INT_prop_corridor_mirror')));
  // 储物间的行李箱隔着东墙，从门厅回廊下方看不到。
  assert.ok(!sightClear(world, [-2, EYE, -1], interactablePosition('INT_prop_luggage')));
});

test('每个交互点都能从某个可站立的位置对准', () => {
  const world = openWorld('all');
  for (const item of villaGreybox.interactables) {
    const [x, y, z] = item.position;
    const floor = y > 3 ? F2 : y < -0.2 ? -1.2 : 0;
    let reachable = false;
    for (let angle = 0; angle < 360 && !reachable; angle += 15) {
      for (const range of [0.8, 1.2, 1.6, 2]) {
        const px = x + Math.cos((angle * Math.PI) / 180) * range;
        const pz = z + Math.sin((angle * Math.PI) / 180) * range;
        const ground = world.groundHeight(px, pz, floor);
        if (ground === null || Math.abs(ground - floor) > 0.4) {
          continue;
        }
        if (!world.isStandable(px, pz, ground, PLAYER_RADIUS)) {
          continue;
        }
        const eye: Vec3Tuple = [px, ground + EYE, pz];
        if (Math.hypot(x - px, y - eye[1], z - pz) <= 3 && sightClear(world, eye, item.position)) {
          reachable = true;
          break;
        }
      }
    }
    assert.ok(reachable, `${item.id} 没有可用的观察位置`);
  }
});
