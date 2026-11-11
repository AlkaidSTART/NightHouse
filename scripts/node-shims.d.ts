// 导出脚本用 Node 直接运行，项目没有安装 @types/node。
// 这里只声明脚本实际用到的最小接口，避免为此新增依赖。

declare module 'node:fs' {
  export function readFileSync(path: string): Uint8Array;
  export function writeFileSync(path: string, data: Uint8Array): void;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
}

declare module 'node:path' {
  export function resolve(...segments: string[]): string;
  export function dirname(path: string): string;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}
