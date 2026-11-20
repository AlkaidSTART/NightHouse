import type { EndingPerformance, EndingAudioStep } from '../../content/endingPerformance';

export interface EndingPlaybackState {
  status: 'idle' | 'playing' | 'paused' | 'completed' | 'skipped' | 'failed';
  paragraphId: string | null;
  cue: string | null;
}

export interface EndingAudioHandle {
  volume: number;
  loop: boolean;
  preload: string;
  play(): Promise<void>;
  pause(): void;
  load(): void;
  removeAttribute(name: string): void;
  addEventListener(name: string, listener: () => void): void;
  removeEventListener(name: string, listener: () => void): void;
}

export interface EndingAudioEnvironment {
  audio(url: string): EndingAudioHandle;
  later(callback: () => void, milliseconds: number): number;
  cancel(timer: number): void;
  now(): number;
}

const browserEnvironment: EndingAudioEnvironment = {
  audio: (url) => new Audio(url),
  later: (callback, milliseconds) => window.setTimeout(callback, milliseconds),
  cancel: (timer) => window.clearTimeout(timer),
  now: () => Date.now(),
};

interface Track {
  audio: EndingAudioHandle;
  bus: 'voice' | 'effects';
  gain: number;
  cleanup(): void;
}

/** 拥有本次结局的所有音频与计时器；资源失败立即回到全文阅读，不逐条等待缺失文件。 */
export class EndingAudioPlayer {
  private state: EndingPlaybackState = { status: 'idle', paragraphId: null, cue: null };
  private tracks = new Set<Track>();
  private ambient = new Set<Track>();
  private primary: Track | null = null;
  private accents = new Set<Track>();
  private timer: number | null = null;
  private pending: { callback: () => void; milliseconds: number; due: number } | null = null;
  private index = -1;
  private generation = 0;
  private master = 1;
  private voice = 0.8;
  private effects = 0.7;
  private disposed = false;
  private quiet = false;

  private readonly performance: EndingPerformance;
  private readonly changed: (state: EndingPlaybackState) => void;
  private readonly environment: EndingAudioEnvironment;

  constructor(
    performance: EndingPerformance,
    changed: (state: EndingPlaybackState) => void,
    environment: EndingAudioEnvironment = browserEnvironment,
  ) {
    this.performance = performance;
    this.changed = changed;
    this.environment = environment;
  }

  getSnapshot(): EndingPlaybackState { return { ...this.state }; }

  setVolumes(master: number, voice: number, effects: number): void {
    const clamp = (value: number): number => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
    this.master = clamp(master); this.voice = clamp(voice); this.effects = clamp(effects);
    this.updateVolumes();
  }

  start(): void {
    if (this.disposed) return;
    this.clear();
    this.index = -1;
    this.quiet = false;
    this.state = { status: 'playing', paragraphId: null, cue: null };
    this.changed(this.getSnapshot());
    try {
      this.addAmbient(this.performance.roomUrl, 0.2);
      if (this.performance.gramophoneUrl) this.addAmbient(this.performance.gramophoneUrl, 0.13);
    } catch {
      // 环境音不可用时仍播放正文，核心旁白的失败由主轨处理。
    }
    this.advance();
  }

  pause(): void {
    if (this.state.status !== 'playing') return;
    if (this.pending) {
      this.pending.milliseconds = Math.max(0, this.pending.due - this.environment.now());
      if (this.timer !== null) this.environment.cancel(this.timer);
      this.timer = null;
    }
    this.state.status = 'paused';
    for (const track of this.tracks) track.audio.pause();
    this.changed(this.getSnapshot());
  }

  resume(): void {
    if (this.state.status !== 'paused' || this.disposed) return;
    this.state.status = 'playing';
    this.changed(this.getSnapshot());
    if (this.pending) this.schedule(this.pending.callback, this.pending.milliseconds);
    for (const track of [...this.tracks]) this.play(track, track === this.primary);
  }

  skip(): void { if (!this.disposed) this.finish('skipped'); }

  dispose(): void {
    this.disposed = true;
    this.clear();
  }

  private advance(): void {
    if (this.state.status !== 'playing' || this.disposed) return;
    this.cancelTimer();
    if (this.primary) this.release(this.primary);
    for (const accent of [...this.accents]) this.release(accent);
    const step = this.performance.steps[++this.index];
    if (!step) { this.finish('completed'); return; }
    this.quiet = step.kind === 'effect' || (step.kind === 'silence' && step.quiet);
    this.updateVolumes();
    this.state.cue = step.kind === 'effect' ? step.label : null;
    if (step.kind === 'voice') this.state.paragraphId = step.paragraphId;
    this.changed(this.getSnapshot());
    if (step.kind === 'silence') {
      this.schedule(() => this.advance(), step.milliseconds);
    } else {
      try { this.startPrimary(step); }
      catch { this.finish('failed'); }
    }
  }

  private startPrimary(step: Exclude<EndingAudioStep, { kind: 'silence' }>): void {
    const token = this.generation;
    const track = this.createTrack(step.url, step.kind === 'voice' ? 'voice' : 'effects', step.kind === 'voice' ? 1 : step.gain);
    this.primary = track;
    const active = (): boolean => token === this.generation && this.primary === track && !this.disposed;
    const ended = (): void => {
      if (!active()) return;
      if (this.state.status === 'paused') { this.schedule(() => this.advance(), 0); return; }
      this.advance();
    };
    const error = (): void => {
      if (!active()) return;
      if (step.kind === 'voice') this.finish('failed');
      else ended(); // 音效失败不影响已生成的旁白与字幕。
    };
    const playing = (): void => {
      if (active()) this.schedule(() => error(), Math.min(180000, step.durationSeconds * 1000 + 10000));
    };
    track.audio.addEventListener('ended', ended);
    track.audio.addEventListener('error', error);
    track.audio.addEventListener('playing', playing);
    track.cleanup = () => {
      track.audio.removeEventListener('ended', ended);
      track.audio.removeEventListener('error', error);
      track.audio.removeEventListener('playing', playing);
    };
    this.schedule(error, 12000);
    if (step.kind === 'voice' && step.accentUrl) this.addAccent(step.accentUrl);
    this.play(track, step.kind === 'voice', error);
  }

  private createTrack(url: string, bus: Track['bus'], gain: number): Track {
    const audio = this.environment.audio(url);
    audio.preload = 'auto';
    const track: Track = { audio, bus, gain, cleanup: () => {} };
    this.tracks.add(track);
    this.updateVolumes();
    return track;
  }

  private addAmbient(url: string, gain: number): void {
    const track = this.createTrack(url, 'effects', gain);
    this.ambient.add(track);
    track.audio.loop = true;
    const error = (): void => this.release(track);
    track.audio.addEventListener('error', error);
    track.cleanup = () => track.audio.removeEventListener('error', error);
    this.play(track, false);
  }

  private addAccent(url: string): void {
    const track = this.createTrack(url, 'effects', 0.2);
    this.accents.add(track);
    const done = (): void => this.release(track);
    track.audio.addEventListener('ended', done);
    track.audio.addEventListener('error', done);
    track.cleanup = () => {
      track.audio.removeEventListener('ended', done);
      track.audio.removeEventListener('error', done);
    };
    this.play(track, false);
  }

  private play(track: Track, required: boolean, failed?: () => void): void {
    const token = this.generation;
    try {
      void track.audio.play().catch(() => {
        if (token !== this.generation || !this.tracks.has(track) || this.disposed || this.state.status === 'paused') return;
        if (failed) failed();
        else if (required) this.finish('failed');
        else this.release(track);
      });
    } catch {
      if (failed) failed();
      else if (required) this.finish('failed');
      else this.release(track);
    }
  }

  private updateVolumes(): void {
    for (const track of this.tracks) {
      const muted = this.quiet && this.ambient.has(track);
      track.audio.volume = muted ? 0 : this.master * (track.bus === 'voice' ? this.voice : this.effects) * track.gain;
    }
  }

  private schedule(callback: () => void, milliseconds: number): void {
    this.cancelTimer();
    this.pending = { callback, milliseconds, due: this.environment.now() + milliseconds };
    if (this.state.status === 'paused') return;
    this.timer = this.environment.later(() => { this.timer = null; this.pending = null; callback(); }, milliseconds);
  }

  private cancelTimer(): void {
    if (this.timer !== null) this.environment.cancel(this.timer);
    this.timer = null;
    this.pending = null;
  }

  private release(track: Track): void {
    if (!this.tracks.delete(track)) return;
    track.cleanup();
    this.ambient.delete(track); this.accents.delete(track);
    if (this.primary === track) this.primary = null;
    track.audio.pause(); track.audio.removeAttribute('src'); track.audio.load();
  }

  private clear(): void {
    this.generation++;
    this.cancelTimer();
    for (const track of [...this.tracks]) this.release(track);
  }

  private finish(status: 'completed' | 'failed' | 'skipped'): void {
    this.clear();
    this.state = { ...this.state, status, cue: null };
    this.changed(this.getSnapshot());
  }
}
