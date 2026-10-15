import { createContext } from 'react';
import type { ToastQueue } from './ToastQueue';

// Optional for sheets: Luna components also work without a toast provider.
export const ToastQueueContext = createContext<ToastQueue | null>(null);
