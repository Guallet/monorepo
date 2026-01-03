import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;
export type TitleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface TitleProps extends TextProps {
  order?: TitleOrder;
  size?: TitleSize;
  textWrap?: 'wrap' | 'nowrap' | 'balance' | 'pretty' | 'stable';
  children: React.ReactNode;
  center?: boolean;
}

const orderToFontSize: Record<TitleOrder, number> = {
  1: 32,
  2: 28,
  3: 24,
  4: 20,
  5: 18,
  6: 16,
};

const sizeToFontSize: Record<TitleSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 28,
};

export function Title({
  order = 1,
  size,
  textWrap = 'wrap',
  style,
  children,
  center = false,
  ...rest
}: Readonly<TitleProps>) {
  const fontSize = size ? sizeToFontSize[size] : orderToFontSize[order];

  const titleStyle = [
    styles.base,
    {
      fontSize,
      fontWeight: (order <= 2 ? 'bold' : order <= 4 ? '600' : '500') as
        | 'bold'
        | '600'
        | '500',
    },
    textWrap === 'nowrap' && styles.nowrap,
    style,
  ];

  const textProps: TextProps = {
    ...rest,
    // style: titleStyle,
    ellipsizeMode: rest.numberOfLines ? 'tail' : undefined,
  };

  return (
    <Text
      {...rest}
      // style={[
      //   center && { textAlign: 'center' },
      //   ...(textProps.style ? [textProps.style] : []),
      // ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: '#000',
    lineHeight: 1.2,
  },
  nowrap: {
    flexWrap: 'nowrap',
  },
});
