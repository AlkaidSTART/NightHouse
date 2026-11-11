import { useGameStore } from '../../stores/gameStore';

export interface GameHudProps {
  prompt?: string | null;
  toast?: string | null;
  error?: string | null;
  region?: string | null;
}

export function GameHud(props: GameHudProps = {}) {
  const storePrompt = useGameStore((s) => s.prompt);
  const storeToast = useGameStore((s) => s.toast);
  const storeError = useGameStore((s) => s.error);

  const prompt = props.prompt !== undefined ? props.prompt : storePrompt;
  const toast = props.toast !== undefined ? props.toast : storeToast;
  const error = props.error !== undefined ? props.error : storeError;

  return (
    <>
      <div className="hud-crosshair" aria-hidden="true" />
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
