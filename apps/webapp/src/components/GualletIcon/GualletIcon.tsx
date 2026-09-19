import type { Icon } from '@tabler/icons-react';
import { gualletIconRegistry, isGualletIconName } from './gualletIconRegistry';

export type { GualletIconName } from './gualletIconRegistry';

interface GualletIconProps extends React.ComponentPropsWithoutRef<Icon> {
  iconName?: string;
  iconColor?: string;
  size?: number;
}
export function GualletIcon({
  iconName,
  iconColor,
  size = 24,
  ...props
}: Readonly<GualletIconProps>) {
  if (isGualletIconName(iconName)) {
    const IconComponent = gualletIconRegistry[iconName];
    return <IconComponent color={iconColor} size={size} {...props} />;
  } else {
    console.error(`Invalid category icon name ${iconName}`);
    const FallbackIcon = gualletIconRegistry.IconQuestionMark;
    return <FallbackIcon color={iconColor} size={size} {...props} />;
  }
}
