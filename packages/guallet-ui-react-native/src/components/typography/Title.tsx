import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;
export type TitleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface TitleProps extends TextProps {
  lineClamp?: number;
  order?: TitleOrder;
  size?: TitleSize;
  textWrap?: 'wrap' | 'nowrap' | 'balance' | 'pretty' | 'stable';
  children: React.ReactNode;
  center?: boolean;
}

const orderToSize: Record<TitleOrder, TitleSize> = {
  1: 'xxl',
  2: 'xxl',
  3: 'xl',
  4: 'lg',
  5: 'md',
  6: 'sm',
};

export function Title({
  lineClamp,
  order = 1,
  size,
  textWrap = 'wrap',
  style,
  children,
  center = false,
  ...rest
}: Readonly<TitleProps>) {
  const { colors, typography } = useTheme();
  const fontSize = size
    ? typography.sizes[size]
    : typography.sizes[orderToSize[order]];

  const titleStyle = [
    styles.base,
    {
      color: colors.text,
      fontSize,
      fontFamily: typography.fontFamily,
      fontWeight: (order <= 2 ? 'bold' : order <= 4 ? '600' : '500') as
        | 'bold'
        | '600'
        | '500',
    },
    textWrap === 'nowrap' && styles.nowrap,
    style,
  ];

  return (
    <Text
      {...rest}
      style={[titleStyle, center && { textAlign: 'center' }]}
      numberOfLines={lineClamp}
      ellipsizeMode={lineClamp ? 'tail' : undefined}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    lineHeight: 1.2,
  },
  nowrap: {
    flexWrap: 'nowrap',
  },
});
