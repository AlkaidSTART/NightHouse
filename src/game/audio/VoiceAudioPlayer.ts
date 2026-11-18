const DEFAULT_VOICE_VOLUME = 0.8;

/**
 * 管理当前语音片段。每次切换台词先停止上一段，避免字幕推进后旧声音继续播放。
 * 使用 HTMLAudioElement 而不是 Web Audio 节点，浏览器会复用用户在开始游戏时
 * 已经完成的播放授权；资源只在当前片段结束后释放引用。
 */
export class VoiceAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private volume = DEFAULT_VOICE_VOLUME;

  setVolume(volume: number): void {
    this.volume = clamp(volume, 0, 1);
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  play(url: string | null): void {
    this.stop();
    if (!url) {
      return;
    }

    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = this.volume;
    audio.addEventListener('ended', () => {
      if (this.audio === audio) {
        this.audio = null;
      }
      audio.removeAttribute('src');
      audio.load();
    });
    audio.addEventListener('error', () => {
      if (this.audio === audio) {
        this.audio = null;
      }
      audio.removeAttribute('src');
      audio.load();
    });
    this.audio = audio;
    void audio.play().catch(() => {
      // 对话字幕仍可正常推进；浏览器拒绝自动播放时不阻断游戏流程。
    });
  }

  stop(): void {
    const audio = this.audio;
    this.audio = null;
    if (!audio) {
      return;
    }
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }

  dispose(): void {
    this.stop();
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
