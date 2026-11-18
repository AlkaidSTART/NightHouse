import { useCallback, useEffect, useMemo, useState } from 'react';
import { prologue } from '../../content/prologue';

export interface PrologueOverlayProps {
  onStart: () => void;
}

type PrologueBeat =
  | { kind: 'lead'; id: string; text: string }
  | { kind: 'fact'; id: string; label: string; text: string }
  | {
      kind: 'letter';
      id: string;
      heading: string;
      paragraphs: readonly string[];
      signature: string;
    }
  | { kind: 'goal'; id: string; label: string; text: string };

/**
 * 开场序章：全屏电影独白舞台。
 * 每次只聚焦展示当前这一条，推进后平滑切换，不堆叠保留已读内容，也不显示进度数字。
 */
export function PrologueOverlay({ onStart }: PrologueOverlayProps) {
  const beats = useMemo<readonly PrologueBeat[]>(() => {
    const items: PrologueBeat[] = [];
    prologue.lead.forEach((text, index) => {
      items.push({ kind: 'lead', id: `lead-${index}`, text });
    });
    prologue.facts.forEach((fact, index) => {
      items.push({
        kind: 'fact',
        id: `fact-${index}`,
        label: fact.label,
        text: fact.text,
      });
    });
    items.push({
      kind: 'letter',
      id: 'letter',
      heading: prologue.letter.heading,
      paragraphs: prologue.letter.paragraphs,
      signature: prologue.letter.signature,
    });
    items.push({
      kind: 'goal',
      id: 'goal',
      label: prologue.goalLabel,
      text: prologue.goal,
    });
    return items;
  }, []);

  const [index, setIndex] = useState(0);
  const current = beats[index] ?? beats[beats.length - 1];
  const isLast = index >= beats.length - 1;

  const advance = useCallback(() => {
    setIndex((prev) => (prev < beats.length - 1 ? prev + 1 : prev));
  }, [beats.length]);

  const retreat = useCallback(() => {
    setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.repeat) {
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'Backspace') {
        event.preventDefault();
        retreat();
        return;
      }
      if (
        event.key === ' ' ||
        event.key === 'Enter' ||
        event.key === 'e' ||
        event.key === 'E'
      ) {
        event.preventDefault();
        if (isLast) {
          onStart();
        } else {
          advance();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advance, retreat, isLast, onStart]);

  if (!current) {
    return null;
  }

  return (
    <div
      className="prologue-stage"
      onClick={() => {
        if (!isLast) {
          advance();
        }
      }}
    >
      <header className="prologue-stage-top">
        <span className="prologue-dateline">
          {prologue.eyebrow} · {prologue.title}
        </span>
        {!isLast && (
          <button
            type="button"
            className="prologue-skip-btn"
            onClick={(event) => {
              event.stopPropagation();
              onStart();
            }}
          >
            跳过
          </button>
        )}
      </header>

      <main className="prologue-center" aria-live="polite">
        <div key={current.id} className="prologue-beat">
          {current.kind === 'lead' && (
            <p className="prologue-beat-lead">{current.text}</p>
          )}

          {current.kind === 'fact' && (
            <div className="prologue-beat-fact">
              <p className="prologue-beat-kicker">{current.label}</p>
              <p className="prologue-beat-text">{current.text}</p>
            </div>
          )}

          {current.kind === 'letter' && (
            <blockquote className="prologue-beat-letter">
              <p className="prologue-beat-kicker">{current.heading}</p>
              {current.paragraphs.map((paragraph) => (
                <p key={paragraph} className="prologue-beat-letter-line">
                  {paragraph}
                </p>
              ))}
              <cite className="prologue-beat-signature">
                {current.signature}
              </cite>
            </blockquote>
          )}

          {current.kind === 'goal' && (
            <div className="prologue-beat-goal">
              <p className="prologue-beat-kicker">{current.label}</p>
              <p className="prologue-beat-text">{current.text}</p>
              <div className="prologue-beat-action">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    onStart();
                  }}
                  autoFocus
                >
                  {prologue.startLabel}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="prologue-stage-bottom">
        {!isLast && (
          <span className="prologue-hint">
            {index > 0 ? '← 返回 · ' : ''}点击或按 E 继续
          </span>
        )}
      </footer>
    </div>
  );
}
