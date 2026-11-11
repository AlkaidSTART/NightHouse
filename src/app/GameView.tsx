import { useEffect, useRef, useState } from 'react';
import { GameBootstrap } from '../game/core/GameBootstrap';
import type { GameEventBus } from '../game/core/GameEvents';
import type { SaveManager } from '../game/save/SaveManager';
import { GameHud } from '../ui/hud/GameHud';
import { PauseMenu } from '../ui/pause/PauseMenu';
import { StartOverlay } from '../ui/pause/StartOverlay';

type Phase = 'ready' | 'playing' | 'paused';

interface GameViewProps {
  events: GameEventBus;
  saveManager: SaveManager;
  resume: boolean;
  onExit: () => void;
}

export function GameView({
  events,
  saveManager,
  resume,
  onExit,
}: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bootstrapRef = useRef<GameBootstrap | null>(null);
  const [phase, setPhase] = useState<Phase>('ready');
  const [ready, setReady] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let disposed = false;
    let toastTimer: number | null = null;

    const offPrompt = events.on('interaction.prompt', ({ text }) => {
      setPrompt(text);
    });
    const offActivated = events.on('interaction.activated', ({ message }) => {
      setToast(message);
      if (toastTimer !== null) {
        window.clearTimeout(toastTimer);
      }
      toastTimer = window.setTimeout(() => {
        setToast(null);
        toastTimer = null;
      }, 3500);
    });
    const offRegion = events.on('region.changed', ({ name }) => {
      setRegion(name);
    });
    const offPause = events.on('pause.changed', ({ paused }) => {
      setPhase(paused ? 'paused' : 'playing');
    });
    const offError = events.on('game.error', ({ message }) => {
      setError(message);
    });
    const offReady = events.on('game.ready', () => {
      setReady(true);
    });

    void GameBootstrap.create({ canvas, events, saveManager, resume })
      .then((bootstrap) => {
        if (disposed) {
          bootstrap.destroy();
          return;
        }
        bootstrapRef.current = bootstrap;
        bootstrap.start();
      })
      .catch((reason: unknown) => {
        if (!disposed) {
          setError(
            reason instanceof Error ? reason.message : '游戏初始化失败。',
          );
        }
      });

    return () => {
      disposed = true;
      offPrompt();
      offActivated();
      offRegion();
      offPause();
      offError();
      offReady();
      if (toastTimer !== null) {
        window.clearTimeout(toastTimer);
      }
      bootstrapRef.current?.destroy();
      bootstrapRef.current = null;
    };
  }, [events, saveManager, resume]);

  const handleStart = (): void => {
    bootstrapRef.current?.resume();
  };

  return (
    <div className="game-view">
      <canvas ref={canvasRef} className="game-canvas" />
      <GameHud prompt={prompt} toast={toast} error={error} region={region} />
      {phase === 'ready' && (
        <StartOverlay ready={ready} onStart={handleStart} />
      )}
      {phase === 'paused' && (
        <PauseMenu onResume={handleStart} onExit={onExit} />
      )}
    </div>
  );
}
