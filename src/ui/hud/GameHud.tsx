import { content } from '../../content';
import { resolveActiveObjective } from '../../game/story/questProgress';
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
}

export function GameHud(props: GameHudProps = {}) {
  const storePrompt = useGameStore((s) => s.prompt);
  const storeToast = useGameStore((s) => s.toast);
  const storeError = useGameStore((s) => s.error);

  const prompt = props.prompt !== undefined ? props.prompt : storePrompt;
  const toast = props.toast !== undefined ? props.toast : storeToast;
  const error = props.error !== undefined ? props.error : storeError;

  const storyFlags = useStoryStore((s) => s.storyFlags);
  const activeObjective = resolveActiveObjective(storyFlags, content.quests);
  const regionId = props.regionId ?? null;
  const player = props.player ?? null;

  return (
    <>
      <div className="hud-crosshair" aria-hidden="true" />
      <Minimap
        regionId={regionId}
        player={player}
        objectiveRegionId={activeObjective?.step.locationId ?? null}
      />
      <ObjectivePanel
        active={activeObjective}
        regionId={regionId}
        player={player}
      />
      {props.region && <div className="hud-region">{props.region}</div>}
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
