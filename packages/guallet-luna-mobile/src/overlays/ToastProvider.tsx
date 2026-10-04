import {
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toaster, toast as sonnerToast } from 'sonner-native';
import { useTheme, useThemeMode } from '../theme';
import { ToastCard } from './ToastCard';
import { ToastQueueContext } from './ToastContext';
import { ToastQueue } from './ToastQueue';
import type { LunaToast, ToastOptions, ToastVariant } from './toast.types';

/** Mount once beneath Luna, SafeAreaProvider and GestureHandlerRootView. */
export function ToastProvider({ children }: Readonly<PropsWithChildren>) {
  const [queue] = useState(() => new ToastQueue());
  return (
    <ToastQueueContext.Provider value={queue}>
      {children}
      <ToastHost queue={queue} />
    </ToastQueueContext.Provider>
  );
}

function ToastHost({ queue }: Readonly<{ queue: ToastQueue }>) {
  const active = useSyncExternalStore(
    queue.subscribe,
    queue.getSnapshot,
    queue.getSnapshot,
  );
  const channel = useId();
  const { spacing } = useTheme();
  const mode = useThemeMode();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!active || queue.getSnapshot() !== active) return;
    const { message, generation } = active;
    const presentationId = `${channel}-${message.id}-${generation}`;
    let presenting = true;
    const finish = () => {
      if (presenting) queue.finish(message.id, generation);
    };
    sonnerToast.custom(
      <ToastCard
        message={message}
        onDismiss={finish}
        onAction={() =>
          queue.runAction(message.id, generation, () => {
            sonnerToast.dismiss(presentationId);
          })
        }
      />,
      {
        id: presentationId,
        toasterId: channel,
        duration: message.duration ?? (message.action ? 8000 : 4000),
        onDismiss: finish,
        onAutoClose: finish,
      },
    );
    return () => {
      // Sonner also invokes lifetime callbacks for imperative dismissal.
      // Cleanup (including Strict Mode replay) must not consume the queue.
      presenting = false;
      sonnerToast.dismiss(presentationId);
    };
  }, [active, channel, queue]);

  return (
    <Toaster
      id={channel}
      theme={mode}
      position="top-center"
      offset={insets.top + spacing.sm}
      visibleToasts={1}
      enableStacking={false}
      swipeToDismissDirection="up"
      pauseWhenPageIsHidden
      allowFontScaling
      animation={{ enter: FadeIn.duration(200), exit: FadeOut.duration(200) }}
      positionerStyle={{
        paddingLeft: insets.left + spacing.md,
        paddingRight: insets.right + spacing.md,
      }}
    />
  );
}

/** All app notifications go through Luna so sheet deferral cannot be bypassed. */
export function useToast(): LunaToast {
  const queue = useContext(ToastQueueContext);
  const api = useMemo(() => {
    if (!queue) return null;
    const show =
      (variant: ToastVariant) => (title: string, options?: ToastOptions) =>
        queue.enqueue(variant, title, options);
    return {
      success: show('success'),
      error: show('error'),
      warning: show('warning'),
      info: show('info'),
      dismiss: queue.dismiss,
    };
  }, [queue]);
  if (!api) throw new Error('useToast must be used within a ToastProvider');
  return api;
}
