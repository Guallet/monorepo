import 'react-native-reanimated';

import * as Sentry from '@sentry/react-native';

import { GualletApp } from '@/components/GualletApp';
import { initAnalytics } from '@/utils/analytics';

console.log('Running app with config:', {
  isDev: __DEV__,
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: __DEV__,
  sendDefaultPii: true,
  enabled: !__DEV__,
});

initAnalytics();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayout() {
  return <GualletApp />;
}

export default Sentry.wrap(RootLayout);
