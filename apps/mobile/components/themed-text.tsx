import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme, useThemeMode } from '@guallet/ui-react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { colors, typography } = useTheme();
  const mode = useThemeMode();
  const appearanceColor = mode === 'dark' ? darkColor : lightColor;
  const textColor =
    appearanceColor ??
    (type === 'link' ? colors.accent.primary : colors.text.primary);
  let fontSize = typography.sizes.md;
  if (type === 'title') {
    fontSize = typography.sizes.xxl;
  } else if (type === 'subtitle') {
    fontSize = typography.sizes.lg;
  }

  return (
    <Text
      style={[
        {
          color: textColor,
          fontSize,
        },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {},
  defaultSemiBold: {
    fontWeight: '600',
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontWeight: 'bold',
  },
  link: {},
});
