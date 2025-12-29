import 'react-native-reanimated';

import * as Sentry from '@sentry/react-native';

import { GualletApp } from '@/components/GualletApp';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: false,
  sendDefaultPii: true,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayout() {
  return <GualletApp />;
}

export default Sentry.wrap(RootLayout);
