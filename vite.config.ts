import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { EMPTY_VOICE_CATALOG, parseEndingVoiceCatalog } from './src/content/endingVoiceCatalogData.ts';

/**
 * `public/` 里保留建模和参考资产，但生产环境只发布运行时真正需要的目录。
 * 以后新增运行时资产类型时，需要把对应根目录加到这里。
 */
export const RUNTIME_PUBLIC_ASSET_ROOTS = [
  'audio',
  'models/characters',
  'renders',
  'scenes',
  'textures',
] as const;

/** `public/` 内的相对路径是否会被发布；音频、角色模型等运行时资源必须在白名单内。 */
export function isRuntimePublicAssetKept(relativePath: string): boolean {
  return RUNTIME_PUBLIC_ASSET_ROOTS.some(
    (root) => relativePath === root || relativePath.startsWith(`${root}/`),
  );
}

const VOICE_CATALOG_ID = 'virtual:ending-voice-catalog';
const RESOLVED_VOICE_CATALOG_ID = `\0${VOICE_CATALOG_ID}`;

/**
 * 结局旁白只在本机可用：`endingVoiceCatalog.local.json` 被忽略，不随公开仓库分发。
 * 公开构建缺少该文件时注入空目录，结局退化为完整字幕加原创音效。
 */
export function endingVoiceCatalogPlugin(): Plugin {
  const catalogFile = fileURLToPath(new URL('./endingVoiceCatalog.local.json', import.meta.url));
  const readCatalog = () => {
    if (!existsSync(catalogFile)) return EMPTY_VOICE_CATALOG;
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(catalogFile, 'utf8'));
    } catch (error) {
      throw new Error(`endingVoiceCatalog.local.json 不是合法 JSON：${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
    try {
      return parseEndingVoiceCatalog(data);
    } catch (error) {
      throw new Error(`endingVoiceCatalog.local.json 校验失败：${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
  };

  return {
    name: 'ending-voice-catalog',
    resolveId(source) {
      return source === VOICE_CATALOG_ID ? RESOLVED_VOICE_CATALOG_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_VOICE_CATALOG_ID) return null;
      return `export default ${JSON.stringify(readCatalog())};`;
    },
    configureServer(server) {
      server.watcher.add(catalogFile);
      server.watcher.on('change', (file) => {
        if (resolve(file) !== catalogFile) return;
        const module = server.moduleGraph.getModuleById(RESOLVED_VOICE_CATALOG_ID);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

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
  plugins: [react(), endingVoiceCatalogPlugin(), prunePublicAssetsPlugin()],
  server: {
    host: '127.0.0.1',
  },
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
