// 导出脚本与 Vite 配置由 Node 直接运行，项目没有安装 @types/node。
// 这里只声明实际用到的最小接口，避免为此新增依赖。

declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function readFileSync(path: string): Uint8Array;
  export function writeFileSync(path: string, data: Uint8Array | string): void;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function cpSync(
    source: string,
    destination: string,
    options?: { recursive?: boolean },
  ): void;
  export function rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void;
  export function existsSync(path: string): boolean;
  export function mkdtempSync(prefix: string): string;
  export interface DirentLike {
    name: string;
    isDirectory(): boolean;
  }
  export function readdirSync(path: string, options: { withFileTypes: true }): DirentLike[];
  export function statSync(path: string): { size: number };
}

declare module 'node:os' {
  export function tmpdir(): string;
}

declare module 'node:fs/promises' {
  interface DirentLike {
    name: string;
    isDirectory(): boolean;
  }

  export function readdir(
    path: string,
    options: { withFileTypes: true },
  ): Promise<DirentLike[]>;
  export function rm(
    path: string,
    options?: { recursive?: boolean; force?: boolean },
  ): Promise<void>;
}

declare module 'node:path' {
  export function resolve(...segments: string[]): string;
  export function dirname(path: string): string;
  export function join(...segments: string[]): string;
  export function relative(from: string, to: string): string;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}

declare module 'node:child_process' {
  export function execFileSync(
    file: string,
    args?: readonly string[],
    options?: { encoding?: 'utf8' },
  ): string;
}
