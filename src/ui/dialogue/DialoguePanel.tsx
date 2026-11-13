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
  const speaker =
    line?.speaker === 'narration' ? '旁白' : line?.name ?? view.npcName;

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
            <span className="dialogue-speaker">{speaker}</span>
            {view.beatLabel && (
              <span className="dialogue-beat">{view.beatLabel}</span>
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
                className="dialogue-choice"
                onClick={() => onChoose(choice.id)}
              >
                <span className="dialogue-choice-index">{index + 1}</span>
                <span>{choice.text}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
