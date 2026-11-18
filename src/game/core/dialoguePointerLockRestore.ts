export class DialoguePointerLockRestore {
  private pending = false;
  private escapeHeld = false;
  private readonly requestLock: () => void;

  constructor(requestLock: () => void) {
    this.requestLock = requestLock;
  }

  get active(): boolean {
    return this.pending;
  }

  holdEscape(): void {
    this.escapeHeld = true;
  }

  restore(): void {
    this.pending = true;
    // 用 ESC 退出时浏览器会短暂拒绝重新锁定，立刻请求只会失败并弹出暂停菜单；
    // 因此等到松开 ESC 再请求，失败时由调用方提示点击画面。
    if (!this.escapeHeld) {
      this.requestLock();
    }
  }

  retry(): void {
    this.escapeHeld = false;
    this.restore();
  }

  releaseEscape(): void {
    if (!this.escapeHeld) {
      return;
    }
    this.escapeHeld = false;
    if (this.pending) {
      this.requestLock();
    }
  }

  handlePointerLockChange(locked: boolean): boolean {
    if (locked) {
      this.cancel();
      return false;
    }
    // ESC 的默认解锁通知可能晚于对话关闭；恢复完成前不能把它当作暂停。
    return this.pending;
  }

  cancel(): void {
    this.pending = false;
    this.escapeHeld = false;
  }
}
