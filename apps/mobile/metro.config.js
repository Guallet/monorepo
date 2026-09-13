// Learn more https://docs.expo.dev/guides/monorepos
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { FileStore } = require('metro-cache');
const path = require('path');

const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const projectRoot = __dirname;
const config = getSentryExpoConfig(projectRoot);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({
    root: path.join(projectRoot, 'node_modules', '.cache', 'metro'),
  }),
];

module.exports = wrapWithReanimatedMetroConfig(config);
