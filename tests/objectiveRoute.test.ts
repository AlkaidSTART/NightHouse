import assert from 'node:assert/strict';
import { test } from 'node:test';
import { describeRoute } from '../src/ui/hud/objectiveRoute.ts';

function route(
  targetRegionId: string,
  playerRegionId: string | null,
  position: [number, number, number],
) {
  const info = describeRoute(targetRegionId, playerRegionId, position);
  assert.ok(info);
  return info;
}

test('院子里先指向正门台阶，避免斜着撞上护墙', () => {
  const info = route('villa_hall', 'scene_gate', [4, -0.75, 11.5]);
  assert.equal(info.arrived, false);
  assert.equal(info.levelHint, '进入宅内');
  assert.equal(info.via, '正门');
  // 台阶底端在 (0, 10.1)，直线指向门厅中心会走成西北并卡在台阶侧墙。
  assert.equal(info.direction, '西');
  assert.ok(info.distance !== null && Math.abs(info.distance - 4.24) < 0.05);
});

test('喷泉挡在车道正中时先绕到一侧', () => {
  const approach = route('villa_hall', 'scene_gate', [0, -0.75, 38.5]);
  assert.equal(approach.direction, '北');
  assert.equal(approach.via, '正门');
  // 从出生点到台阶是 28 米；绕行点 (2, 21.5) 更近。
  assert.ok(approach.distance !== null && approach.distance < 20);

  const alongside = route('villa_hall', 'scene_gate', [0, -0.75, 20]);
  assert.equal(alongside.direction, '东北');
  assert.ok(alongside.distance !== null && alongside.distance < 4.5);

  // 卡在喷泉南沿时提示必须取整成东北，否则玩家会一直顶着喷泉往北走。
  const blocked = route('villa_hall', 'scene_gate', [0, -0.75, 23.3]);
  assert.equal(blocked.direction, '东北');

  const past = route('villa_hall', 'scene_gate', [0, -0.75, 16]);
  assert.equal(past.direction, '北');
});

test('走到台阶范围内后改指正门', () => {
  const info = route('villa_hall', 'scene_gate', [1.5, -0.2, 10.0]);
  assert.equal(info.via, '正门');
  assert.equal(info.direction, '西北');
  assert.ok(info.distance !== null && info.distance < 3.5);
});

test('从一层出门同样先走正门台阶', () => {
  const info = route('scene_gate', 'villa_hall', [0, 0, 3]);
  assert.equal(info.levelHint, '走到室外');
  assert.equal(info.via, '正门');
  assert.equal(info.direction, '南');
});

test('上楼先指向主楼梯脚下，再沿梯面逐段引导', () => {
  const foot = route('villa_evelyn_room', 'villa_hall', [0, 0, 2.5]);
  assert.equal(foot.levelHint, '需上楼');
  assert.equal(foot.via, '主楼梯');
  assert.equal(foot.direction, '东');

  const flightA = route('villa_evelyn_room', 'villa_corridor', [3.3, 1.2, 0.5]);
  assert.equal(flightA.direction, '北');
  assert.ok(flightA.distance !== null && flightA.distance < 2);

  const landing = route('villa_evelyn_room', 'villa_corridor', [3.3, 1.7, -1.2]);
  assert.equal(landing.direction, '西');
});

test('下楼先到平台，再向南下第一段楼梯', () => {
  const corridor = route('villa_hall', 'villa_corridor', [-8, 3.4, -1]);
  assert.equal(corridor.levelHint, '需下楼');
  assert.equal(corridor.via, '主楼梯');
  assert.equal(corridor.direction, '东');

  const landing = route('villa_hall', 'villa_corridor', [3.3, 3.4, -1.3]);
  assert.equal(landing.direction, '南');
});

test('同层目标仍指向房间中心，不附加出入口', () => {
  const info = route('villa_parlor', 'villa_hall', [0, 0, 2.5]);
  assert.equal(info.via, null);
  assert.equal(info.levelHint, null);
  assert.equal(info.direction, '西');
});

test('已到达目标区域时不再提示路线', () => {
  const info = route('villa_hall', 'villa_hall', [0, 0, 2.5]);
  assert.equal(info.arrived, true);
  assert.equal(info.via, null);
});
