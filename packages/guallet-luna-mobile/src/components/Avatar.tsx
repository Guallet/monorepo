import React from 'react';
import {
  Image,
  type ImageSourcePropType,
  type ImageStyle,
  StyleSheet,
  Text,
  View,
  type ColorValue,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarRadius = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type AvatarVariant = 'filled' | 'light' | 'outline' | 'transparent';
export type AvatarSource = ImageSourcePropType | string | null;

export interface AvatarProps extends Omit<ViewProps, 'style'> {
  /** Remote URI or React Native image source. */
  src?: AvatarSource;
  /** Description announced by assistive technology. */
  alt?: string;
  /** Used to derive initials when no image is available. */
  name?: string;
  /** Custom fallback content shown when the image is unavailable. */
  children?: React.ReactNode;
  size?: AvatarSize | number;
  radius?: AvatarRadius | number;
  color?: ColorValue | 'initials';
  variant?: AvatarVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

const sizeValues: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
};

const radiusValues: Record<AvatarRadius, number | 'full'> = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 32,
  full: 'full',
};

function resolveSource(
  src: AvatarSource | undefined,
): ImageSourcePropType | null {
  if (typeof src === 'string') {
    return src.length > 0 ? { uri: src } : null;
  }
  return src ?? null;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function hashName(name: string): number {
  let hash = 0;
  for (const character of name) {
    hash = Math.imul(hash, 31) + (character.codePointAt(0) ?? 0);
  }
  return Math.abs(hash);
}

function DefaultPlaceholder({
  size,
  color,
}: {
  size: number;
  color: ColorValue;
}) {
  return (
    <View
      style={[styles.placeholder, { width: size * 0.52, height: size * 0.62 }]}
      accessible={false}
    >
      <View
        style={[
          styles.placeholderHead,
          {
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: size * 0.11,
            backgroundColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.placeholderBody,
          {
            width: size * 0.52,
            height: size * 0.28,
            borderTopLeftRadius: size * 0.26,
            borderTopRightRadius: size * 0.26,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

function AvatarComponent({
  src,
  alt,
  name,
  children,
  size = 'md',
  radius = 'full',
  color,
  variant = 'filled',
  style,
  textStyle,
  imageStyle,
  ...viewProps
}: Readonly<AvatarProps>) {
  const { colors, borderRadius } = useTheme();
  const resolvedSource = resolveSource(src);
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const dimension = typeof size === 'number' ? size : sizeValues[size];
  const configuredRadius =
    typeof radius === 'number' ? radius : radiusValues[radius];
  const cornerRadius =
    configuredRadius === 'full'
      ? dimension / 2
      : (configuredRadius ?? borderRadius.md);

  const initialsColors = [
    colors.accent.primary,
    colors.accent.dark,
    colors.accent.secondary,
    colors.support.primary,
    colors.support.dark,
  ];
  const initialsColor = name
    ? initialsColors[hashName(name) % initialsColors.length]
    : colors.accent.primary;
  const resolvedColor = color === 'initials' ? initialsColor : color;
  const foregroundColor = resolvedColor
    ? colors.text.inverse
    : colors.text.secondary;
  const filledBackground = resolvedColor ?? colors.surface.background.secondary;

  const containerBackground =
    variant === 'filled'
      ? filledBackground
      : variant === 'light'
        ? colors.surface.background.secondary
        : 'transparent';
  const containerBorderColor =
    variant === 'outline'
      ? (resolvedColor ?? colors.surface.border.primary)
      : 'transparent';
  const placeholderColor =
    variant === 'filled' ? foregroundColor : (resolvedColor ?? foregroundColor);
  const initials = name ? getInitials(name) : '';
  const imageSource = imageFailed ? null : resolvedSource;

  return (
    <View
      {...viewProps}
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: cornerRadius,
          backgroundColor: containerBackground,
          borderColor: containerBorderColor,
          borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth : 0,
        },
        style,
      ]}
      accessible={viewProps.accessible ?? Boolean(alt ?? name)}
      accessibilityLabel={viewProps.accessibilityLabel ?? alt ?? name}
      accessibilityRole={viewProps.accessibilityRole ?? 'image'}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          accessible={false}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: cornerRadius },
            imageStyle,
          ]}
        />
      ) : children != null ? (
        children
      ) : initials.length > 0 ? (
        <Text
          numberOfLines={1}
          style={[
            styles.initials,
            {
              color:
                variant === 'light'
                  ? (resolvedColor ?? colors.text.primary)
                  : foregroundColor,
              fontSize: Math.max(10, dimension * 0.38),
              lineHeight: dimension * 0.48,
            },
            textStyle,
          ]}
        >
          {initials}
        </Text>
      ) : (
        <DefaultPlaceholder size={dimension} color={placeholderColor} />
      )}
    </View>
  );
}

export interface AvatarGroupProps extends Omit<ViewProps, 'style'> {
  children: React.ReactNode;
  /** Horizontal offset between avatars. Negative values create an overlap. */
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

export function AvatarGroup({
  children,
  spacing = -8,
  style,
  ...viewProps
}: Readonly<AvatarGroupProps>) {
  const items = React.Children.toArray(children);

  return (
    <View {...viewProps} style={[styles.group, style]}>
      {items.map((child, index) => (
        <View
          key={
            React.isValidElement(child) && child.key != null ? child.key : index
          }
          style={
            index === 0
              ? undefined
              : { marginLeft: spacing, zIndex: items.length - index }
          }
        >
          {child}
        </View>
      ))}
    </View>
  );
}

/** Compound API matching Mantine's `<Avatar.Group>` usage. */
export const Avatar = Object.assign(AvatarComponent, { Group: AvatarGroup });

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  placeholderHead: {
    marginBottom: 2,
  },
  placeholderBody: {},
  group: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
