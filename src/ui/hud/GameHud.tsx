interface GameHudProps {
  prompt: string | null;
  toast: string | null;
  error: string | null;
}

export function GameHud({ prompt, toast, error }: GameHudProps) {
  return (
    <>
      <div className="hud-crosshair" aria-hidden="true" />
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
