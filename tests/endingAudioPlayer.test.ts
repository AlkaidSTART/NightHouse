import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EndingAudioPlayer } from '../src/game/audio/EndingAudioPlayer.ts';
import type { EndingAudioEnvironment, EndingAudioHandle, EndingPlaybackState } from '../src/game/audio/EndingAudioPlayer.ts';
import type { EndingPerformance } from '../src/content/endingPerformance.ts';

class FakeAudio implements EndingAudioHandle {
  volume = 1;
  loop = false;
  preload = '';
  paused = false;
  released = false;
  plays = 0;
  reject: (() => void) | null = null;
  listeners = new Map<string, Set<() => void>>();
  readonly url: string;
  constructor(url: string) { this.url = url; }
  play(): Promise<void> {
    this.paused = false;
    this.plays++;
    this.emit('playing');
    return new Promise<void>((resolve, reject) => {
      this.reject = () => reject(new Error('Autoplay denied'));
      if (!this.url.includes('deferred')) resolve();
    });
  }
  pause(): void { this.paused = true; }
  load(): void {}
  removeAttribute(): void { this.released = true; }
  addEventListener(name: string, listener: () => void): void {
    const set = this.listeners.get(name) ?? new Set(); set.add(listener); this.listeners.set(name, set);
  }
  removeEventListener(name: string, listener: () => void): void { this.listeners.get(name)?.delete(listener); }
  emit(name: string): void { for (const listener of [...(this.listeners.get(name) ?? [])]) listener(); }
}

function fixture(performance?: EndingPerformance) {
  let now = 0;
  let id = 0;
  const timers = new Map<number, { at: number; fn: () => void }>();
  const audios: FakeAudio[] = [];
  const states: EndingPlaybackState[] = [];
  const environment: EndingAudioEnvironment = {
    audio: (url) => { const audio = new FakeAudio(url); audios.push(audio); return audio; },
    now: () => now,
    later: (fn, delay) => { const key = ++id; timers.set(key, { at: now + delay, fn }); return key; },
    cancel: (key) => { timers.delete(key); },
  };
  const data: EndingPerformance = performance ?? {
    paragraphs: [{ id: 'p1', text: '正文', section: 'ending' }], roomUrl: 'room.ogg', gramophoneUrl: null, voiceAvailable: true,
    steps: [
      { kind: 'voice', url: 'voice.ogg', paragraphId: 'p1', durationSeconds: 2, accentUrl: 'pen.ogg' },
      { kind: 'silence', milliseconds: 1000, quiet: true },
      { kind: 'effect', url: 'clock.ogg', durationSeconds: 3, gain: 0.5, label: '钟声' },
      { kind: 'silence', milliseconds: 2500, quiet: false },
    ],
  };
  const player = new EndingAudioPlayer(data, (state) => states.push(state), environment);
  const tick = (milliseconds: number): void => {
    const target = now + milliseconds;
    for (;;) {
      const next = [...timers].filter(([, item]) => item.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at; timers.delete(next[0]); next[1].fn();
    }
    now = target;
  };
  return { player, audios, states, timers, tick, audio: (url: string) => {
    const audio = [...audios].reverse().find((item) => item.url === url);
    assert.ok(audio, `Missing ${url}`); return audio;
  } };
}

function assertReleased(audios: FakeAudio[]): void {
  assert.ok(audios.every((audio) => audio.released && audio.paused));
  assert.ok(audios.every((audio) => [...audio.listeners.values()].every((listeners) => listeners.size === 0)));
}

test('结局按语音结束推进字幕；全静音一秒后钟声，余韵后才结算', () => {
  const f = fixture(); f.player.start();
  assert.equal(f.player.getSnapshot().paragraphId, 'p1');
  f.audio('voice.ogg').emit('ended');
  assert.equal(f.audio('room.ogg').volume, 0);
  f.tick(999); assert.equal(f.audios.some((audio) => audio.url === 'clock.ogg'), false);
  f.tick(1); assert.equal(f.audio('clock.ogg').plays, 1);
  f.audio('clock.ogg').emit('ended');
  assert.ok(f.audio('room.ogg').volume > 0);
  f.tick(2499); assert.equal(f.player.getSnapshot().status, 'playing');
  f.tick(1); assert.equal(f.player.getSnapshot().status, 'completed');
  assertReleased(f.audios); assert.equal(f.timers.size, 0);
});

test('暂停保留静默剩余时间，恢复不会跳过静默；播放暂停可恢复', () => {
  const f = fixture(); f.player.start(); f.player.pause();
  assert.ok(f.audios.every((audio) => audio.paused));
  f.tick(50000); assert.equal(f.player.getSnapshot().status, 'paused');
  f.player.resume(); assert.equal(f.audio('voice.ogg').plays, 2);
  f.audio('voice.ogg').emit('ended'); f.tick(300); f.player.pause(); f.tick(10000);
  f.player.resume(); f.tick(699);
  assert.equal(f.audios.some((audio) => audio.url === 'clock.ogg'), false);
  f.tick(1); assert.equal(f.audio('clock.ogg').plays, 1);
  f.player.dispose(); assertReleased(f.audios);
});

test('资源失败或超时立即全文回退，不逐条等待；音效失败仍可完成', () => {
  const f = fixture(); f.player.start(); f.audio('voice.ogg').emit('error');
  assert.equal(f.player.getSnapshot().status, 'failed'); assertReleased(f.audios);
  f.tick(100000); assert.equal(f.audios.some((audio) => audio.url === 'clock.ogg'), false);
  const timeout = fixture(); timeout.player.start(); timeout.tick(12000);
  assert.equal(timeout.player.getSnapshot().status, 'failed'); assertReleased(timeout.audios);
  const sfx = fixture(); sfx.player.start(); sfx.audio('voice.ogg').emit('ended'); sfx.tick(1000);
  sfx.audio('clock.ogg').emit('error'); sfx.tick(2500);
  assert.equal(sfx.player.getSnapshot().status, 'completed');
});

test('跳过、重复进入和卸载均释放所有轨道与计时器，旧结束事件无效', () => {
  const f = fixture(); f.player.start();
  const stale = [...(f.audio('voice.ogg').listeners.get('ended') ?? [])][0]; assert.ok(stale);
  f.player.skip(); assert.equal(f.player.getSnapshot().status, 'skipped'); assertReleased(f.audios);
  f.player.start(); stale(); assert.equal(f.player.getSnapshot().paragraphId, 'p1');
  assert.equal(f.audios.some((audio) => audio.url === 'clock.ogg'), false);
  f.player.dispose(); const count = f.states.length; f.tick(100000); f.player.start();
  assert.equal(f.states.length, count); assert.equal(f.timers.size, 0); assertReleased(f.audios);
});

test('主音量与分类音量相乘，静音仍可完成播放，非法音量收敛为零', () => {
  const f = fixture(); f.player.setVolumes(0.5, 0.6, 0.4); f.player.start();
  assert.equal(f.audio('voice.ogg').volume, 0.3);
  assert.ok(Math.abs(f.audio('room.ogg').volume - 0.04) < 1e-9);
  f.player.setVolumes(0, 1, 1); assert.ok(f.audios.every((audio) => audio.volume === 0));
  f.player.setVolumes(NaN, 1, 1); assert.ok(f.audios.every((audio) => audio.volume === 0));
  f.player.skip(); assertReleased(f.audios);
});

test('过期的 autoplay reject 不会终止新一轮播放，当前拒绝可全文回退', async () => {
  const f = fixture({ paragraphs: [], roomUrl: 'room.ogg', gramophoneUrl: null, voiceAvailable: true,
    steps: [{ kind: 'voice', url: 'deferred.ogg', paragraphId: 'p1', durationSeconds: 2 }] });
  f.player.start(); const old = f.audio('deferred.ogg'); f.player.start(); old.reject?.(); await Promise.resolve();
  assert.equal(f.player.getSnapshot().status, 'playing');
  f.audio('deferred.ogg').reject?.(); await Promise.resolve();
  assert.equal(f.player.getSnapshot().status, 'failed'); assertReleased(f.audios);
});
