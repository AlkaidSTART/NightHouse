import { useEffect, useRef, useState } from 'react';
import type { PuzzleView } from '../../shared/types/puzzle';
import { useDraggablePanel } from '../shared/useDraggablePanel';

export interface PuzzlePanelProps {
  view: PuzzleView;
  onAction: (actionId: string) => void;
  onSubmitCode: (code: string) => void;
  onClose: () => void;
}

export function PuzzlePanel({
  view,
  onAction,
  onSubmitCode,
  onClose,
}: PuzzlePanelProps) {
  const [code, setCode] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { panelRef, isDragging, panelStyle, handleProps } =
    useDraggablePanel<HTMLElement>(view.title);

  const codeError = view.kind === 'safe' ? view.codeError : null;
  useEffect(() => {
    if (codeError) {
      inputRef.current?.focus();
    }
  }, [codeError, attemptCount]);

  return (
    <div className="inspect-layer puzzle-layer">
      <article
        ref={panelRef}
        className={`inspect-panel puzzle-panel puzzle-panel--${view.kind}${isDragging ? ' is-dragging' : ''}`}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-label={view.title}
      >
        <header className="inspect-header panel-drag-handle" {...handleProps}>
          <div>
            <p className="inspect-category">{view.category}</p>
            <h2 className="inspect-title">{view.title}</h2>
          </div>
          <button
            type="button"
            className="inspect-close"
            onClick={onClose}
            aria-label="收起"
          >
            收起
          </button>
        </header>

        <div className="inspect-body puzzle-body">
          {view.description.map((paragraph) => (
            <p key={paragraph} className="puzzle-text">
              {paragraph}
            </p>
          ))}

          {view.kind === 'clock' && view.actions.length > 0 && (
            <div className="puzzle-actions">
              {view.actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="puzzle-action"
                  onClick={() => onAction(action.id)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {view.kind === 'clock' && view.feedback && (
            <p className="puzzle-feedback" role="status">
              {view.feedback}
            </p>
          )}

          {view.kind === 'safe' && view.canTry && (
            <form
              className="puzzle-code-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (code.length === view.codeLength) {
                  setAttemptCount((count) => count + 1);
                  onSubmitCode(code);
                  setCode('');
                }
              }}
            >
              <div
                key={attemptCount}
                className={`safe-lock-plate${view.codeError ? ' is-rejected' : ''}`}
              >
                <span className="safe-lock-rivet safe-lock-rivet--tl" />
                <span className="safe-lock-rivet safe-lock-rivet--tr" />
                <span className="safe-lock-rivet safe-lock-rivet--bl" />
                <span className="safe-lock-rivet safe-lock-rivet--br" />

                <div className="safe-lock-heading" aria-hidden="true">
                  <span>ASH CROFT</span>
                  <span>组合锁</span>
                </div>

                <label className="safe-code-display" htmlFor="puzzle-code">
                  <span className="safe-code-caption">密码 / COMBINATION</span>
                  <span className="safe-code-window">
                    <span className="safe-code-slots" aria-hidden="true">
                      {Array.from({ length: view.codeLength }, (_, index) => {
                        const char = code[index] ?? '';
                        const isCurrent =
                          index === Math.min(code.length, view.codeLength - 1) &&
                          code.length < view.codeLength;
                        return (
                          <span
                            key={index}
                            className={`safe-code-slot${char ? ' is-filled' : ''}${isCurrent ? ' is-current' : ''}`}
                          >
                            {char || '·'}
                          </span>
                        );
                      })}
                    </span>
                    <input
                      ref={inputRef}
                      id="puzzle-code"
                      className="puzzle-code-input"
                      value={code}
                      onChange={(event) => {
                        const digits = event.target.value
                          .replace(/\D/g, '')
                          .slice(0, view.codeLength);
                        setCode(digits);
                      }}
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={view.codeLength}
                      aria-label="保险箱密码"
                      autoFocus
                    />
                  </span>
                </label>

                <div className="safe-dial-track">
                  <span className="safe-dial-number safe-dial-number--top" aria-hidden="true">0</span>
                  <span className="safe-dial-number safe-dial-number--right" aria-hidden="true">25</span>
                  <span className="safe-dial-number safe-dial-number--bottom" aria-hidden="true">50</span>
                  <span className="safe-dial-number safe-dial-number--left" aria-hidden="true">75</span>
                  <button
                    type="submit"
                    className={`safe-dial-knob${code.length === view.codeLength ? ' is-ready' : ''}`}
                    disabled={code.length !== view.codeLength}
                    aria-label="转动转盘验证密码"
                  >
                    <span className="safe-dial-grip" aria-hidden="true" />
                  </button>
                </div>

                <p className="safe-lock-instruction">
                  输入四位数字后，按下中央转盘验证
                </p>
              </div>
            </form>
          )}

          {view.kind === 'safe' && view.codeError && (
            <p className="puzzle-feedback" role="status">
              {view.codeError}
            </p>
          )}

          {view.kind === 'safe' && view.note && (
            <p className="puzzle-note">{view.note}</p>
          )}

          {view.newClueTitles.length > 0 && (
            <div className="inspect-clue puzzle-clues" role="status">
              <span className="inspect-clue-label">记入线索</span>
              {view.newClueTitles.map((title) => (
                <span key={title} className="inspect-clue-item">
                  {title}
                </span>
              ))}
            </div>
          )}
        </div>

        <footer className="inspect-footer">
          <span className="puzzle-footer-hint">Esc 收起</span>
        </footer>
      </article>
    </div>
  );
}
