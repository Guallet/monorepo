import { isRunningInExpoGo } from 'expo';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: __DEV__,
  sendDefaultPii: true,
  enabled: !__DEV__,
  integrations: [
    Sentry.expoRouterIntegration({
      enableTimeToInitialDisplay: !isRunningInExpoGo(),
    }),
  ],
  enableNativeFramesTracking: !isRunningInExpoGo(),
});
