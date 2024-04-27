const IS_DEV = process.env.APP_VARIANT === "development";

export default {
  name: IS_DEV ? "Guallet Dev" : "Guallet",
  owner: "guallet",
  slug: "guallet",
  version: "0.0.1",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "guallet",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_DEV ? "io.guallet.mobile.dev" : "io.guallet.mobile",
    googleServicesFile: "./auth/firebase/GoogleService-Info.plist",
  },
  android: {
    package: IS_DEV ? "io.guallet.mobile.dev" : "io.guallet.mobile",
    googleServicesFile: "./auth/firebase/google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: IS_DEV ? "#ececec" : "#ffffff",
    },
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "guallet.io",
            pathPrefix: "/",
            pathPattern: ".*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "@react-native-google-signin/google-signin",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "4933c830-42b4-4f94-b2f7-a4ee70331431",
    },
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/4933c830-42b4-4f94-b2f7-a4ee70331431",
  },
};
