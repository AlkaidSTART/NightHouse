import { objectiveGuides } from '../../content/objectiveGuides.ts';
import type { SceneDefinition } from '../../shared/types/scene';
import type { Vec3Tuple } from '../../shared/types/save';
import { selectNpcStations } from '../scene/npcStations.ts';
import { areConditionsMet, type StoryFlags } from './conditions.ts';
import type { ActiveObjective } from './questProgress';

export interface ObjectiveGuidance {
  id: string;
  title: string;
  hint: string;
  locationId: string;
  target: { id: string; label: string; position: Vec3Tuple } | null;
  alternative: string | null;
}

/** 引导随现有剧情标记恢复，不保存第二份进度，也不改变任务完成条件。 */
export function resolveObjectiveGuidance(
  flags: StoryFlags,
  active: ActiveObjective | null,
  scene: SceneDefinition,
): ObjectiveGuidance | null {
  if (!active) return null;
  let key = active.stage?.id ?? active.step.id;
  let alternative: string | null = null;
  if (key === 'step_corroborate') {
    // 拿到钟钥匙是主线必经行为，不能单凭它误判玩家选择了修钟。
    const clockStarted = flags['item.pendulum'] === true ||
      flags['story.clock_door_open'] === true ||
      flags['story.clock_pendulum_hung'] === true ||
      flags['story.clock_wound'] === true;
    const paintingRead = flags['story.knows_ship_date_roman'] === true;
    const route = clockStarted && !paintingRead ? 'clock' : 'safe';
    key = `step_corroborate_${route}`;
    alternative = route === 'safe'
      ? '另一条调查路线：修复门厅落地钟也能推进。'
      : '另一条调查路线：从客厅帆船油画查起，打开书房保险箱。';
  }
  const definition = objectiveGuides[key]?.find(
    (guide) => !guide.until || !areConditionsMet(flags, guide.until),
  );
  const fallback = active.stage ?? active.step;
  if (!definition) {
    return {
      id: key,
      title: fallback.objective,
      hint: fallback.hint,
      locationId: fallback.locationId,
      target: null,
      alternative,
    };
  }

  const target = definition.target.kind === 'npc'
    ? selectNpcStations(scene.npcSpots, flags).get(definition.target.id)
    : scene.interactables.find((prop) => prop.id === definition.target.id);
  let position: Vec3Tuple | null = null;
  if (target) {
    position = [...target.position];
    if (definition.target.kind === 'npc') position[1] += 1.4;
  }
  const location = position ? scene.regions.find((region) => region.volumes.some(
    ({ min, max }) => position[0] >= min[0] && position[0] <= max[0] &&
      position[1] >= min[1] && position[1] < max[1] &&
      position[2] >= min[2] && position[2] <= max[2],
  )) : undefined;

  return {
    id: definition.id,
    title: definition.title,
    hint: definition.hint,
    locationId: location?.id ?? fallback.locationId,
    target: target && position
      ? { id: target.id, label: definition.target.label, position }
      : null,
    alternative,
  };
}
