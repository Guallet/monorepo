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
  // Enable logs to be sent to Sentry
  // Learn more at https://docs.sentry.io/platforms/react-native/logs/
  enableLogs: true,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  // Learn more at
  // https://docs.sentry.io/platforms/react-native/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,
  // profilesSampleRate is relative to tracesSampleRate.
  // Here, we'll capture profiles for 100% of transactions.
  profilesSampleRate: 1.0,
  // Record session replays for 100% of errors and 10% of sessions
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
