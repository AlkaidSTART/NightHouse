// 测试用 Node 内置的 `node --test` 运行，项目没有安装 @types/node。
// 这里只声明测试实际用到的最小接口，避免为此新增依赖。

declare module 'node:test' {
  export function test(name: string, fn: () => void | Promise<void>): void;
}

declare module 'node:assert/strict' {
  interface Assert {
    (value: unknown, message?: string): asserts value;
    ok(value: unknown, message?: string): asserts value;
    equal(actual: unknown, expected: unknown, message?: string): void;
    notEqual(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    throws(fn: () => unknown, message?: string): void;
    rejects(
      promise: Promise<unknown> | (() => Promise<unknown>),
      error?: RegExp | ErrorConstructor,
      message?: string,
    ): Promise<void>;
  }
  const assert: Assert;
  export default assert;
}
