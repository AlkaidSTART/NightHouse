import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import { buildVillaGlb } from './villaGlb.ts';

// 用法：npm run export:glb
// 贴图 URL 以 /assets/ 开头，对应 public/ 下的文件；导出的 GLB 内嵌贴图，可独立使用。
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'public/assets/scenes/scene_villa_full.glb');

const glb = buildVillaGlb(villaGreybox, (url) => {
  if (!url.startsWith('/assets/')) {
    throw new Error(`不支持的贴图路径：${url}`);
  }
  return readFileSync(resolve(root, 'public', url.slice(1)));
});

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, glb);
console.log(`已导出 ${output}（${(glb.byteLength / 1024 / 1024).toFixed(2)} MB）`);
