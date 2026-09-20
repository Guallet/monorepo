import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LunaSpacing } from './../../theme/spacing';
import { getSpacingValue, useTheme } from './../../theme';

type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

interface StackProps {
  children: React.ReactNode;
  align?: AlignItems;
  gap?: LunaSpacing;
  justify?: JustifyContent;
  style?: ViewStyle;
}

export function Stack({
  children,
  align = 'stretch',
  gap = 'md',
  justify = 'flex-start',
  style,
}: Readonly<StackProps>) {
  const { spacing } = useTheme();
  const gapValue =
    typeof gap === 'string' ? getSpacingValue(spacing, gap) : gap;

  const stackStyle = StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: align,
      justifyContent: justify,
      gap: gapValue,
      ...style,
    },
  });

  return <View style={stackStyle.container}>{children}</View>;
}
