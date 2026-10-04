import { useContext, useLayoutEffect } from 'react';
import { ToastQueueContext } from './ToastContext';

/** Expo unmounts hosted sheet content only after native dismissal finishes. */
export function SheetToastPresence({ sheetId }: Readonly<{ sheetId: string }>) {
  const queue = useContext(ToastQueueContext);
  useLayoutEffect(() => {
    queue?.block(sheetId);
    return () => queue?.release(sheetId);
  }, [queue, sheetId]);
  return null;
}
