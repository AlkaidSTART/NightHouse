import { useState } from 'react';
import type { PlayerSettings } from '../../shared/types/save';
import { useGameStore } from '../../stores/gameStore';
import { SettingsPanel } from '../settings/SettingsPanel';

export interface PauseMenuProps {
  onResume: () => void;
  onExit?: () => void;
  settings?: PlayerSettings;
  onUpdateSettings?: (next: PlayerSettings) => void;
}

export function PauseMenu({
  onResume,
  onExit,
  settings: settingsProp,
  onUpdateSettings,
}: PauseMenuProps) {
  const storeExit = useGameStore((s) => s.exitToHome);
  const storeSettings = useGameStore((s) => s.settings);
  const storeSetSettings = useGameStore((s) => s.setSettings);

  const handleExit = onExit ?? storeExit;
  const settings = settingsProp ?? storeSettings;
  const handleSettingsChange = onUpdateSettings ?? storeSetSettings;
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="overlay">
      <div className="overlay-panel">
        <h2 className="overlay-title">暂停</h2>
        <div className="overlay-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={onResume}
          >
            继续游戏
          </button>
          <button
            type="button"
            className="button"
            onClick={() => setSettingsOpen(true)}
            aria-haspopup="dialog"
          >
            设置
          </button>
          <button type="button" className="button" onClick={handleExit}>
            返回首页
          </button>
        </div>
        <div className="pause-controls" aria-label="按键参考">
          <span>WASD 移动</span>
          <span>Shift 奔跑</span>
          <span>空格 跳跃</span>
          <span>C 蹲下</span>
          <span>E 交互</span>
          <span>J 线索</span>
          <span>B 背包</span>
          <span>H 精简界面</span>
          <span>Esc 暂停</span>
        </div>
      </div>

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
