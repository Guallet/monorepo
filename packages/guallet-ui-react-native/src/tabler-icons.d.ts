declare module '#tabler/*' {
  import type { ComponentType } from 'react';

  interface TablerIconProps {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    title?: string;
    className?: string;
    style?: unknown;
    accessibilityLabel?: string;
    testID?: string;
    'aria-label'?: string;
  }

  const icon: ComponentType<TablerIconProps>;
  export default icon;
}
