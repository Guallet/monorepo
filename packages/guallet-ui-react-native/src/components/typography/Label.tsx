import React from 'react';
import { Text } from 'react-native';
import { LunaFontSize } from './../../theme/typography';
import { useTheme } from '../../theme';

interface LabelProps extends React.ComponentProps<typeof Text> {
  color?: string;
  gradient?: { from: string; to: string; deg?: number };
  inherit?: boolean;
  inline?: boolean;
  lineClamp?: number;
  size?: LunaFontSize;
  span?: boolean;
  center?: boolean;
  truncate?: 'start' | 'end' | 'both';
  children: React.ReactNode;
}

export function Label({
  color,
  gradient: _gradient,
  inherit: _inherit = false,
  inline: _inline = false,
  lineClamp: _lineClamp,
  size: _size = 'md',
  center = false,
  span: _span = false,
  truncate: _truncate,
  children,
  ...props
}: Readonly<LabelProps>) {
  const { colors, typography } = useTheme();
  const labelStyles = [
    {
      color: color ?? colors.text.primary,
      fontSize: typeof _size === 'number' ? _size : typography.sizes[_size],
    },
    props.style,
    center && { textAlign: 'center' as const },
  ];

  return (
    <Text {...props} style={labelStyles}>
      {children}
    </Text>
  );
}
