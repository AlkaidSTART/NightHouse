import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { EndingOverlay } from '../../src/ui/ending/EndingOverlay';
import { presentEnding } from '../../src/content/endings';
import { hasLocalVoiceClips, localVoiceCatalog } from '../../src/content/endingVoiceCatalog';
import effects from '../../src/content/endingAudioAssets.json';
import { useStoryStore } from '../../src/stores/storyStore';
import { DEFAULT_SETTINGS } from '../../src/game/save/defaults';
import type { StoryFlagValue } from '../../src/shared/types/content';
import '../../src/app/app.css';

const nativeAudio = window.Audio;
const fakeAudios: BrowserAudio[] = [];
let denyPlayback = false;
class BrowserAudio extends EventTarget {
  volume = 1;
  loop = false;
  preload = '';
  paused = false;
  released = false;
  constructor(readonlyUrl: string) { super(); this.url = readonlyUrl; fakeAudios.push(this); }
  readonly url: string;
  play(): Promise<void> {
    if (denyPlayback) return Promise.reject(new Error('Test autoplay denied'));
    this.paused = false; this.dispatchEvent(new Event('playing')); return Promise.resolve();
  }
  pause(): void { this.paused = true; }
  load(): void {}
  removeAttribute(): void { this.released = true; }
}
Object.defineProperty(window, 'Audio', { configurable: true, value: BrowserAudio });
const container = document.getElementById('root');
if (!container) throw new Error('Missing harness root');
const root = createRoot(container);
const results: Array<{ id: string; actual: string; status: string }> = [];
const wait = (milliseconds = 50) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
function check(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
function click(text: string): void {
  const button = [...document.querySelectorAll('button')].find((element) => element.textContent?.includes(text));
  check(button, `找不到按钮 ${text}`); button.click();
}
let revision = 0;
async function render(id: string, flags: Record<string, StoryFlagValue> = {}, muted = false) {
  fakeAudios.length = 0;
  useStoryStore.setState({ storyFlags: flags, discoveredClueIds: [] });
  const view = presentEnding(id, flags); check(view, '无结局');
  let exited = false;
  flushSync(() => root.render(<EndingOverlay key={++revision} ending={view} settings={{ ...DEFAULT_SETTINGS, masterVolume: muted ? 0 : 0.7 }} onExit={() => { exited = true; }} />));
  await wait(150); return { view, exited: () => exited };
}
async function scenario(id: string, action: () => Promise<string>) {
  try { const actual = await action(); results.push({ id, actual, status: 'passed' }); }
  catch (error) { results.push({ id, actual: error instanceof Error ? error.message : String(error), status: 'failed' }); }
}
async function main() {
  const variants: Array<{ name: string; id: string; flags: Record<string, StoryFlagValue> }> = [
    { name: 'signed', id: 'ending_signed', flags: {} },
    { name: 'signed_evidence', id: 'ending_signed', flags: { 'clue.captains_log': true } },
    { name: 'weak', id: 'ending_refused', flags: {} },
    { name: 'strong', id: 'ending_refused', flags: { 'story.evidence_presented': true, 'clue.shipping_ledger': true, 'clue.insurance_policy': true } },
    { name: 'echo', id: 'ending_echo', flags: {} },
  ];
  for (const variant of variants) await scenario(`UI_${variant.name}`, async () => {
    const rendered = await render(variant.id, variant.flags);
    if (hasLocalVoiceClips) {
      check(!document.querySelector('[aria-label="调查总结"]'), '演出中提前出现总结');
      check(document.querySelector('[aria-current="true"]'), '没有高亮当前字幕');
      click('暂停旁白'); await wait(); check(fakeAudios.filter((audio) => !audio.released).every((audio) => audio.paused), '暂停仍在播放');
      click('继续旁白'); await wait();
      click('跳过旁白'); await wait(); check(document.querySelector('[aria-label="调查总结"]'), '跳过后未显示总结');
      check(fakeAudios.every((audio) => audio.released), '跳过后仍有音频资源');
      for (const paragraph of rendered.view.paragraphs) check(container?.textContent?.includes(paragraph), '缺少原结局段落');
      check(container?.textContent?.includes('你是伊芙琳的表亲'), '缺少共享回收');
      click('重播旁白'); await wait(); check(!document.querySelector('[aria-label="调查总结"]'), '重播未回到演出');
      click('跳过旁白'); await wait(); click('返回首页'); check(rendered.exited(), '未调用退出');
      return '共享字幕与分支正文齐全；高亮、暂停/继续、跳过、重播、退出通过';
    }
    // 公开版没有旁白：字幕与结算同步可用，只播放原创音效。
    check(document.querySelector('[aria-label="调查总结"]'), '无旁白时未显示总结');
    check(fakeAudios.every((audio) => !audio.url.includes('/vo/ending/')), '无旁白时仍请求了旁白');
    check(fakeAudios.some((audio) => audio.url.includes('/sfx/ending/')), '未播放原创音效');
    for (const paragraph of rendered.view.paragraphs) check(container?.textContent?.includes(paragraph), '缺少原结局段落');
    check(container?.textContent?.includes('你是伊芙琳的表亲'), '缺少共享回收');
    check(container?.textContent?.includes('旁白未随此版本提供'), '未说明旁白不可用');
    click('重播结局音效'); await wait(); check(document.querySelector('[aria-label="调查总结"]'), '重播后总结消失');
    click('返回首页'); check(rendered.exited(), '未调用退出');
    return '无旁白时完整字幕与结算立即可用；只请求原创音效';
  });
  await scenario('UI_failure', async () => {
    denyPlayback = true; await render('ending_echo'); await wait(600);
    if (hasLocalVoiceClips) {
      check(container?.textContent?.includes('旁白暂时无法播放'), '拒绝播放未反馈');
    } else {
      check(container?.textContent?.includes('旁白未随此版本提供'), '无旁白时未说明回退');
    }
    check(document.querySelector('[aria-label="调查总结"]'), '失败未释放结算');
    check(fakeAudios.every((audio) => audio.released), '失败后未释放音频');
    denyPlayback = false; return '模拟自动播放拒绝后全文与结算可用，无资源残留';
  });
  await scenario('UI_mute_cleanup', async () => {
    await render('ending_echo', {}, true);
    check(fakeAudios.filter((audio) => !audio.released).every((audio) => audio.volume === 0), '主静音未生效');
    root.render(<p>已退出</p>); await wait(); check(fakeAudios.every((audio) => audio.released), '卸载未清理');
    return '主音量零使所有轨道静音；卸载释放音频';
  });
  await scenario('CHROME_real_media', async () => {
    const base = document.body.dataset.projectRoot; check(base, '缺少根目录');
    const selected = [
      ...effects.effects,
      ...(hasLocalVoiceClips ? [localVoiceCatalog.clips.at(0), localVoiceCatalog.clips.at(-1)].filter((clip) => clip !== undefined) : []),
    ];
    for (const item of selected) {
      check(item, '缺少资产'); const audio = new nativeAudio(`${base}/public${item.url}`);
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`metadata timeout ${item.url}`)), 5000);
        audio.addEventListener('loadedmetadata', () => { clearTimeout(timer); resolve(); }, { once: true });
        audio.addEventListener('error', () => { clearTimeout(timer); reject(new Error(`decode failed ${item.url}`)); }, { once: true });
        audio.load();
      });
      check(Math.abs(audio.duration - item.durationSeconds) < 0.1, '浏览器音频时长不一致');
      audio.removeAttribute('src'); audio.load();
    }
    return `Chrome 原生媒体读取 ${selected.length} 份 OGG 的元数据与时长通过（${selected.length - effects.effects.length} 段旁白＋13 音效）`;
  });
  await render('ending_echo');
  const output = document.getElementById('results'); check(output, 'Missing results');
  output.textContent = JSON.stringify({ browser: navigator.userAgent, viewport: { width: innerWidth, height: innerHeight }, cases: results,
    passed: results.filter((item) => item.status === 'passed').length, failed: results.filter((item) => item.status === 'failed').length }, null, 2);
  document.body.dataset.complete = 'true';
}
void main().catch((error: unknown) => {
  const output = document.getElementById('results');
  if (output) output.textContent = JSON.stringify({ error: error instanceof Error ? error.message : String(error) });
  document.body.dataset.complete = 'error';
});
