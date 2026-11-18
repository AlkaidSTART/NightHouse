import { useEffect } from 'react';
import { DEFAULT_SETTINGS } from '../../game/save/defaults';
import type { PlayerSettings } from '../../shared/types/save';

export interface SettingsPanelProps {
  settings: PlayerSettings;
  onChange: (next: PlayerSettings) => void;
  onClose: () => void;
}

export function SettingsPanel({
  settings,
  onChange,
  onClose,
}: SettingsPanelProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  const update = <K extends keyof PlayerSettings>(
    key: K,
    value: PlayerSettings[K],
  ): void => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div
      className="overlay settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="游戏设置"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="overlay-panel settings-panel">
        <header className="settings-header">
          <div>
            <p className="overlay-eyebrow">系统设置</p>
            <h2 className="overlay-title">偏好与控制</h2>
          </div>
          <button
            type="button"
            className="inspect-close"
            onClick={onClose}
            aria-label="关闭设置"
          >
            关闭
          </button>
        </header>

        <div className="settings-body">
          <section className="settings-group">
            <h3 className="settings-group-title">视角与操作</h3>

            <label className="settings-row" htmlFor="setting-sensitivity">
              <div className="settings-label">
                <span>鼠标灵敏度</span>
                <span className="settings-value">
                  {settings.mouseSensitivity.toFixed(2)}
                </span>
              </div>
              <input
                id="setting-sensitivity"
                className="settings-range"
                type="range"
                min={0.1}
                max={2}
                step={0.05}
                value={settings.mouseSensitivity}
                onChange={(event) =>
                  update('mouseSensitivity', Number(event.target.value))
                }
              />
            </label>

            <label className="settings-toggle-row" htmlFor="setting-invert-y">
              <div className="settings-toggle-copy">
                <span>反转垂直视角（Y 轴）</span>
                <span className="settings-desc">向上移动鼠标时视角向下俯视</span>
              </div>
              <input
                id="setting-invert-y"
                className="settings-checkbox"
                type="checkbox"
                checked={settings.invertY}
                onChange={(event) => update('invertY', event.target.checked)}
              />
            </label>
          </section>

          <section className="settings-group">
            <h3 className="settings-group-title">界面显示</h3>

            <label className="settings-toggle-row" htmlFor="setting-hud-minimal">
              <div className="settings-toggle-copy">
                <span>精简探索界面（沉浸模式）</span>
                <span className="settings-desc">
                  隐藏小地图与目标栏，探索中可随时按 H 键切换
                </span>
              </div>
              <input
                id="setting-hud-minimal"
                className="settings-checkbox"
                type="checkbox"
                checked={settings.hudMinimal}
                onChange={(event) => update('hudMinimal', event.target.checked)}
              />
            </label>
          </section>

          <section className="settings-group">
            <h3 className="settings-group-title">音频（本地保存）</h3>

            <label className="settings-row" htmlFor="setting-master-volume">
              <div className="settings-label">
                <span>主音量</span>
                <span className="settings-value">
                  {Math.round(settings.masterVolume * 100)}%
                </span>
              </div>
              <input
                id="setting-master-volume"
                className="settings-range"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.masterVolume}
                onChange={(event) =>
                  update('masterVolume', Number(event.target.value))
                }
              />
            </label>

            <label className="settings-row" htmlFor="setting-effects-volume">
              <div className="settings-label">
                <span>环境与交互音效</span>
                <span className="settings-value">
                  {Math.round(settings.effectsVolume * 100)}%
                </span>
              </div>
              <input
                id="setting-effects-volume"
                className="settings-range"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.effectsVolume}
                onChange={(event) =>
                  update('effectsVolume', Number(event.target.value))
                }
              />
            </label>

            <label className="settings-row" htmlFor="setting-voice-volume">
              <div className="settings-label">
                <span>对话音量</span>
                <span className="settings-value">
                  {Math.round(settings.voiceVolume * 100)}%
                </span>
              </div>
              <input
                id="setting-voice-volume"
                className="settings-range"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.voiceVolume}
                onChange={(event) =>
                  update('voiceVolume', Number(event.target.value))
                }
              />
            </label>
          </section>
        </div>

        <footer className="settings-footer">
          <button
            type="button"
            className="button"
            onClick={() => onChange({ ...DEFAULT_SETTINGS })}
          >
            恢复默认
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={onClose}
          >
            完成
          </button>
        </footer>
      </div>
    </div>
  );
}
