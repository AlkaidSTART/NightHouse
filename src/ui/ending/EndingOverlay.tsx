import { useEffect, useMemo, useRef, useState } from 'react';
import { buildEndingPerformance } from '../../content/endingPerformanceLocal';
import { EndingAudioPlayer } from '../../game/audio/EndingAudioPlayer';
import type { EndingPlaybackState } from '../../game/audio/EndingAudioPlayer';
import type { PlayerSettings } from '../../shared/types/save';
import { content } from '../../content';
import { countHeldInventoryItems } from '../../game/inventory/inventory';
import { useStoryStore } from '../../stores/storyStore';
import type { EndingView } from '../../shared/types/ending';

export interface EndingOverlayProps {
  ending: EndingView;
  settings: PlayerSettings;
  onExit: () => void;
}

/** 结局演出。文本来自 content/endings.ts，按 choice.midnight 与证据分变体。 */
export function EndingOverlay({ ending, settings, onExit }: EndingOverlayProps) {
  const discoveredClueIds = useStoryStore((s) => s.discoveredClueIds);
  const storyFlags = useStoryStore((s) => s.storyFlags);
  const performance = useMemo(() => buildEndingPerformance(ending, storyFlags), [ending, storyFlags]);
  const playerRef = useRef<EndingAudioPlayer | null>(null);
  const volumesRef = useRef(settings);
  const [playback, setPlayback] = useState<EndingPlaybackState>({ status: 'idle', paragraphId: null, cue: null });
  const currentParagraphRef = useRef<HTMLParagraphElement | null>(null);
  const narration = performance?.voiceAvailable ?? false;
  const finished = !performance || !narration || ['completed', 'skipped', 'failed'].includes(playback.status);

  useEffect(() => {
    volumesRef.current = settings;
    playerRef.current?.setVolumes(settings.masterVolume, settings.voiceVolume, settings.effectsVolume);
  }, [settings]);

  useEffect(() => {
    if (!performance) return;
    const player = new EndingAudioPlayer(performance, setPlayback);
    const volumes = volumesRef.current;
    player.setVolumes(volumes.masterVolume, volumes.voiceVolume, volumes.effectsVolume);
    playerRef.current = player;
    player.start();
    const visibility = (): void => {
      if (document.hidden) player.pause();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      player.dispose();
      if (playerRef.current === player) playerRef.current = null;
    };
  }, [performance]);

  useEffect(() => {
    currentParagraphRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
  }, [playback.paragraphId]);

  const paragraphs = performance?.paragraphs ?? ending.paragraphs.map((text, index) => ({ id: `fallback_${index}`, text, section: 'ending' }));
  const exit = (): void => { playerRef.current?.dispose(); onExit(); };
  const currentIndex = paragraphs.findIndex((paragraph) => paragraph.id === playback.paragraphId) + 1;

  const summary = useMemo(() => {
    const discoveredSet = new Set(discoveredClueIds);
    const keyTotal = content.clues.filter((c) => c.priority !== 'ambient').length;
    const keyFound = content.clues.filter(
      (c) => c.priority !== 'ambient' && discoveredSet.has(c.id),
    ).length;
    const archiveTotal = content.clues.filter(
      (c) => c.priority === 'ambient',
    ).length;
    const archiveFound = content.clues.filter(
      (c) => c.priority === 'ambient' && discoveredSet.has(c.id),
    ).length;
    const itemsHeld = countHeldInventoryItems(content.items, storyFlags);
    return {
      keyFound,
      keyTotal,
      archiveFound,
      archiveTotal,
      itemsHeld,
    };
  }, [discoveredClueIds, storyFlags]);

  return (
    <div className="overlay ending-overlay" role="dialog" aria-modal="true" aria-label={`结局：${ending.title}`}>
      <div className="overlay-panel ending-panel">
        <p className="overlay-eyebrow">结局 · {ending.title}</p>
        <h2 className="overlay-title">{ending.subtitle}</h2>

        <p className="ending-playback-status" role="status">
          {!performance ? '旁白与音效不可用，仍可阅读完整结局。'
            : !narration ? '旁白未随此版本提供；完整字幕与原创音效仍可使用。'
              : playback.status === 'failed' ? '旁白暂时无法播放，仍可阅读完整结局。'
                : playback.status === 'paused' ? '旁白已暂停，点击继续播放。'
                  : !finished ? (playback.cue ?? `正在讲述 · ${currentIndex} / ${paragraphs.length}`)
                    : '旁白已结束，可回看全文。'}
        </p>
        <div className="ending-body" tabIndex={0} aria-label="完整结局文本">
          {paragraphs.map((paragraph, index) => (
            <div key={paragraph.id}>
              {(index === 0 || paragraph.section !== paragraphs[index - 1]?.section) && (
                <h3 className="ending-section-title">{paragraph.section === 'truth' ? '这一夜发生了什么' : ending.title}</h3>
              )}
              <p ref={paragraph.id === playback.paragraphId ? currentParagraphRef : undefined}
                className={paragraph.id === playback.paragraphId && !finished ? 'ending-current-paragraph' : undefined}
                aria-current={paragraph.id === playback.paragraphId && !finished ? 'true' : undefined}>
                {paragraph.text}
              </p>
            </div>
          ))}
        </div>

        {finished && <div className="ending-summary" aria-label="调查总结">
          <div className="ending-stat">
            <span className="ending-stat-label">关键线索</span>
            <span className="ending-stat-value">
              {summary.keyFound} / {summary.keyTotal}
            </span>
          </div>
          <div className="ending-stat">
            <span className="ending-stat-label">别墅档案</span>
            <span className="ending-stat-value">
              {summary.archiveFound} / {summary.archiveTotal}
            </span>
          </div>
          <div className="ending-stat">
            <span className="ending-stat-label">持有物品</span>
            <span className="ending-stat-value">
              {summary.itemsHeld} / {content.items.length}
            </span>
          </div>
        </div>}
        {finished && <p className="ending-replay-note">
          返回首页后可重新开始探索不同的抉择与真相分支。
        </p>}

        <div className="overlay-actions">
          {!finished && narration && <>
            <button type="button" className="button" onClick={() => playback.status === 'paused' ? playerRef.current?.resume() : playerRef.current?.pause()}>
              {playback.status === 'paused' ? '继续旁白' : '暂停旁白'}
            </button>
            <button type="button" className="button" onClick={() => playerRef.current?.skip()}>跳过旁白，阅读结局</button>
          </>}
          {finished && performance && narration && <button type="button" className="button" onClick={() => playerRef.current?.start()}>重播旁白</button>}
          {finished && performance && !narration && <button type="button" className="button" onClick={() => playerRef.current?.start()}>重播结局音效</button>}
          {finished && <button
            type="button"
            className="button button-primary"
            onClick={exit}
            autoFocus
          >
            返回首页
          </button>}
        </div>
      </div>
    </div>
  );
}
