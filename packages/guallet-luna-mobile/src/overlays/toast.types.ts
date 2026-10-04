export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastOptions {
  description?: string;
  /** Milliseconds on screen. Defaults to 4000, or 8000 with an action. */
  duration?: number;
  action?: ToastAction;
}

export interface LunaToast {
  success: (title: string, options?: ToastOptions) => string;
  error: (title: string, options?: ToastOptions) => string;
  warning: (title: string, options?: ToastOptions) => string;
  info: (title: string, options?: ToastOptions) => string;
  /** Omit the ID to clear both the visible toast and the queue. */
  dismiss: (id?: string) => void;
}
