import { useMemo } from 'react';
import { content } from '../../content';
import { investigationThreads } from '../../content/investigationThreads';
import { countHeldInventoryItems } from '../../game/inventory/inventory';
import { resolveActiveObjective } from '../../game/story/questProgress';
import { resolveInvestigationThreads } from '../../game/story/investigationProgress';
import { useGameStore } from '../../stores/gameStore';
import { useStoryStore } from '../../stores/storyStore';
import { Minimap, type MinimapPlayerPose } from './Minimap';
import { ObjectivePanel } from './ObjectivePanel';

export interface GameHudProps {
  prompt?: string | null;
  toast?: string | null;
  error?: string | null;
  region?: string | null;
  regionId?: string | null;
  player?: MinimapPlayerPose | null;
  showJournalHint?: boolean;
  minimal?: boolean;
}

export function GameHud(props: GameHudProps = {}) {
  const storePrompt = useGameStore((s) => s.prompt);
  const storeToast = useGameStore((s) => s.toast);
  const storeError = useGameStore((s) => s.error);
  const storeMinimal = useGameStore((s) => s.settings.hudMinimal);
  const clueCount = useStoryStore((s) => s.discoveredClueIds.length);

  const prompt = props.prompt !== undefined ? props.prompt : storePrompt;
  const toast = props.toast !== undefined ? props.toast : storeToast;
  const error = props.error !== undefined ? props.error : storeError;
  const minimal = props.minimal !== undefined ? props.minimal : storeMinimal;

  const storyFlags = useStoryStore((s) => s.storyFlags);
  const discoveredClueIds = useStoryStore((s) => s.discoveredClueIds);
  const itemCount = countHeldInventoryItems(content.items, storyFlags);
  const activeObjective = useMemo(
    () => resolveActiveObjective(storyFlags, content.quests),
    [storyFlags],
  );
  const investigation = useMemo(
    () => resolveInvestigationThreads(storyFlags, investigationThreads),
    [storyFlags],
  );
  const archiveTotal = useMemo(
    () => content.clues.filter((clue) => clue.priority === 'ambient').length,
    [],
  );
  const archiveFound = useMemo(() => {
    const ambientIds = new Set(
      content.clues
        .filter((clue) => clue.priority === 'ambient')
        .map((clue) => clue.id),
    );
    return discoveredClueIds.filter((clueId) => ambientIds.has(clueId)).length;
  }, [discoveredClueIds]);
  const regionId = props.regionId ?? null;
  const player = props.player ?? null;

  return (
    <>
      <div
        className={`hud-crosshair${prompt ? ' is-interactive' : ''}`}
        aria-hidden="true"
      />
      {!minimal && (
        <>
          <Minimap
            regionId={regionId}
            player={player}
            objectiveRegionId={
              activeObjective?.stage?.locationId ??
              activeObjective?.step.locationId ??
              null
            }
          />
          <ObjectivePanel
            active={activeObjective}
            regionId={regionId}
            player={player}
            archive={{ found: archiveFound, total: archiveTotal }}
            investigation={investigation}
          />
          {props.region && <div className="hud-region">{props.region}</div>}
          {props.showJournalHint && (clueCount > 0 || itemCount > 0) && (
            <div className="hud-bottom-hints">
              {clueCount > 0 && (
                <div className="hud-journal-hint">
                  <span className="hud-key">J</span>
                  <span>线索</span>
                  <span className="hud-journal-count">{clueCount}</span>
                </div>
              )}
              <div className="hud-journal-hint hud-inventory-hint">
                <span className="hud-key">B</span>
                <span>背包</span>
                <span className="hud-journal-count">{itemCount}</span>
              </div>
              <div className="hud-journal-hint hud-minimal-hint">
                <span className="hud-key">H</span>
                <span>隐藏界面</span>
              </div>
            </div>
          )}
        </>
      )}
      {prompt && (
        <div className="hud-prompt">
          <span className="hud-key">E</span>
          <span>{prompt}</span>
        </div>
      )}
      {toast && (
        <div className="hud-toast" role="status">
          {toast}
        </div>
      )}
      {error && (
        <div className="hud-error" role="alert">
          {error}
        </div>
      )}
    </>
  );
}
