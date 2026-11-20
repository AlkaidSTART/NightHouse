#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { endingVoiceCatalogPlugin } from '../vite.config.ts';

const runId = process.argv[2] ?? 'browser_01';
assert.match(runId, /^[a-z0-9_-]+$/);
const output = resolve(`assets/audio/vo/vo_ending/samples/${runId}`);
if (existsSync(resolve(output, 'result.json'))) throw new Error('测试批次已存在，请使用新的批次名称保留首测证据。');
mkdirSync(output, { recursive: true });
await build({ configFile: false, plugins: [react(), endingVoiceCatalogPlugin()], define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: { outDir: output, emptyOutDir: false, lib: { entry: resolve('tests/browser/endingHarness.tsx'), name: 'EndingHarness', formats: ['iife'], fileName: () => 'harness.js', cssFileName: 'harness' } } });
writeFileSync(resolve(output, 'index.html'), `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>结局音频回归</title><link rel="stylesheet" href="harness.css"></head><body data-project-root="${pathToFileURL(process.cwd()).href}"><div id="root"></div><pre id="results" style="position:relative;z-index:100;font-size:12px"></pre><script src="harness.js"></script></body></html>`);
const chrome = process.env.CHROME_BINARY ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
assert.ok(existsSync(chrome), '找不到 Chrome，请设置 CHROME_BINARY');
const profile = mkdtempSync(resolve(tmpdir(), 'nighthouse-ending-browser-'));
const child = spawn(chrome, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--mute-audio', '--allow-file-access-from-files', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--window-size=1280,960', 'about:blank'], { stdio: 'ignore', windowsHide: true });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;
try {
  const portFile = resolve(profile, 'DevToolsActivePort');
  for (let attempt = 0; attempt < 100 && !existsSync(portFile); attempt++) await wait(100);
  assert.ok(existsSync(portFile), 'Chrome 调试接口未就绪');
  const port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = pages.find((entry) => entry.type === 'page'); assert.ok(page);
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result);
  });
  function send(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  }
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: pathToFileURL(resolve(output, 'index.html')).href });
  let complete = false;
  for (let attempt = 0; attempt < 150; attempt++) {
    const state = await send('Runtime.evaluate', { expression: 'document.body?.dataset.complete', returnByValue: true });
    if (state.result.value) { complete = true; break; }
    await wait(200);
  }
  const dom = await send('Runtime.evaluate', { expression: 'document.documentElement.outerHTML', returnByValue: true });
  writeFileSync(resolve(output, 'dom.html'), dom.result.value ?? '');
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(resolve(output, 'ending.png'), Buffer.from(screenshot.data, 'base64'));
  assert.ok(complete, '浏览器未在 30 秒内完成');
  const json = await send('Runtime.evaluate', { expression: 'document.getElementById("results").textContent', returnByValue: true });
  const report = JSON.parse(json.result.value);
  writeFileSync(resolve(output, 'result.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ output, ...report }, null, 2));
  assert.equal(report.failed, 0, '浏览器存在失败项，保留证据后复核');
  assert.equal(report.passed, 8);
} finally {
  socket?.close();
  child.kill();
}
