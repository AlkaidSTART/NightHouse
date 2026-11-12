import assert from 'node:assert/strict';
import { test } from 'node:test';
import { quests } from '../src/content/quests.ts';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import { CLUE_FLAGS } from '../src/content/clues.ts';
import { KNOWN_STORY_FLAGS } from '../src/content/storyFlags.ts';
import {
  isStepComplete,
  resolveActiveObjective,
  resolveActiveStepId,
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
    'step_arthur',
  );
  assert.equal(
    activeId({
      'story.arrived': true,
      'story.met_housekeeper': true,
      'story.met_arthur': true,
      'story.arthur_talked': true,
    }),
    'step_doctor',
  );
});

test('任务目标：医生必须追问到场时间或伤势才能完成该步', () => {
  const base: StoryFlags = {
    'story.arrived': true,
    'story.met_housekeeper': true,
    'story.met_arthur': true,
    'story.arthur_talked': true,
  };

  // 泛泛而谈不再推进任务，避免一次闲聊就跳过调查。
  assert.equal(activeId({ ...base, 'story.summer_mentioned': true }), 'step_doctor');
  assert.equal(activeId({ ...base, 'story.doctor_slip': true }), 'step_doctor');

  for (const flag of [
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

test('任务目标：对质前必须先取得一条核心证据', () => {
  const base: StoryFlags = {
    'story.arrived': true,
    'story.met_housekeeper': true,
    'story.met_arthur': true,
    'story.arthur_talked': true,
    'story.doctor_time_conflict': true,
    'story.knows_coverup': true,
  };
  assert.equal(activeId(base), 'step_evidence');

  for (const flag of [
    'clue.medical_record',
    'clue.bathroom_trace',
    'clue.shipping_ledger',
    'clue.insurance_policy',
    'story.heard_recording',
  ]) {
    assert.equal(
      activeId({ ...base, [flag]: true }),
      'step_confront',
      `${flag} 未推进到对质`,
    );
  }
});

test('任务目标：主线走完后不再显示目标', () => {
  const flags: StoryFlags = {
    'story.arrived': true,
    'story.met_housekeeper': true,
    'story.met_arthur': true,
    'story.arthur_talked': true,
    'story.doctor_time_conflict': true,
    'story.knows_coverup': true,
    'clue.medical_record': true,
    'story.midnight': true,
    'choice.midnight': 'sign',
  };
  assert.equal(resolveActiveObjective(flags, quests), null);
});

test('任务目标：空完成条件不会被误判为已完成', () => {
  assert.equal(isStepComplete({}, []), false);
});

test('全局进度：当前任务步骤 ID 随剧情标记推导', () => {
  assert.equal(resolveActiveStepId({}, quests), 'step_arrive');
  assert.equal(
    resolveActiveStepId({ 'story.arrived': true }, quests),
    'step_housekeeper',
  );
  const done: StoryFlags = {
    'story.arrived': true,
    'story.met_housekeeper': true,
    'story.met_arthur': true,
    'story.arthur_talked': true,
    'story.doctor_time_conflict': true,
    'story.knows_coverup': true,
    'clue.medical_record': true,
    'story.midnight': true,
    'choice.midnight': 'sign',
  };
  assert.equal(resolveActiveStepId(done, quests), null);
});

test('任务目标：地点 ID 都对应场景区域，完成条件都使用已登记标记', () => {
  const regionIds = new Set(villaGreybox.regions.map((region) => region.id));
  for (const quest of quests) {
    for (const step of quest.steps) {
      assert.ok(
        regionIds.has(step.locationId),
        `${step.id} 的地点 ${step.locationId} 不存在`,
      );
      for (const group of step.doneWhen) {
        for (const condition of group) {
          assert.ok(
            KNOWN_STORY_FLAGS.has(condition.flag) ||
              CLUE_FLAGS.has(condition.flag),
            `${step.id} 使用了未登记的标记 ${condition.flag}`,
          );
        }
      }
    }
  }
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
