import type { ActiveObjective } from '../../game/story/questProgress';
import type { InvestigationThreadView } from '../../game/story/investigationProgress';
import type { ObjectiveGuidance } from '../../game/story/objectiveGuidance';
import type { MinimapPlayerPose } from './Minimap';
import { describeRoute } from './objectiveRoute';

export interface ObjectivePanelProps {
  active: ActiveObjective | null;
  regionId: string | null;
  player: MinimapPlayerPose | null;
  /** 可选的自由探索收集进度：世界档案已发现 / 总数。 */
  archive?: { found: number; total: number } | null;
  /** 玩家侧的推理检查表；由剧情标记推导，不额外保存状态。 */
  investigation?: readonly InvestigationThreadView[] | null;
  guidance?: ObjectiveGuidance | null;
}

/** 主线说明调查目的；下一步只突出当前可执行的一项行动。 */
export function ObjectivePanel({
  active,
  regionId,
  player,
  archive,
  investigation,
  guidance,
}: ObjectivePanelProps) {
  if (!active) {
    return null;
  }

  const stage = active.stage;
  const objective = guidance?.title ?? stage?.objective ?? active.step.objective;
  const hint = guidance?.hint ?? stage?.hint ?? active.step.hint;
  const locationId = guidance?.locationId ?? stage?.locationId ?? active.step.locationId;
  const route = describeRoute(
    locationId,
    regionId,
    player ? player.position : null,
  );

  const metaParts: string[] = [];
  if (route) {
    metaParts.push(`${route.regionName}（${route.floorLabel}）`);
    if (route.arrived) {
      metaParts.push(guidance?.target ? `寻找${guidance.target.label}` : '在此调查');
    } else if (route.distance !== null) {
      const distance = Math.max(1, Math.round(route.distance));
      const hint = route.levelHint
        ? `${route.levelHint}${route.via ? `（经${route.via}）` : ''}`
        : '';
      const prefix = hint ? `${hint} · ` : '';
      metaParts.push(
        `${prefix}${route.direction ?? ''} · 约 ${distance} 米`,
      );
    } else if (route.levelHint) {
      metaParts.push(route.levelHint);
    }
  }

  const completedThreads = investigation?.filter((thread) => thread.complete).length ?? 0;

  return (
    <div className="hud-objective">
      <div
        key={guidance?.id ?? `${active.step.id}:${stage?.id ?? 'final'}`}
        className="hud-objective-step"
      >
        <div className="hud-objective-header">
          <span className="hud-objective-kicker">当前目标</span>
          <span className="hud-objective-progress">{active.index + 1} / {active.total}</span>
        </div>
        <div className="hud-objective-quest">{active.step.objective}</div>
        <div className="hud-objective-next" aria-live="polite" aria-atomic="true">
          <span className="hud-objective-next-label">下一步</span>
          <div className="hud-objective-task hud-objective-reveal-1">{objective}</div>
        </div>
        {metaParts.length > 0 && (
          <div className="hud-objective-meta hud-objective-reveal-2">
            {metaParts.join(' · ')}
          </div>
        )}
        {hint && (
          <div className="hud-objective-hint hud-objective-reveal-3">
            {hint}
          </div>
        )}
        <div className="hud-objective-controls">
          <span className="hud-key">E</span>
          <span>{route?.arrived ? '靠近并对准目标，出现提示后互动' : '跟随金色路线，进房后寻找菱形标记'}</span>
        </div>
        {guidance?.alternative && (
          <div className="hud-objective-alternative">{guidance.alternative}</div>
        )}
      </div>

      {investigation && investigation.length > 0 && (
        <div className="hud-objective-leads">
          <div className="hud-objective-leads-header">
            <span>已查明 {completedThreads} / {investigation.length} 条调查线</span>
            <span>J 查看线索</span>
          </div>
        </div>
      )}

      {archive && archive.total > 0 && archive.found > 0 && (
        <div className="hud-objective-archive">
          世界档案 {archive.found} / {archive.total}
        </div>
      )}
    </div>
  );
}
