import { router } from '@/router';
import * as Sentry from '@sentry/react';

function isSentryEnabled() {
  return import.meta.env.VITE_SENTRY_ENABLED === 'true' && !import.meta.env.DEV;
}

export function initSentry() {
  if (globalThis.window === undefined || !isSentryEnabled()) {
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    enabled: true,
    debug: import.meta.env.DEV,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.tanstackRouterBrowserTracingIntegration(router),
    ],
    // Performance Monitoring
    // For finer control of sent transactions you can adjust this value, or use tracesSampler
    tracesSampleRate: 1,
    // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
    tracePropagationTargets: [/^https:\/\/app\.guallet\.io/],

    // Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1, // Always record sessions with errors
  });
}
