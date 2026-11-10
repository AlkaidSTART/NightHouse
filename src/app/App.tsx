import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { EventBus } from '../shared/events/EventBus';
import type { GameEventMap } from '../game/core/GameEvents';
import { SaveManager } from '../game/save/SaveManager';
import { HomeScreen } from '../ui/home/HomeScreen';

const GameView = lazy(() =>
  import('./GameView').then((module) => ({ default: module.GameView })),
);

type Screen = 'home' | 'game';

export function App() {
  const [events] = useState(() => new EventBus<GameEventMap>());
  const [saveManager] = useState(() => new SaveManager());
  const [screen, setScreen] = useState<Screen>('home');
  const [resume, setResume] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const refreshSaveState = useCallback(async () => {
    try {
      const available = await saveManager.hasSave();
      setHasSave(available);
    } catch {
      setHasSave(false);
      setNotice('本地存档不可用，游戏进度可能无法保存。');
    }
  }, [saveManager]);

  useEffect(() => {
    let ignore = false;

    void (async () => {
      try {
        const available = await saveManager.hasSave();
        if (!ignore) {
          setHasSave(available);
        }
      } catch {
        if (!ignore) {
          setHasSave(false);
          setNotice('本地存档不可用，游戏进度可能无法保存。');
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [saveManager]);

  useEffect(() => {
    return () => {
      events.clear();
      void saveManager.close();
    };
  }, [events, saveManager]);

  const handleStart = (): void => {
    setResume(false);
    setScreen('game');
  };

  const handleContinue = (): void => {
    setResume(true);
    setScreen('game');
  };

  const handleExit = (): void => {
    setScreen('home');
    void refreshSaveState();
  };

  if (screen === 'game') {
    return (
      <Suspense fallback={<div className="screen-loading">正在载入场景…</div>}>
        <GameView
          events={events}
          saveManager={saveManager}
          resume={resume}
          onExit={handleExit}
        />
      </Suspense>
    );
  }

  return (
    <HomeScreen
      hasSave={hasSave}
      notice={notice}
      onStart={handleStart}
      onContinue={handleContinue}
    />
  );
}
