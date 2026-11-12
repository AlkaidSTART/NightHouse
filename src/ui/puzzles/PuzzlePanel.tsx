import { useState } from 'react';
import type { PuzzleView } from '../../shared/types/puzzle';

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

  return (
    <div className="inspect-layer">
      <article
        className="inspect-panel puzzle-panel"
        role="dialog"
        aria-modal="true"
        aria-label={view.title}
      >
        <header className="inspect-header">
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
            ×
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
                  onSubmitCode(code);
                }
              }}
            >
              <label className="puzzle-code-label" htmlFor="puzzle-code">
                四位数字转盘
              </label>
              <input
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
              <button
                type="submit"
                className="puzzle-action puzzle-submit"
                disabled={code.length !== view.codeLength}
              >
                转动转盘
              </button>
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
