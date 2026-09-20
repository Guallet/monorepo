import 'react-native-reanimated';
import '../libs/sentry';

import * as Sentry from '@sentry/react-native';

import { GualletApp } from '@/components/GualletApp';
import { initAnalytics } from '@/utils/analytics';

initAnalytics();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayout() {
  return <GualletApp />;
}

export default Sentry.wrap(RootLayout);
