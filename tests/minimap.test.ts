import assert from 'node:assert/strict';
import { test } from 'node:test';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import {
  buildMinimapLevel,
  MINIMAP_SIZE,
  resolveMinimapLevel,
  worldToMinimap,
  type MinimapLevelModel,
} from '../src/ui/hud/minimapModel.ts';

function ids(model: MinimapLevelModel): string[] {
  return model.rooms.map((room) => room.id).sort();
}

function roomIds(model: MinimapLevelModel): string[] {
  return [...new Set(ids(model))];
}

test('小地图按区域与脚底高度切换楼层', () => {
  assert.equal(resolveMinimapLevel('scene_gate', 0), 'outdoor');
  assert.equal(resolveMinimapLevel('villa_cliff', -1.2), 'outdoor');
  assert.equal(resolveMinimapLevel(null, -0.75), 'outdoor');
  assert.equal(resolveMinimapLevel('villa_hall', 0), 'floor1');
  assert.equal(resolveMinimapLevel('villa_corridor', 3.4), 'floor2');
  assert.equal(resolveMinimapLevel(null, 0), 'floor1');
  assert.equal(resolveMinimapLevel(null, 3.4), 'floor2');
});

test('一层平面只包含一层房间与一层门', () => {
  const model = buildMinimapLevel(villaGreybox, 'floor1');
  assert.deepEqual(roomIds(model), [
    'villa_corridor',
    'villa_dining',
    'villa_hall',
    'villa_parlor',
    'villa_storage',
    'villa_study',
  ]);
  assert.ok(model.rooms.every((room) => !room.muted));
  assert.deepEqual(
    model.doors.map((door) => door.id).sort(),
    [
      'DOOR_dining',
      'DOOR_front',
      'DOOR_parlor',
      'DOOR_sealed_service',
      'DOOR_storage',
      'DOOR_study',
      'DOOR_terrace',
    ],
  );
});

test('二层平面只包含卧室、浴室与二层走廊', () => {
  const model = buildMinimapLevel(villaGreybox, 'floor2');
  assert.deepEqual(roomIds(model), [
    'villa_bathroom',
    'villa_corridor',
    'villa_evelyn_room',
  ]);
  assert.deepEqual(
    model.doors.map((door) => door.id).sort(),
    [
      'DOOR_bathroom',
      'DOOR_evelyn_room',
      'DOOR_sealed_2f_north',
      'DOOR_sealed_2f_south',
    ],
  );
});

test('室外视图包含院子、露台与宅邸轮廓', () => {
  const model = buildMinimapLevel(villaGreybox, 'outdoor');
  const active = model.rooms
    .filter((room) => !room.muted)
    .map((room) => room.id)
    .sort();
  assert.deepEqual(active, ['scene_gate', 'villa_cliff']);
  assert.ok(
    model.rooms.some((room) => room.muted && room.id === 'villa_hall'),
    '宅邸一层应作为暗色轮廓出现',
  );
  assert.deepEqual(
    model.doors.map((door) => door.id),
    ['DOOR_gate'],
  );
});

test('世界坐标映射到画布范围内，且北方向上', () => {
  for (const level of ['outdoor', 'floor1', 'floor2'] as const) {
    const model = buildMinimapLevel(villaGreybox, level);
    for (const room of model.rooms) {
      assert.ok(
        room.x >= 0 &&
          room.y >= 0 &&
          room.x + room.width <= MINIMAP_SIZE + 1e-6 &&
          room.y + room.height <= MINIMAP_SIZE + 1e-6,
        `${level} 中 ${room.id} 超出画布`,
      );
    }
  }

  const outdoor = buildMinimapLevel(villaGreybox, 'outdoor');
  const north = worldToMinimap(outdoor.viewport, 0, -7);
  const south = worldToMinimap(outdoor.viewport, 0, 40);
  assert.ok(north.y < south.y, '较小的 z（北）应显示在画布上方');

  const hall = villaGreybox.regions.find((region) => region.id === 'villa_hall');
  assert.ok(hall);
  const volume = hall.volumes[0];
  assert.ok(volume);
  const floor1 = buildMinimapLevel(villaGreybox, 'floor1');
  const center = worldToMinimap(
    floor1.viewport,
    (volume.min[0] + volume.max[0]) / 2,
    (volume.min[2] + volume.max[2]) / 2,
  );
  assert.ok(center.x > 0 && center.x < MINIMAP_SIZE);
  assert.ok(center.y > 0 && center.y < MINIMAP_SIZE);
});
