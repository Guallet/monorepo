import type { ToastOptions, ToastVariant } from './toast.types';

export interface ToastMessage extends ToastOptions {
  id: string;
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
  private readonly sheets = new Set<string>();
  private readonly listeners = new Set<() => void>();
  private foreground: boolean;

  constructor(foreground = true) {
    this.foreground = foreground;
  }

  /** Hide and defer messages whenever the app is not active. */
  setForeground(foreground: boolean) {
    if (this.foreground === foreground) return;
    this.foreground = foreground;
    if (!foreground && this.active) {
      this.pending.unshift(this.active.message);
      this.active = null;
      this.emit();
    }
    if (foreground) this.advance();
  }

  private nextId = 0;
  private generation = 0;

  /** Subscribe to presentation changes; returns an unsubscribe callback. */
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Read the stable presentation snapshot for useSyncExternalStore. */
  getSnapshot = () => this.active;

  /** Append a notification and return its ID, even when sheets defer it. */
  enqueue(
    variant: ToastVariant,
    title: string,
    options?: ToastOptions,
  ): string {
    const id = `luna-toast-${++this.nextId}`;
    this.pending.push({ ...options, id, title, variant });
    this.advance();
    return id;
  }

  /** Remove a visible or queued notification, or clear all when ID is absent. */
  dismiss = (id?: string) => {
    this.pending = id ? this.pending.filter((toast) => toast.id !== id) : [];
    if (this.active && (!id || this.active.message.id === id)) {
      this.active = null;
      this.advance();
      this.emit();
    }
  };

  /** Complete only the current presentation, ignoring stale callbacks. */
  finish(id: string, generation: number) {
    if (
      this.active?.message.id !== id ||
      this.active.generation !== generation
    ) {
      return;
    }
    this.dismiss(id);
  }

  /** Remove the notification and presentation before invoking its action. */
  runAction(id: string, generation: number, dismissPresentation?: () => void) {
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

  /** Hold presentation for a sheet, returning an active toast to the queue. */
  block(sheetId: string) {
    if (this.sheets.has(sheetId)) return;
    this.sheets.add(sheetId);
    if (this.active) {
      this.pending.unshift(this.active.message);
      this.active = null;
      this.emit();
    }
  }

  /** Release a sheet hold and resume only when every sheet has closed. */
  release(sheetId: string) {
    if (!this.sheets.delete(sheetId)) return;
    this.advance();
  }

  /** Present the next queued notification if no toast or sheet is active. */
  private advance() {
    if (!this.foreground || this.active || this.sheets.size > 0) return;
    const message = this.pending.shift();
    if (!message) return;
    this.active = { message, generation: ++this.generation };
    this.emit();
  }

  /** Notify subscribers after the visible presentation changes. */
  private emit() {
    for (const listener of this.listeners) listener();
  }
}
