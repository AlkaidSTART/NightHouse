import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useStoryStore } from '../../stores/storyStore';

export type PlayerHonorific = 'sir' | 'miss';

export interface StartOverlayProps {
  ready?: boolean;
  onStart: () => void;
}

const HONORIFIC_OPTIONS: readonly { value: PlayerHonorific; label: string }[] = [
  { value: 'sir', label: '先生' },
  { value: 'miss', label: '小姐' },
];

export function StartOverlay({ ready: readyProp, onStart }: StartOverlayProps) {
  const storeReady = useGameStore((s) => s.ready);
  const ready = readyProp !== undefined ? readyProp : storeReady;
  const savedHonorific = useStoryStore((s) => s.storyFlags['player.honorific']);
  const setStoryFlag = useStoryStore((s) => s.setStoryFlag);
  const [honorific, setHonorific] = useState<PlayerHonorific | null>(() =>
    savedHonorific === 'sir' || savedHonorific === 'miss'
      ? savedHonorific
      : null,
  );

  const handleStart = (): void => {
    if (!honorific) {
      return;
    }
    setStoryFlag('player.honorific', honorific);
    onStart();
  };

  return (
    <div className="overlay">
      <div className="overlay-panel">
        <p className="overlay-eyebrow">别墅入口</p>
        <h2 className="overlay-title">进入午夜别墅</h2>
        <p className="overlay-text">
          进入后浏览器会锁定鼠标，使用 W A S D 移动、Shift 奔跑、空格跳跃、
          C 或 Ctrl 蹲下、鼠标环视、E 交互、J 查看线索。按 Esc 随时暂停。
        </p>

        <fieldset className="overlay-fieldset">
          <legend>宅中人该怎么称呼你</legend>
          <div className="overlay-options">
            {HONORIFIC_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  honorific === option.value
                    ? 'overlay-option overlay-option-active'
                    : 'overlay-option'
                }
                aria-pressed={honorific === option.value}
                onClick={() => setHonorific(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="overlay-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={handleStart}
            disabled={!ready || !honorific}
          >
            {!ready ? '场景载入中…' : honorific ? '开始探索' : '请先选择称呼'}
          </button>
        </div>
      </div>
    </div>
  );
}
