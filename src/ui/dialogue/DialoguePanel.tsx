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
          <>
            {view.guide && (
              <aside className="dialogue-guide" aria-label="建议提问顺序">
                <div className="dialogue-guide-heading">
                  <span className="dialogue-guide-title">提问参考</span>
                  <span className="dialogue-guide-note">
                    顺序不强制，已问过的话题会标记出来
                  </span>
                </div>
                {view.guide.hint && (
                  <p className="dialogue-guide-hint">{view.guide.hint}</p>
                )}
                <ol className="dialogue-guide-steps">
                  {view.guide.steps.map((step, index) => (
                    <li
                      key={step.choiceId}
                      className={`dialogue-guide-step is-${step.status}`}
                    >
                      <span className="dialogue-guide-order" aria-hidden="true">
                        {step.status === 'asked' ? '✓' : index + 1}
                      </span>
                      <span>{step.label}</span>
                      <span className="sr-only">
                        {step.status === 'asked'
                          ? '，已问'
                          : step.status === 'next'
                            ? '，建议下一步问'
                            : '，后续问题'}
                      </span>
                    </li>
                  ))}
                </ol>
              </aside>
            )}
            <div className="dialogue-choices">
              {choices.map((choice, index) => (
                <button
                  key={choice.id}
                  type="button"
                  className="dialogue-choice"
                  onClick={() => onChoose(choice.id)}
                >
                  <span className="dialogue-choice-index">{index + 1}</span>
                  <span className="dialogue-choice-copy">{choice.text}</span>
                  {(choice.guideStatus === 'next' ||
                    choice.guideStatus === 'asked') && (
                    <span
                      className={`dialogue-choice-tag is-${choice.guideStatus}`}
                    >
                      {choice.guideStatus === 'next' ? '建议先问' : '已问'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
