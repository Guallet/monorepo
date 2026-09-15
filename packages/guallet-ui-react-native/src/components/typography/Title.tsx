import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import {
  titleOrderToSize,
  type TitleOrder,
  type TitleSize,
} from './titleOrderToSize';

export type { TitleOrder, TitleSize } from './titleOrderToSize';

export interface TitleProps extends TextProps {
  lineClamp?: number;
  order?: TitleOrder;
  size?: TitleSize;
  textWrap?: 'wrap' | 'nowrap' | 'balance' | 'pretty' | 'stable';
  children: React.ReactNode;
  center?: boolean;
}

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
    : typography.sizes[titleOrderToSize[order]];

  const titleStyle = [
    styles.base,
    {
      color: colors.text.primary,
      fontSize,
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
