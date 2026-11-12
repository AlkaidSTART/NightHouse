/**
 * 剧情标记白名单。
 *
 * 来源：docs/午夜别墅_故事线文档_v0.7.md §6.1。
 * 对话条件与效果只能引用这里登记过的标记；线索标记 `clue.<短名>`
 * 由 `clues.ts` 的线索 ID 推导，不在此重复登记。
 */
export const STORY_FLAGS = [
  // 玩家 / 开场
  'player.honorific',
  'story.arrived',
  'story.has_letter',

  // 人物接触
  'story.met_arthur',
  'story.met_housekeeper',
  'story.met_doctor',
  'story.doctor_talked',
  'story.housekeeper_warm',
  'story.housekeeper_cold',
  'story.letter_shown',
  'story.housekeeper_key',
  'story.summer_mentioned',
  'story.housekeeper_hints',
  'story.housekeeper_guilt',
  'story.housekeeper_confirms_cleanup',
  'story.evelyn_room_open',
  'story.doctor_slip',
  'story.doctor_time_conflict',
  'story.doctor_admits_exam',
  'story.doctor_confessed',
  'story.doctor_hostile',
  'story.doctor_testimony',
  'story.arthur_admits_study',
  'story.arthur_notices_resemblance',
  'story.arthur_deflects_shipwreck',

  // 调查进度
  'story.will_read',
  'story.knows_high_tide',
  'story.knows_ship_date_roman',
  'story.knows_official_storm',
  'story.knows_insurance_fraud',
  'story.knows_shipwreck',
  'story.knows_time_conflict',
  'story.knows_injury_at_home',
  'story.knows_cleanup',
  'story.knows_evelyn_investigating',
  'story.evelyn_not_leaving',
  'story.photo_cut',
  'story.thirteen_places',
  'story.clock_repaired',
  'story.safe_opened',
  'story.heard_recording',
  'story.read_old_letters',
  'story.knows_crew_names',
  'story.knows_coverup',
  'story.knows_full_truth',

  // 物品 / 谜题
  'item.clock_key',
  'item.pendulum',
  'item.storage_key',
  'puzzle.clock',
  'puzzle.safe',

  // 对质与结局
  'story.arthur_confronted',
  'story.arthur_cornered',
  'story.arthur_broken',
  'story.arthur_father_suspected',
  'story.arthur_confessed',
  'story.housekeeper_confided',
  'story.housekeeper_testimony',
  'story.doctor_confronted',
  'story.midnight',
  'choice.midnight',
] as const;

export type KnownStoryFlag = (typeof STORY_FLAGS)[number];

export const KNOWN_STORY_FLAGS: ReadonlySet<string> = new Set(STORY_FLAGS);
