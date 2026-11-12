import assert from 'node:assert/strict';
import { test } from 'node:test';
import { quests } from '../src/content/quests.ts';
import {
  isStepComplete,
  resolveActiveObjective,
} from '../src/game/story/questProgress.ts';
import type { StoryFlags } from '../src/game/story/conditions.ts';
import {
  bearingLabel,
  describeRoute,
} from '../src/ui/hud/objectiveRoute.ts';

function activeId(flags: StoryFlags): string | null {
  return resolveActiveObjective(flags, quests)?.step.id ?? null;
}

test('任务目标：新游戏从进入门厅开始', () => {
  assert.equal(activeId({}), 'step_arrive');
});

test('任务目标：剧情标记推进后自动切换到下一步', () => {
  assert.equal(activeId({ 'story.arrived': true }), 'step_housekeeper');
  assert.equal(
    activeId({ 'story.arrived': true, 'story.met_housekeeper': true }),
    'step_arthur',
  );
  assert.equal(
    activeId({
      'story.arrived': true,
      'story.met_housekeeper': true,
      'story.met_arthur': true,
    }),
    'step_doctor',
  );
});

test('任务目标：医生的任一调查标记都能完成该步', () => {
  const base: StoryFlags = {
    'story.arrived': true,
    'story.met_housekeeper': true,
    'story.met_arthur': true,
  };
  for (const flag of [
    'story.summer_mentioned',
    'story.doctor_slip',
    'story.doctor_time_conflict',
    'story.doctor_admits_exam',
    'story.doctor_confessed',
  ]) {
    assert.equal(
      activeId({ ...base, [flag]: true }),
      'step_coverup',
      `${flag} 未推进到下一步`,
    );
  }
});

test('任务目标：主线走完后不再显示目标', () => {
  const flags: StoryFlags = {
    'story.arrived': true,
    'story.met_housekeeper': true,
    'story.met_arthur': true,
    'story.doctor_slip': true,
    'story.knows_coverup': true,
    'story.midnight': true,
    'choice.midnight': 'sign',
  };
  assert.equal(resolveActiveObjective(flags, quests), null);
});

test('任务目标：空完成条件不会被误判为已完成', () => {
  assert.equal(isStepComplete({}, []), false);
});

test('路线指引：八方向计算以 −Z 为北', () => {
  assert.equal(bearingLabel(0, -10), '北');
  assert.equal(bearingLabel(10, -10), '东北');
  assert.equal(bearingLabel(10, 0), '东');
  assert.equal(bearingLabel(0, 10), '南');
  assert.equal(bearingLabel(-10, 0), '西');
  assert.equal(bearingLabel(0, 0), '此处');
});

test('路线指引：到达目标区域时标记为已到达，跨层时提示上楼', () => {
  const arrived = describeRoute('villa_hall', 'villa_hall', [0, 1.7, 0]);
  assert.ok(arrived);
  assert.equal(arrived.arrived, true);
  assert.equal(arrived.regionName, '门厅');
  assert.equal(arrived.floorLabel, '一层');

  const upstairs = describeRoute('villa_evelyn_room', 'villa_hall', [0, 1.7, 0]);
  assert.ok(upstairs);
  assert.equal(upstairs.floorLabel, '二层');
  assert.equal(upstairs.levelHint, '需上楼');
  assert.ok((upstairs.distance ?? 0) > 0);
  assert.ok(upstairs.direction);
});
