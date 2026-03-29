import React from 'react';
import { Text } from 'react-native';
import { LunaFontSize } from './../../theme/typography';

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
  if (color) {
    const baseStyles = Array.isArray(props.style) ? props.style : [props.style];
    (props as unknown as React.ComponentProps<typeof Text>).style = [
      { color },
      ...baseStyles,
    ];
  }

  if (center) {
    const baseStyles = Array.isArray(props.style) ? props.style : [props.style];
    (props as unknown as React.ComponentProps<typeof Text>).style = [
      { textAlign: 'center' },
      ...baseStyles,
    ];
  }

  return <Text {...props}>{children}</Text>;
}
