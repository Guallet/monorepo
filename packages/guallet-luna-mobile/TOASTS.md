# Toast notifications

Luna mobile uses `sonner-native` internally with a custom themed card. Import
notifications from `@guallet/luna-mobile` so they respect Luna bottom sheets.

## App setup

Mount one `ToastProvider` beneath `LunaProvider`, `SafeAreaProvider`, and
`GestureHandlerRootView`. The mobile app already has this setup.

```tsx
import { LunaProvider, ToastProvider } from '@guallet/luna-mobile';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
  return (
    <LunaProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ToastProvider>
            <AppNavigation />
          </ToastProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </LunaProvider>
  );
}
```

Install the provider's React Native peer dependencies in the consuming app:
Gesture Handler, Reanimated, Safe Area Context, Screens, SVG, and Worklets.
The Guallet mobile app already declares these dependencies.

## Messages and actions

```tsx
import { useToast } from '@guallet/luna-mobile';

function useActionFeedback() {
  const toast = useToast();

  return {
    saved: () => toast.success('Account saved'),
    failed: () =>
      toast.error('Could not save account', {
        description: 'Please try again.',
      }),
    offline: () => toast.warning('You are offline'),
    ready: () => toast.info('Export ready', { duration: 6000 }),
    deleted: (restore: () => void) =>
      toast.info('Transaction deleted', {
        action: { label: 'Undo', onPress: restore },
      }),
  };
}
```

Messages appear at the top, beneath the safe area. They remain visible for four
seconds, or eight seconds when they have an action. `duration` overrides this
in milliseconds. A close button and upward swipe dismiss the notification.
The action dismisses its notification before calling `onPress`.

Only one notification is shown at a time; additional messages wait in order.
Text scales with system settings and notifications support screen readers.
Animations respect reduced motion; visible timers pause in the background.

## Dismissal and native sheets

Every creation method returns a `ToastId`. Inside a component using `useToast`:

```tsx
const id = toast.info('Export ready');
toast.dismiss(id); // Remove a visible or queued notification.
toast.dismiss(); // Clear all visible and queued notifications.
```

Luna `BottomSheet` automatically holds notifications until its native content
finishes dismissing. No toast-specific props or changes to callers are needed.
If a sheet opens while a notification is visible, that notification returns to
the front of the queue and receives its full duration when displayed again.
Multiple sheets must all close before the queue resumes. Unmounting a sheet
also releases its hold.

Use Luna alerts for confirmations. Toast deferral covers Luna bottom sheets;
it does not automatically track arbitrary native modals or alert dialogs.
Loading and promise notifications are not part of this API.
