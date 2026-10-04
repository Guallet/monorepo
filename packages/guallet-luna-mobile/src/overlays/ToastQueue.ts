import type { ToastId, ToastOptions, ToastVariant } from './toast.types';

export interface ToastMessage extends ToastOptions {
  id: ToastId;
  title: string;
  variant: ToastVariant;
}

export interface PresentedToast {
  message: ToastMessage;
  /** Separates resumed presentations from stale Sonner callbacks. */
  generation: number;
}

/** Luna owns ordering and sheet deferral; Sonner owns visible toast lifetimes. */
export class ToastQueue {
  private pending: ToastMessage[] = [];
  private active: PresentedToast | null = null;
  private sheets = new Set<string>();
  private listeners = new Set<() => void>();
  private nextId = 0;
  private generation = 0;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.active;

  enqueue(
    variant: ToastVariant,
    title: string,
    options?: ToastOptions,
  ): ToastId {
    const id = `luna-toast-${++this.nextId}`;
    this.pending.push({ ...options, id, title, variant });
    this.advance();
    return id;
  }

  dismiss = (id?: ToastId) => {
    this.pending = id ? this.pending.filter((toast) => toast.id !== id) : [];
    if (this.active && (!id || this.active.message.id === id)) {
      this.active = null;
      this.advance();
      this.emit();
    }
  };

  finish(id: ToastId, generation: number) {
    if (
      this.active?.message.id !== id ||
      this.active.generation !== generation
    ) {
      return;
    }
    this.dismiss(id);
  }

  runAction(id: ToastId, generation: number, dismissPresentation?: () => void) {
    if (
      this.active?.message.id !== id ||
      this.active.generation !== generation
    ) {
      return;
    }
    const action = this.active.message.action;
    this.dismiss(id);
    dismissPresentation?.();
    action?.onPress();
  }

  block(sheetId: string) {
    if (this.sheets.has(sheetId)) return;
    this.sheets.add(sheetId);
    if (this.active) {
      this.pending.unshift(this.active.message);
      this.active = null;
      this.emit();
    }
  }

  release(sheetId: string) {
    if (!this.sheets.delete(sheetId)) return;
    this.advance();
  }

  private advance() {
    if (this.active || this.sheets.size > 0) return;
    const message = this.pending.shift();
    if (!message) return;
    this.active = { message, generation: ++this.generation };
    this.emit();
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }
}
