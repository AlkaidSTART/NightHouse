import assert from 'node:assert/strict';
import { test } from 'node:test';
import { objectiveGuides } from '../src/content/objectiveGuides.ts';
import { quests } from '../src/content/quests.ts';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import { KNOWN_STORY_FLAGS } from '../src/content/storyFlags.ts';
import { CLUE_FLAGS, clueFlagForId } from '../src/content/clues.ts';
import { inspectables } from '../src/content/inspectables.ts';
import { clockPuzzleContent } from '../src/content/puzzles.ts';
import { InspectionSystem } from '../src/game/inspection/InspectionSystem.ts';
import { ClockPuzzle } from '../src/game/puzzles/ClockPuzzle.ts';
import { NPC_ANCHOR_HEIGHT } from '../src/game/interaction/npcAim.ts';
import { resolveObjectiveGuidance } from '../src/game/story/objectiveGuidance.ts';
import { resolveActiveObjective } from '../src/game/story/questProgress.ts';
import type { StoryFlags } from '../src/game/story/conditions.ts';
import type { StoryFlagValue } from '../src/shared/types/content';

const medicalFlags: StoryFlags = {
  'story.arrived': true,
  'story.met_housekeeper': true,
  'story.arthur_called': true,
  'story.arthur_talked': true,
  'story.met_doctor': true,
  'story.doctor_time_conflict': true,
  'story.knows_coverup': true,
  'story.housekeeper_key': true,
};
const corroborateFlags: StoryFlags = {
  ...medicalFlags,
  'story.doctor_confessed': true,
  'story.heard_recording': true,
  'item.clock_key': true,
};

function guide(flags: StoryFlags) {
  const view = resolveObjectiveGuidance(flags, resolveActiveObjective(flags, quests), villaGreybox);
  assert.ok(view);
  return view;
}

test('行动引导：覆盖全部主线步骤与取证阶段，目标与条件均为现有数据', () => {
  const ids = new Set<string>();
  const keys = new Set(Object.keys(objectiveGuides));
  for (const quest of quests) {
    for (const step of quest.steps) {
      assert.ok(step.id === 'step_arrive' || step.id === 'step_corroborate' || keys.has(step.id));
      for (const stage of step.stages ?? []) assert.ok(keys.has(stage.id));
    }
  }
  for (const definitions of Object.values(objectiveGuides)) {
    for (const definition of definitions) {
      assert.equal(ids.has(definition.id), false, `重复引导 ID：${definition.id}`);
      ids.add(definition.id);
      assert.ok(definition.title.length > 0 && definition.hint.length > 0);
      assert.ok(definition.target.kind === 'npc'
        ? villaGreybox.npcSpots.some((spot) => spot.npcId === definition.target.id)
        : villaGreybox.interactables.some((prop) => prop.id === definition.target.id));
      for (const condition of definition.until ?? []) {
        assert.ok(KNOWN_STORY_FLAGS.has(condition.flag) || CLUE_FLAGS.has(condition.flag));
      }
    }
  }
});

test('行动引导：新游戏提供进门指引，不提前显示后续物证', () => {
  const view = guide({});
  assert.equal(view.locationId, 'villa_hall');
  assert.equal(view.title, '进入别墅门厅');
  assert.equal(view.target, null);
  const housekeeper = guide({ 'story.arrived': true });
  assert.equal(housekeeper.target?.id, 'NPC_housekeeper_front_door');
  assert.equal(housekeeper.target?.position[1], NPC_ANCHOR_HEIGHT);
});

test('行动引导：取证完成后自动导航下一件物证，提前取得也不会重复要求', () => {
  assert.equal(guide(medicalFlags).target?.id, 'INT_prop_study_desk_drawer');
  const bathroom = guide({ ...medicalFlags, 'clue.medical_record': true });
  assert.equal(bathroom.target?.id, 'INT_prop_medicine_cabinet');
  assert.equal(bathroom.locationId, 'villa_bathroom');
  const doctor = guide({ ...medicalFlags, 'clue.medical_record': true, 'clue.bathroom_trace': true });
  assert.equal(doctor.target?.id, 'NPC_doctor_front_door_b4');
  const moved = guide({ ...medicalFlags, 'clue.medical_record': true, 'clue.bathroom_trace': true, 'story.clock_repaired': true });
  assert.equal(moved.target?.id, 'NPC_doctor_dining_door');
  assert.equal(moved.locationId, 'villa_hall');
  assert.equal(guide({ ...medicalFlags, 'clue.bathroom_trace': true }).target?.id, 'INT_prop_study_desk_drawer');
});

test('行动引导：取得证词后只提示缺少的钥匙，不提前让玩家上楼', () => {
  const flags = { ...medicalFlags, 'story.housekeeper_key': false };
  const view = guide(flags);
  assert.equal(view.id, 'guide_housekeeper_key');
  assert.equal(view.locationId, 'villa_dining');
  assert.equal(view.target?.id, 'NPC_housekeeper_dining_door');
});

test('行动引导：找到蜡筒后导航留声机，不会继续指向卧室', () => {
  const flags = { ...medicalFlags, 'story.doctor_confessed': true };
  assert.equal(guide(flags).target?.id, 'INT_prop_vanity_drawer');
  assert.equal(guide({ ...flags, 'item.cylinder': true }).target?.id, 'INT_prop_phonograph');
});

test('行动引导：默认优先寻找日期，已开钟门则沿修钟进度继续', () => {
  assert.equal(guide(corroborateFlags).id, 'guide_painting_back');
  assert.equal(guide(corroborateFlags).locationId, 'villa_parlor');
  assert.equal(guide({ ...corroborateFlags, 'story.knows_ship_date_roman': true }).id, 'guide_open_safe');
  assert.equal(guide({ ...corroborateFlags, 'item.pendulum': true }).id, 'guide_mantel_clock');
  assert.equal(guide({ ...corroborateFlags, 'story.clock_door_open': true, 'story.knows_ship_date_roman': true }).id, 'guide_clock_pendulum');
});

test('行动引导：真实检视与修钟效果会推进引导，任一谜题完成后都回到书桌', () => {
  const flags: Record<string, StoryFlagValue> = { ...corroborateFlags };
  const setFlag = (key: string, value: StoryFlagValue): void => { flags[key] = value; };
  const inspection = new InspectionSystem({
    inspectables,
    host: {
      getFlags: () => flags,
      setFlag,
      discoverClue: (id) => { flags[clueFlagForId(id)] = true; return true; },
      getClueTitle: () => null,
      onChange: () => {},
    },
  });
  inspection.open('INT_prop_ship_painting_back');
  assert.equal(guide(flags).id, 'guide_open_safe');
  flags['story.clock_door_open'] = true;
  assert.equal(guide(flags).id, 'guide_clock_pendulum');
  inspection.open('INT_prop_wardrobe');
  assert.equal(guide(flags).id, 'guide_mantel_clock');
  inspection.open('INT_prop_mantel_clock');
  assert.equal(guide(flags).id, 'guide_tide_table');
  inspection.open('INT_prop_tide_table');
  assert.equal(guide(flags).id, 'guide_repair_clock');
  const clock = new ClockPuzzle(clockPuzzleContent, {
    getFlags: () => flags,
    setFlag,
    discoverClue: () => null,
    completePuzzle: () => {},
  });
  clock.act('clock.hang-pendulum');
  clock.act('clock.wind');
  const correct = clockPuzzleContent.calibration.find((choice) => choice.correct);
  assert.ok(correct);
  clock.act(correct.id);
  assert.equal(guide(flags).id, 'guide_arrange_evidence');
  assert.equal(guide({ ...corroborateFlags, 'story.safe_opened': true }).id, 'guide_arrange_evidence');
});

test('行动引导：恢复存档得到相同结果，解析过程不更改剧情状态', () => {
  const flags = { ...corroborateFlags, 'story.clock_wound': true, 'item.pendulum': true, 'story.saw_mantel_clock': true };
  const before = JSON.stringify(flags);
  const restored: Record<string, StoryFlagValue> = JSON.parse(before);
  assert.deepEqual(guide(flags), guide(restored));
  assert.equal(guide(restored).id, 'guide_tide_table');
  assert.equal(JSON.stringify(flags), before);
});

test('行动引导：没有目标时不留下过期标记，缺失场景对象时保留文字兜底', () => {
  assert.equal(resolveObjectiveGuidance({}, null, villaGreybox), null);
  const active = resolveActiveObjective(medicalFlags, quests);
  const view = resolveObjectiveGuidance(medicalFlags, active, { ...villaGreybox, interactables: [] });
  assert.ok(view);
  assert.equal(view.target, null);
  assert.equal(view.locationId, 'villa_study');
  assert.equal(view.id, 'guide_medical_record');
});
