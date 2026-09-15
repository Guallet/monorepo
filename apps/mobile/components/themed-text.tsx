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
  const color =
    mode === 'dark'
      ? (darkColor ?? colors.text.primary)
      : (lightColor ?? colors.text.primary);
  const textColor = type === 'link' ? colors.accent.primary : color;

  return (
    <Text
      style={[
        {
          color: textColor,
          fontFamily: typography.fontFamily,
          fontSize:
            type === 'title'
              ? typography.sizes.xxl
              : type === 'subtitle'
                ? typography.sizes.lg
                : typography.sizes.md,
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
