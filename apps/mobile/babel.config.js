module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      //This reanimated plugin needs to be listed last
      "react-native-reanimated/plugin",
    ],
  };
};
