import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DialoguePointerLockRestore } from '../src/game/core/dialoguePointerLockRestore.ts';

function createFixture() {
  let requests = 0;
  const restore = new DialoguePointerLockRestore(() => { requests += 1; });
  return { restore, requests: () => requests };
}

test('ESC 退出对话后等待松键再恢复鼠标锁定', () => {
  const fixture = createFixture();
  fixture.restore.holdEscape();
  fixture.restore.restore();
  assert.equal(fixture.requests(), 0);
  assert.equal(fixture.restore.active, true);
  fixture.restore.releaseEscape();
  assert.equal(fixture.requests(), 1);
  fixture.restore.releaseEscape();
  assert.equal(fixture.requests(), 1);
});

test('恢复期间的解锁通知不触发暂停，成功锁定后恢复正常暂停行为', () => {
  const fixture = createFixture();
  assert.equal(fixture.restore.handlePointerLockChange(false), false);
  fixture.restore.holdEscape();
  fixture.restore.restore();
  assert.equal(fixture.restore.handlePointerLockChange(false), true);
  fixture.restore.releaseEscape();
  assert.equal(fixture.restore.handlePointerLockChange(false), true);
  assert.equal(fixture.restore.handlePointerLockChange(true), false);
  assert.equal(fixture.restore.active, false);
  assert.equal(fixture.restore.handlePointerLockChange(false), false);
});

test('点击结束交谈时立即恢复锁定', () => {
  const fixture = createFixture();
  fixture.restore.restore();
  assert.equal(fixture.requests(), 1);
});

test('恢复被浏览器拒绝后仍可点击重试', () => {
  const fixture = createFixture();
  fixture.restore.holdEscape();
  fixture.restore.restore();
  fixture.restore.releaseEscape();
  assert.equal(fixture.restore.active, true);
  fixture.restore.restore();
  assert.equal(fixture.requests(), 2);
  fixture.restore.handlePointerLockChange(true);
  assert.equal(fixture.restore.active, false);
});

test('取消恢复后不再屏蔽暂停，也不因松开 ESC 发起过期请求', () => {
  const fixture = createFixture();
  fixture.restore.holdEscape();
  fixture.restore.restore();
  fixture.restore.cancel();
  fixture.restore.releaseEscape();
  assert.equal(fixture.requests(), 0);
  assert.equal(fixture.restore.active, false);
  assert.equal(fixture.restore.handlePointerLockChange(false), false);
  fixture.restore.restore();
  assert.equal(fixture.requests(), 1);
});
