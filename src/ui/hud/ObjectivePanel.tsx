import type { ActiveObjective } from '../../game/story/questProgress';
import type { MinimapPlayerPose } from './Minimap';
import { describeRoute } from './objectiveRoute';

export interface ObjectivePanelProps {
  active: ActiveObjective | null;
  regionId: string | null;
  player: MinimapPlayerPose | null;
}

/** 右上角任务目标面板。目标由剧情标记推导，对话改变标记后立即刷新。 */
export function ObjectivePanel({
  active,
  regionId,
  player,
}: ObjectivePanelProps) {
  if (!active) {
    return null;
  }

  const route = describeRoute(
    active.step.locationId,
    regionId,
    player ? player.position : null,
  );

  const metaParts: string[] = [];
  if (route) {
    metaParts.push(`${route.regionName}（${route.floorLabel}）`);
    if (route.arrived) {
      metaParts.push('已到达');
    } else if (route.distance !== null) {
      const distance = Math.max(1, Math.round(route.distance));
      const prefix = route.levelHint ? `${route.levelHint} · ` : '';
      metaParts.push(
        `${prefix}${route.direction ?? ''} · 约 ${distance} 米`,
      );
    } else if (route.levelHint) {
      metaParts.push(route.levelHint);
    }
  }

  return (
    <div className="hud-objective" aria-live="polite">
      <div className="hud-objective-header">
        <span className="hud-objective-kicker">任务目标</span>
        <span className="hud-objective-progress">
          {active.index + 1} / {active.total}
        </span>
      </div>
      <div className="hud-objective-quest">{active.quest.title}</div>
      <div className="hud-objective-task" key={active.step.id}>
        <span className="hud-objective-dot" aria-hidden="true">
          ◆
        </span>
        <span>{active.step.objective}</span>
      </div>
      {metaParts.length > 0 && (
        <div className="hud-objective-meta">{metaParts.join(' · ')}</div>
      )}
      <div className="hud-objective-hint">{active.step.hint}</div>
    </div>
  );
}
