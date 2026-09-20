import { View, type ViewProps } from 'react-native';

import { useTheme, useThemeMode } from '@guallet/luna-mobile';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const { colors } = useTheme();
  const mode = useThemeMode();
  const backgroundColor =
    mode === 'dark'
      ? (darkColor ?? colors.surface.background.primary)
      : (lightColor ?? colors.surface.background.primary);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
