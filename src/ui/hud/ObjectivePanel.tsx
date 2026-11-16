import type { ActiveObjective } from '../../game/story/questProgress';
import type { InvestigationThreadView } from '../../game/story/investigationProgress';
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
}

/**
 * 筛选按顺序逐条显现的调查线：
 * 显示所有已开启或已完成的调查线，以及下一条待推进的调查线（不提前铺满未轮到的条目）。
 */
function pickVisibleThreads(
  threads: readonly InvestigationThreadView[],
): readonly InvestigationThreadView[] {
  const firstIncompleteIndex = threads.findIndex((thread) => !thread.complete);
  return threads.filter(
    (thread, index) =>
      thread.complete || thread.found > 0 || index === firstIncompleteIndex,
  );
}

/** 右上角任务目标。主线与调查线均按进度逐条推进、逐条显现。 */
export function ObjectivePanel({
  active,
  regionId,
  player,
  archive,
  investigation,
}: ObjectivePanelProps) {
  if (!active) {
    return null;
  }

  const stage = active.stage;
  const objective = stage?.objective ?? active.step.objective;
  const hint = stage?.hint ?? active.step.hint;
  const locationId = stage?.locationId ?? active.step.locationId;
  const route = describeRoute(
    locationId,
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

  const visibleThreads = investigation ? pickVisibleThreads(investigation) : [];

  return (
    <div className="hud-objective" aria-live="polite">
      <div className="hud-objective-header">
        <span className="hud-objective-kicker">当前线索</span>
      </div>
      <div
        key={`${active.step.id}:${stage?.id ?? 'final'}`}
        className="hud-objective-step"
      >
        <div className="hud-objective-quest hud-objective-reveal-1">
          {active.quest.title}
        </div>
        <div className="hud-objective-task hud-objective-reveal-2">
          <span>{objective}</span>
        </div>
        {metaParts.length > 0 && (
          <div className="hud-objective-meta hud-objective-reveal-3">
            {metaParts.join(' · ')}
          </div>
        )}
        <div className="hud-objective-hint hud-objective-reveal-4">
          {hint}
        </div>
      </div>

      {visibleThreads.length > 0 && (
        <div className="hud-objective-leads">
          <div className="hud-objective-leads-header">
            <span>调查线索</span>
          </div>
          {visibleThreads.map((thread) => {
            const nextStep = !thread.complete
              ? thread.steps.find((step) => !step.found)
              : undefined;
            return (
              <div
                key={thread.id}
                className={`hud-objective-lead${thread.complete ? ' is-complete' : ''}`}
                title={thread.hint}
              >
                <div className="hud-objective-lead-body">
                  <span className="hud-objective-lead-title">
                    {thread.title}
                  </span>
                  {nextStep && (
                    <span
                      key={nextStep.flag}
                      className="hud-objective-lead-next"
                    >
                      {nextStep.label}
                    </span>
                  )}
                </div>
                {thread.complete && (
                  <span className="hud-objective-lead-count">已查明</span>
                )}
              </div>
            );
          })}
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
