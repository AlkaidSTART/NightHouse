import { useEffect, useState } from 'react';
import type { DialogueView } from '../../shared/types/dialogue';

export interface DialoguePanelProps {
  view: DialogueView;
  onAdvance: () => void;
  onChoose: (choiceId: string) => void;
  onClose: () => void;
}

export function DialoguePanel({
  view,
  onAdvance,
  onChoose,
  onClose,
}: DialoguePanelProps) {
  const { line, choices } = view;
  const isNarration = line?.speaker === 'narration';
  const speaker = isNarration ? null : (line?.name ?? view.npcName);
  const [focusState, setFocusState] = useState<{
    nodeId: string;
    index: number;
  }>({ nodeId: view.nodeId, index: 0 });

  const focusedIndex =
    focusState.nodeId === view.nodeId && focusState.index < choices.length
      ? focusState.index
      : 0;

  useEffect(() => {
    if (view.canContinue || choices.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.repeat) {
        return;
      }
      if (/^[1-9]$/.test(event.key)) {
        const idx = Number(event.key) - 1;
        const target = choices[idx];
        if (target) {
          event.preventDefault();
          onChoose(target.id);
        }
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
        event.preventDefault();
        setFocusState((prev) => {
          const base =
            prev.nodeId === view.nodeId && prev.index < choices.length
              ? prev.index
              : 0;
          return {
            nodeId: view.nodeId,
            index: (base + 1) % choices.length,
          };
        });
        return;
      }
      if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
        event.preventDefault();
        setFocusState((prev) => {
          const base =
            prev.nodeId === view.nodeId && prev.index < choices.length
              ? prev.index
              : 0;
          return {
            nodeId: view.nodeId,
            index: (base - 1 + choices.length) % choices.length,
          };
        });
        return;
      }
      if (event.key === 'Enter') {
        const target = choices[focusedIndex];
        if (target) {
          event.preventDefault();
          onChoose(target.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view.canContinue, view.nodeId, choices, focusedIndex, onChoose]);

  return (
    <div className="dialogue-layer">
      <section
        className="dialogue-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`与${view.npcName}交谈`}
      >
        <header className="dialogue-header">
          <div className="dialogue-heading">
            {speaker && <span className="dialogue-speaker">{speaker}</span>}
            {view.contextLabel && (
              <span className="dialogue-context">{view.contextLabel}</span>
            )}
          </div>
          <button
            type="button"
            className="dialogue-close"
            onClick={onClose}
            aria-label="结束交谈"
            title="结束交谈"
          >
            结束交谈
          </button>
        </header>

        {line && (
          <p className={`dialogue-text dialogue-text-${line.speaker}`}>
            {line.text}
          </p>
        )}

        {view.canContinue && (
          <button type="button" className="dialogue-continue" onClick={onAdvance}>
            <span className="hud-key">E</span>
            <span>继续</span>
          </button>
        )}

        {!view.canContinue && choices.length > 0 && (
          <div className="dialogue-choices">
            {choices.map((choice, index) => (
              <button
                key={choice.id}
                type="button"
                className={`dialogue-choice${choice.guideStatus === 'next' ? ' is-recommended' : ''}${index === focusedIndex ? ' is-focused' : ''}`}
                onMouseEnter={() =>
                  setFocusState({ nodeId: view.nodeId, index })
                }
                onClick={() => onChoose(choice.id)}
              >
                {index < 9 && (
                  <span className="hud-key dialogue-choice-key">
                    {index + 1}
                  </span>
                )}
                <span className="dialogue-choice-copy">{choice.text}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
