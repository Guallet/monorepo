// Learn more https://docs.expo.dev/guides/monorepos
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { FileStore } = require('metro-cache');
const path = require('path');

const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const { withUnistylesConfig } = require('react-native-unistyles/metro');

const projectRoot = __dirname;
const config = getSentryExpoConfig(projectRoot, {
  autoWrapExpoRouterErrorBoundary: true,
});

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({
    root: path.join(projectRoot, 'node_modules', '.cache', 'metro'),
  }),
];

module.exports = withUnistylesConfig(wrapWithReanimatedMetroConfig(config));
