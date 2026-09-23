import React from 'react';
import { Image } from 'expo-image';
import {
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

function resolveSource(
  src: AvatarSource | undefined,
): ImageSourcePropType | null {
  if (typeof src === 'string') {
    return src.length > 0 ? { uri: src } : null;
  }
  return src ?? null;
}

function getSourceKey(source: ImageSourcePropType | null): string | null {
  if (source == null) return null;
  return JSON.stringify(source) ?? null;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) {
    return Array.from(words[0]).slice(0, 2).join('').toUpperCase();
  }
  const firstInitial = Array.from(words[0])[0];
  const lastInitial = Array.from(words.at(-1) ?? '')[0];
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

function hashName(name: string): number {
  let hash = 0;
  for (const character of name) {
    hash = Math.imul(hash, 31) + (character.codePointAt(0) ?? 0);
  }
  return Math.abs(hash);
}

type AvatarColors = ReturnType<typeof useTheme>['colors'];
type AvatarBorderRadius = ReturnType<typeof useTheme>['borderRadius'];

function getCornerRadius(
  radius: AvatarRadius | number,
  dimension: number,
  borderRadius: AvatarBorderRadius,
): number {
  if (typeof radius === 'number') return radius;
  if (radius === 'full') return dimension / 2;
  return borderRadius[radius];
}

function getInitialsColor(name: string | undefined, colors: AvatarColors) {
  if (!name) return colors.accent.primary;
  const palette = [
    colors.accent.primary,
    colors.accent.dark,
    colors.accent.secondary,
    colors.support.primary,
    colors.support.dark,
  ];
  return palette[hashName(name) % palette.length];
}

function getAvatarColors(
  variant: AvatarVariant,
  resolvedColor: ColorValue | undefined,
  colors: AvatarColors,
) {
  const foreground = resolvedColor
    ? colors.text.inverse
    : colors.text.secondary;
  let background: ColorValue | 'transparent';
  let border: ColorValue | 'transparent' = 'transparent';
  let placeholder = resolvedColor ?? foreground;

  switch (variant) {
    case 'filled':
      background = resolvedColor ?? colors.surface.background.secondary;
      placeholder = foreground;
      break;
    case 'light':
      background = colors.surface.background.secondary;
      break;
    case 'outline':
      background = 'transparent';
      border = resolvedColor ?? colors.surface.border.primary;
      break;
    case 'transparent':
      background = 'transparent';
      break;
  }

  return {
    background,
    border,
    borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth : 0,
    foreground,
    placeholder,
    initials:
      variant === 'light'
        ? (resolvedColor ?? colors.text.primary)
        : foreground,
  };
}

function DefaultPlaceholder({ size, color }: Readonly<{
  size: number;
  color: ColorValue;
}>) {
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

interface AvatarContentProps {
  source: ImageSourcePropType | null;
  imageDisplayed: boolean;
  onImageDisplay: () => void;
  onImageError: () => void;
  children?: React.ReactNode;
  initials: string;
  dimension: number;
  cornerRadius: number;
  colors: AvatarColors;
  imageStyle?: StyleProp<ImageStyle>;
  textStyle?: StyleProp<TextStyle>;
  placeholderColor: ColorValue;
  initialsColor: ColorValue;
}

function AvatarContent({
  source,
  imageDisplayed,
  onImageDisplay,
  onImageError,
  children,
  initials,
  dimension,
  cornerRadius,
  colors,
  imageStyle,
  textStyle,
  placeholderColor,
  initialsColor,
}: Readonly<AvatarContentProps>) {
  if (source) {
    return (
      <Image
        source={source}
        accessible={false}
        contentFit="cover"
        onDisplay={onImageDisplay}
        onError={onImageError}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: cornerRadius,
            backgroundColor: imageDisplayed
              ? 'transparent'
              : colors.accent.primary,
          },
          imageStyle,
        ]}
      />
    );
  }

  if (children != null) return <>{children}</>;

  if (initials.length > 0) {
    return (
      <Text
        numberOfLines={1}
        style={[
          styles.initials,
          {
            color: initialsColor,
            fontSize: Math.max(10, dimension * 0.38),
            lineHeight: dimension * 0.48,
          },
          textStyle,
        ]}
      >
        {initials}
      </Text>
    );
  }

  return <DefaultPlaceholder size={dimension} color={placeholderColor} />;
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
  const sourceKey = getSourceKey(resolvedSource);
  const [failedSourceKey, setFailedSourceKey] = React.useState<string | null>(
    null,
  );
  const [displayedSourceKey, setDisplayedSourceKey] = React.useState<
    string | null
  >(null);

  const dimension = typeof size === 'number' ? size : sizeValues[size];
  const cornerRadius = getCornerRadius(radius, dimension, borderRadius);
  const initialsColor = getInitialsColor(name, colors);
  const resolvedColor = color === 'initials' ? initialsColor : color;
  const avatarColors = getAvatarColors(variant, resolvedColor, colors);
  const initials = name ? getInitials(name) : '';
  const imageFailed = sourceKey !== null && failedSourceKey === sourceKey;
  const imageSource = imageFailed ? null : resolvedSource;
  const imageDisplayed = sourceKey !== null && displayedSourceKey === sourceKey;

  return (
    <View
      {...viewProps}
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: cornerRadius,
          backgroundColor: avatarColors.background,
          borderColor: avatarColors.border,
          borderWidth: avatarColors.borderWidth,
        },
        style,
      ]}
      accessible={
        viewProps.accessible ??
        Boolean(viewProps.accessibilityLabel ?? alt ?? name)
      }
      accessibilityLabel={viewProps.accessibilityLabel ?? alt ?? name}
      accessibilityRole={viewProps.accessibilityRole ?? 'image'}
    >
      <AvatarContent
        source={imageSource}
        imageDisplayed={imageDisplayed}
        onImageDisplay={() => setDisplayedSourceKey(sourceKey)}
        onImageError={() => setFailedSourceKey(sourceKey)}
        initials={initials}
        dimension={dimension}
        cornerRadius={cornerRadius}
        colors={colors}
        imageStyle={imageStyle}
        textStyle={textStyle}
        placeholderColor={avatarColors.placeholder}
        initialsColor={avatarColors.initials}
      >
        {children}
      </AvatarContent>
    </View>
  );
}

export interface AvatarGroupProps extends Omit<ViewProps, 'style'> {
  children: React.ReactNode;
  /** Horizontal offset between avatars. Negative values create an overlap. */
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

function getAvatarGroupKey(child: React.ReactNode, index: number): React.Key {
  if (!React.isValidElement(child)) return index;
  return child.key ?? index;
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
          key={getAvatarGroupKey(child, index)}
          style={{
            ...(index === 0 ? {} : { marginLeft: spacing }),
            zIndex: items.length - index,
          }}
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
