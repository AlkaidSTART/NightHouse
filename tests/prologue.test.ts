import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prologue } from '../src/content/prologue.ts';

test('序章交代开场必须的四件事', () => {
  // 依据故事线文档 §1.4：来意、午夜、不能走、警惕。
  const labels = prologue.facts.map((fact) => fact.label);
  assert.deepEqual(labels, [
    '你为什么来',
    '为什么必须是午夜',
    '为什么不能走',
    '为什么警惕',
  ]);

  for (const fact of prologue.facts) {
    assert.ok(fact.text.trim().length > 0, `${fact.label} 缺少正文`);
  }
});

test('序章先给出大目标，再提供信件与进入按钮', () => {
  assert.ok(prologue.lead.length > 0, '缺少开场背景');
  assert.ok(prologue.goal.trim().length > 0, '缺少大目标');
  assert.ok(prologue.letter.paragraphs.length > 0, '缺少信件正文');
  assert.ok(prologue.letter.signature.trim().length > 0, '缺少署名');
  assert.ok(prologue.startLabel.trim().length > 0, '缺少按钮文案');
});
