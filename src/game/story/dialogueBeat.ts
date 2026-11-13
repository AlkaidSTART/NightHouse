/**
 * 对话情节节拍。
 *
 * 任务步骤描述「玩家此刻该做什么」，节拍描述「对话此刻属于哪一幕」。
 * 两者一一对应，但多个任务步骤可以落在同一节拍里（例如自由调查期的
 * `step_coverup` 与 `step_evidence` 都属于 B5），因此对话内容按节拍隔离，
 * 而不是按单个任务步骤隔离。
 *
 * 依据：docs/午夜别墅_故事线文档_v0.7.md §1.6 的场景表。
 */
export type DialogueBeatId =
  | 'b1_arrival'
  | 'b2_arthur'
  | 'b3_dinner'
  | 'b5_investigation'
  | 'b9_confrontation'
  | 'b10_midnight';

const STEP_BEATS: Readonly<Record<string, DialogueBeatId>> = {
  step_arrive: 'b1_arrival',
  step_housekeeper: 'b1_arrival',
  step_arthur: 'b2_arthur',
  step_doctor: 'b3_dinner',
  step_coverup: 'b5_investigation',
  step_medical_truth: 'b5_investigation',
  step_recording: 'b5_investigation',
  step_corroborate: 'b5_investigation',
  step_evidence: 'b5_investigation',
  step_confront: 'b9_confrontation',
  step_midnight: 'b10_midnight',
};

export const DIALOGUE_BEAT_LABEL: Readonly<Record<DialogueBeatId, string>> = {
  b1_arrival: '第一幕 · 抵达',
  b2_arthur: '第一幕 · 初见',
  b3_dinner: '第一幕 · 晚宴',
  b5_investigation: '第二幕 · 调查',
  b9_confrontation: '第三幕 · 对质',
  b10_midnight: '第四幕 · 午夜',
};

/** 某个任务步骤所属的对话节拍；未知步骤返回 null。 */
export function beatForQuestStep(stepId: string): DialogueBeatId | null {
  return STEP_BEATS[stepId] ?? null;
}

/** 当前任务步骤对应的对话节拍；没有活动任务时返回 null。 */
export function resolveActiveDialogueBeat(
  activeTaskId: string | null,
): DialogueBeatId | null {
  return activeTaskId === null ? null : beatForQuestStep(activeTaskId);
}

/**
 * 节点/选项是否属于当前节拍。
 *
 * - 未标记 `taskIds` 的条目是导航项（返回、离开），不参与节拍隔离。
 * - 没有活动节拍时不过滤：这只发生在主线全部完成、即将进入结局的状态。
 */
export function isInDialogueBeat(
  taskIds: readonly string[] | undefined,
  beat: DialogueBeatId | null,
): boolean {
  if (!taskIds || taskIds.length === 0) {
    return true;
  }
  if (beat === null) {
    return true;
  }
  return taskIds.some((taskId) => STEP_BEATS[taskId] === beat);
}

/** 数据校验用：返回 taskIds 覆盖到的全部节拍，忽略未知步骤。 */
export function beatsForTaskIds(
  taskIds: readonly string[] | undefined,
): Set<DialogueBeatId> {
  const beats = new Set<DialogueBeatId>();
  for (const taskId of taskIds ?? []) {
    const beat = STEP_BEATS[taskId];
    if (beat) {
      beats.add(beat);
    }
  }
  return beats;
}
