import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const GOOGLE_SERVICES_FILE = process.env.GOOGLE_SERVICES_JSON;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? 'Guallet (Dev)' : 'Guallet',
  owner: 'guallet',
  slug: 'guallet',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'guallet',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_DEV ? 'io.guallet.mobile.dev' : 'io.guallet.mobile',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    // TODO: enable once we have the icons
    // adaptiveIcon: {
    //   backgroundColor: "#E6F4FE",
    //   foregroundImage: "./assets/images/android-icon-foreground.png",
    //   backgroundImage: "./assets/images/android-icon-background.png",
    //   monochromeImage: "./assets/images/android-icon-monochrome.png",
    // },
    predictiveBackGestureEnabled: false,
    package: IS_DEV ? 'io.guallet.mobile.dev' : 'io.guallet.mobile',
    ...(GOOGLE_SERVICES_FILE
      ? { googleServicesFile: GOOGLE_SERVICES_FILE }
      : {}),
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-build-properties',
      {
        ios: {
          enableSceneSupport: true,
        },
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        // Native splash fallback colors are outside the runtime theme.
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    'react-native-email-link',
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        // 'Use SENTRY_AUTH_TOKEN env to authenticate with Sentry.',
        project: 'react-native',
        organization: 'guallet',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  updates: {
    url: 'https://u.expo.dev/4933c830-42b4-4f94-b2f7-a4ee70331431',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  extra: {
    router: {},
    eas: {
      projectId: '4933c830-42b4-4f94-b2f7-a4ee70331431',
    },
  },
});
