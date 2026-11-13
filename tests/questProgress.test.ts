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

test('任务目标：必须取得钥匙与霍尔太太的目击证词后才能进入死因调查', () => {
  const base: StoryFlags = {
    'story.arrived': true,
    'story.met_housekeeper': true,
    'story.met_arthur': true,
    'story.arthur_talked': true,
    'story.doctor_time_conflict': true,
    'story.knows_coverup': true,
  };
  assert.equal(activeId(base), 'step_coverup');
  assert.equal(
    activeId({ ...base, 'story.housekeeper_key': true }),
    'step_medical_truth',
  );
});

test('任务目标：医疗真相、录音、补充证据与书桌整理依次推进', () => {
  const base: StoryFlags = {
    'story.arrived': true,
    'story.met_housekeeper': true,
    'story.met_arthur': true,
    'story.arthur_talked': true,
    'story.doctor_time_conflict': true,
    'story.knows_coverup': true,
    'story.housekeeper_key': true,
  };

  assert.equal(activeId(base), 'step_medical_truth');
  assert.equal(
    activeId({ ...base, 'clue.medical_record': true }),
    'step_medical_truth',
    '只有诊疗记录，没有让格雷承认现场时不应跳步',
  );
  assert.equal(
    activeId({ ...base, 'story.doctor_confessed': true }),
    'step_recording',
  );
  assert.equal(
    activeId({
      ...base,
      'story.doctor_confessed': true,
      'story.heard_recording': true,
    }),
    'step_corroborate',
  );

  const corroborated: StoryFlags = {
    ...base,
    'story.doctor_confessed': true,
    'story.heard_recording': true,
    'story.safe_opened': true,
  };
  assert.equal(activeId(corroborated), 'step_evidence');
  assert.equal(
    activeId({ ...corroborated, 'story.case_ready': true }),
    'step_confront',
  );
  assert.equal(
    activeId({
      ...corroborated,
      'story.case_ready': true,
      'story.midnight': true,
    }),
    'step_midnight',
  );
});

test('任务目标：主线走完后不再显示目标', () => {
  const flags: StoryFlags = {
    'story.arrived': true,
    'story.met_housekeeper': true,
    'story.met_arthur': true,
    'story.arthur_talked': true,
    'story.doctor_time_conflict': true,
    'story.knows_coverup': true,
    'story.housekeeper_key': true,
    'story.doctor_confessed': true,
    'story.heard_recording': true,
    'story.safe_opened': true,
    'story.case_ready': true,
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
    'story.housekeeper_key': true,
    'story.doctor_confessed': true,
    'story.heard_recording': true,
    'story.clock_repaired': true,
    'story.case_ready': true,
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
