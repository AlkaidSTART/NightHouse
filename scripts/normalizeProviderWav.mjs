import assert from 'node:assert/strict';

/** 百炼 PCM WAV 会保留流式占位长度；只修正已验证的标准 PCM 封装，保留原文件。 */
export function normalizeProviderWav(original) {
  assert.equal(original.toString('ascii', 0, 4), 'RIFF');
  assert.equal(original.toString('ascii', 8, 12), 'WAVE');
  assert.equal(original.toString('ascii', 12, 16), 'fmt ');
  assert.equal(original.readUInt32LE(16), 16);
  assert.equal(original.readUInt16LE(20), 1);
  assert.equal(original.readUInt16LE(22), 1);
  assert.equal(original.readUInt32LE(24), 24000);
  assert.equal(original.readUInt16LE(34), 16);
  assert.equal(original.toString('ascii', 36, 40), 'data');
  assert.equal((original.length - 44) % original.readUInt16LE(32), 0);
  const normalized = Buffer.from(original);
  normalized.writeUInt32LE(normalized.length - 8, 4);
  normalized.writeUInt32LE(normalized.length - 44, 40);
  return normalized;
}
