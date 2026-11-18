import assert from 'node:assert/strict';
import { test } from 'node:test';
import { quests } from '../src/content/quests.ts';
import { villaNavigation } from '../src/content/scenes/villaNavigation.ts';
import { findGroundRoute } from '../src/game/navigation/groundRoute.ts';
import type { Vec3Tuple } from '../src/shared/types/save.ts';

function route(
  targetRegionId: string,
  playerRegionId: string,
  playerPosition: Vec3Tuple,
): Vec3Tuple[] {
  const points = findGroundRoute({
    graph: villaNavigation,
    targetRegionId,
    playerRegionId,
    playerPosition,
  });
  assert.ok(points);
  return points;
}

function hasNear(
  points: readonly Vec3Tuple[],
  expected: Vec3Tuple,
  tolerance = 0.08,
): boolean {
  return points.some(
    (point) =>
      Math.abs(point[0] - expected[0]) <= tolerance &&
      Math.abs(point[1] - expected[1]) <= tolerance &&
      Math.abs(point[2] - expected[2]) <= tolerance,
  );
}

test('导航图边有效，且每个任务目标区域都有目的地节点', () => {
  const nodeIds = new Set(villaNavigation.nodes.map((node) => node.id));
  assert.equal(nodeIds.size, villaNavigation.nodes.length);
  for (const [from, to] of villaNavigation.edges) {
    assert.ok(nodeIds.has(from), `导航边起点不存在：${from}`);
    assert.ok(nodeIds.has(to), `导航边终点不存在：${to}`);
  }

  const targetRegions = new Set<string>();
  for (const quest of quests) {
    for (const step of quest.steps) {
      targetRegions.add(step.locationId);
      for (const stage of step.stages ?? []) {
        targetRegions.add(stage.locationId);
      }
    }
  }
  for (const regionId of targetRegions) {
    assert.ok(
      villaNavigation.nodes.some(
        (node) => node.regionId === regionId && node.focus,
      ),
      `任务目标区域缺少导航目的地：${regionId}`,
    );
  }
});

test('门厅到餐厅的路径经过餐厅门口并停在餐桌区域', () => {
  const points = route('villa_dining', 'villa_hall', [0, 0, 2.5]);
  assert.ok(hasNear(points, [4.7, 0, 3.5]));
  assert.deepEqual(points.at(-1), [7.5, 0, 3.5]);
});

test('从客厅去浴室会经过门厅、主楼梯和二楼浴室门', () => {
  const points = route('villa_bathroom', 'villa_parlor', [-7.5, 0, 3.5]);
  assert.ok(hasNear(points, [-3.3, 0, 3.5]), '应先经过客厅门回到门厅');
  assert.ok(hasNear(points, [3.3, 1.7, -1.3]), '应经过主楼梯平台');
  assert.ok(hasNear(points, [-4.7, 3.4, -2.6]), '应经过浴室门');
  assert.deepEqual(points.at(-1), [-4.5, 3.4, -4]);
});

test('所有可进入区域之间都能生成不中断的导航路径', () => {
  const regionIds = [
    ...new Set(
      villaNavigation.nodes
        .map((node) => node.regionId)
        .filter((regionId): regionId is string => regionId !== null),
    ),
  ];
  for (const fromRegion of regionIds) {
    const start = villaNavigation.nodes.find(
      (node) => node.regionId === fromRegion,
    );
    assert.ok(start);
    for (const toRegion of regionIds) {
      if (fromRegion === toRegion) {
        continue;
      }
      assert.ok(
        findGroundRoute({
          graph: villaNavigation,
          targetRegionId: toRegion,
          playerRegionId: fromRegion,
          playerPosition: start.position,
        })?.length,
        `${fromRegion} → ${toRegion} 缺少导航路径`,
      );
    }
  }
});

test('已到达目标区域或区域未知时不绘制路线', () => {
  assert.deepEqual(route('villa_hall', 'villa_hall', [0, 0, 2.5]), []);
  assert.equal(
    findGroundRoute({
      graph: villaNavigation,
      targetRegionId: 'villa_hall',
      playerRegionId: null,
      playerPosition: [0, -0.75, 30],
    }),
    null,
  );
});
