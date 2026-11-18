import { useEffect, useMemo, useState } from 'react';
import type {
  DialogueChoiceView,
  DialogueView,
} from '../../shared/types/dialogue';
import { buildDialogueQuestionFlow } from './dialogueQuestionFlow';

export interface DialoguePanelProps {
  view: DialogueView;
  onAdvance: () => void;
  onChoose: (choiceId: string) => void;
  onClose: () => void;
}

interface FocusState {
  nodeId: string;
  choiceId: string | null;
}

export function DialoguePanel({
  view,
  onAdvance,
  onChoose,
  onClose,
}: DialoguePanelProps) {
  const { line, choices, guide } = view;
  const isNarration = line?.speaker === 'narration';
  const speaker = isNarration ? null : (line?.name ?? view.npcName);
  const [focusState, setFocusState] = useState<FocusState>({
    nodeId: view.nodeId,
    choiceId: null,
  });
  const [expandedState, setExpandedState] = useState<{
    nodeId: string;
    nextChoiceId: string | null;
    expanded: boolean;
  }>({ nodeId: view.nodeId, nextChoiceId: null, expanded: false });
  const questionFlow = useMemo(
    () => buildDialogueQuestionFlow(choices, guide),
    [choices, guide],
  );
  const showAdditionalChoices =
    expandedState.nodeId === view.nodeId &&
    expandedState.nextChoiceId === questionFlow.nextStep?.choiceId &&
    expandedState.expanded;

  const visibleChoices = useMemo(() => {
    if (!questionFlow.primaryChoice || !showAdditionalChoices) {
      return questionFlow.visibleChoices;
    }
    return questionFlow.allChoices;
  }, [questionFlow, showAdditionalChoices]);

  const focusedIndex = Math.max(
    0,
    visibleChoices.findIndex(
      (choice) =>
        focusState.nodeId === view.nodeId &&
        choice.id === focusState.choiceId,
    ),
  );
  const hasNaturalExit = choices.some((choice) => choice.isExit);
  const hasAdditionalChoices = questionFlow.additionalChoices.length > 0;

  useEffect(() => {
    if (view.canContinue || visibleChoices.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.repeat) {
        return;
      }
      if (/^[1-9]$/.test(event.key)) {
        const idx = Number(event.key) - 1;
        const target = visibleChoices[idx];
        if (target) {
          event.preventDefault();
          onChoose(target.id);
        }
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
        event.preventDefault();
        setFocusState((prev) => {
          const currentIndex = visibleChoices.findIndex(
            (choice) =>
              prev.nodeId === view.nodeId && choice.id === prev.choiceId,
          );
          const base = currentIndex >= 0 ? currentIndex : 0;
          return {
            nodeId: view.nodeId,
            choiceId: visibleChoices[(base + 1) % visibleChoices.length]?.id ?? null,
          };
        });
        return;
      }
      if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
        event.preventDefault();
        setFocusState((prev) => {
          const currentIndex = visibleChoices.findIndex(
            (choice) =>
              prev.nodeId === view.nodeId && choice.id === prev.choiceId,
          );
          const base = currentIndex >= 0 ? currentIndex : 0;
          return {
            nodeId: view.nodeId,
            choiceId:
              visibleChoices[
                (base - 1 + visibleChoices.length) % visibleChoices.length
              ]?.id ?? null,
          };
        });
        return;
      }
      if (event.key === 'Enter') {
        const target = visibleChoices[focusedIndex];
        if (target) {
          event.preventDefault();
          onChoose(target.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    view.canContinue,
    view.nodeId,
    visibleChoices,
    focusedIndex,
    onChoose,
  ]);

  const renderChoice = (
    choice: DialogueChoiceView,
    index: number,
    options: { primary?: boolean; supplementary?: boolean } = {},
  ) => {
    const className = [
      'dialogue-choice',
      'dialogue-choice-enter',
      choice.guideStatus === 'next' ? 'is-recommended' : '',
      options.primary ? 'is-primary' : '',
      options.supplementary ? 'is-supplementary' : '',
      index === focusedIndex ? 'is-focused' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        key={choice.id}
        type="button"
        className={className}
        onMouseEnter={() =>
          setFocusState({ nodeId: view.nodeId, choiceId: choice.id })
        }
        onClick={() => onChoose(choice.id)}
      >
        {index < 9 && (
          <span className="hud-key dialogue-choice-key">{index + 1}</span>
        )}
        <span className="dialogue-choice-copy">{choice.text}</span>
      </button>
    );
  };

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
          <p
            key={`${view.nodeId}:${line.text}`}
            className={`dialogue-text dialogue-text-${line.speaker} dialogue-text-enter`}
          >
            {line.text}
          </p>
        )}

        {view.canContinue && (
          <button type="button" className="dialogue-continue" onClick={onAdvance}>
            <span className="hud-key">E</span>
            <span>继续</span>
          </button>
        )}

        {!view.canContinue && choices.length > 0 && guide && (
          <div className="dialogue-guide" aria-live="polite">
            <div className="dialogue-guide-heading">
              <span className="dialogue-guide-progress">
                追问 {questionFlow.position} / {questionFlow.total}
              </span>
              <span className="dialogue-guide-current">
                {questionFlow.nextStep?.label ?? '本节点追问完成'}
              </span>
            </div>
            {guide.hint && <p className="dialogue-guide-hint">{guide.hint}</p>}
            <div className="dialogue-guide-dots" aria-hidden="true">
              {guide.steps.map((step) => (
                <span
                  key={step.choiceId}
                  className={`dialogue-guide-dot is-${step.status}`}
                />
              ))}
            </div>
          </div>
        )}

        {!view.canContinue && choices.length > 0 && (
          <div className="dialogue-choices">
            {questionFlow.primaryChoice ? (
              <>
                {renderChoice(questionFlow.primaryChoice, 0, {
                  primary: true,
                })}
                {questionFlow.navigationChoices.map((choice, index) =>
                  renderChoice(choice, index + 1, {
                    supplementary: true,
                  }),
                )}
                {hasAdditionalChoices && (
                  <button
                    type="button"
                    className="dialogue-choice dialogue-choice-more dialogue-choice-enter"
                    onClick={() =>
                      setExpandedState({
                        nodeId: view.nodeId,
                        nextChoiceId: questionFlow.nextStep?.choiceId ?? null,
                        expanded: !showAdditionalChoices,
                      })
                    }
                    aria-expanded={showAdditionalChoices}
                  >
                    <span className="dialogue-choice-more-mark" aria-hidden="true">
                      {showAdditionalChoices ? '−' : '+'}
                    </span>
                    <span className="dialogue-choice-copy">
                      {showAdditionalChoices
                        ? '收起其他话题'
                        : `其他话题（${questionFlow.additionalChoices.length}）`}
                    </span>
                  </button>
                )}
                {showAdditionalChoices &&
                  questionFlow.additionalChoices.map((choice, index) =>
                    renderChoice(
                      choice,
                      questionFlow.navigationChoices.length + index + 1,
                      { supplementary: true },
                    ),
                  )}
              </>
            ) : (
              choices.map((choice, index) => renderChoice(choice, index))
            )}

            {!hasNaturalExit && (
              <button
                type="button"
                className="dialogue-choice dialogue-choice-exit dialogue-choice-enter"
                onClick={onClose}
              >
                <span className="hud-key dialogue-choice-key">Esc</span>
                <span className="dialogue-choice-copy">结束交谈</span>
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
