import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

/**
 * `public/` 里保留建模和参考资产，但生产环境只发布运行时真正需要的目录。
 * 以后新增运行时资产类型时，需要把对应根目录加到这里。
 */
const RUNTIME_PUBLIC_ASSET_ROOTS = [
  'models/characters',
  'renders',
  'scenes',
  'textures',
] as const;

async function prunePublicAssets(outDir: string): Promise<void> {
  const assetsDir = resolve(outDir, 'assets');
  const entries = await readdir(assetsDir, { withFileTypes: true }).catch(() => null);
  if (!entries) {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const isKeptRoot = RUNTIME_PUBLIC_ASSET_ROOTS.some(
      (root) => root === entry.name || root.startsWith(`${entry.name}/`),
    );
    if (!isKeptRoot) {
      await rm(resolve(assetsDir, entry.name), { recursive: true, force: true });
    }
  }

  // `models` 本身保留，但只发布其中的角色模型。
  const modelsDir = resolve(assetsDir, 'models');
  const modelEntries = await readdir(modelsDir, { withFileTypes: true }).catch(() => null);
  if (!modelEntries) {
    return;
  }
  for (const entry of modelEntries) {
    if (entry.isDirectory() && entry.name !== 'characters') {
      await rm(resolve(modelsDir, entry.name), { recursive: true, force: true });
    }
  }
}

function prunePublicAssetsPlugin(): Plugin {
  let outDir = '';

  return {
    name: 'prune-public-assets',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await prunePublicAssets(outDir);
    },
  };
}

export default defineConfig({
  plugins: [react(), prunePublicAssetsPlugin()],
  build: {
    target: 'es2022',
    // 让 Vite 自己的哈希文件与 public/assets 分开，便于分别设置缓存策略。
    assetsDir: 'static',
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'playcanvas',
              test: /node_modules[\\/]playcanvas[\\/]/,
              priority: 20,
              includeDependenciesRecursively: false,
            },
            {
              name: 'react-vendor',
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              priority: 10,
              includeDependenciesRecursively: false,
            },
            {
              name: 'vendor',
              test: /node_modules[\\/]/,
              priority: 1,
              minSize: 20 * 1024,
              includeDependenciesRecursively: false,
            },
          ],
        },
      },
    },
  },
});
