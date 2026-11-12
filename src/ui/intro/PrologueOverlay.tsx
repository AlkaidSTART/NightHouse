import { prologue } from '../../content/prologue';

export interface PrologueOverlayProps {
  onStart: () => void;
}

/**
 * 开场序章：先交代背景与今晚的目标，再交给称谓选择与操作提示。
 * 只在新游戏开始时出现；继续游戏直接进入 StartOverlay。
 */
export function PrologueOverlay({ onStart }: PrologueOverlayProps) {
  return (
    <div className="overlay">
      <div className="overlay-panel prologue-panel">
        <p className="overlay-eyebrow">{prologue.eyebrow}</p>
        <h2 className="overlay-title">{prologue.title}</h2>

        <div className="prologue-body">
          {prologue.lead.map((paragraph) => (
            <p key={paragraph} className="prologue-lead">
              {paragraph}
            </p>
          ))}

          <dl className="prologue-facts">
            {prologue.facts.map((fact) => (
              <div key={fact.label} className="prologue-fact">
                <dt>{fact.label}</dt>
                <dd>{fact.text}</dd>
              </div>
            ))}
          </dl>

          <blockquote className="prologue-letter">
            <p className="prologue-letter-heading">{prologue.letter.heading}</p>
            {prologue.letter.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <cite>{prologue.letter.signature}</cite>
          </blockquote>

          <div className="prologue-goal">
            <span className="prologue-goal-label">{prologue.goalLabel}</span>
            <p>{prologue.goal}</p>
          </div>
        </div>

        <div className="overlay-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={onStart}
            autoFocus
          >
            {prologue.startLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
