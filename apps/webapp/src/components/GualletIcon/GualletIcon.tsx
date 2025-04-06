import { Icon } from "@tabler/icons-react";
import * as TablerIcons from "@tabler/icons-react";

export type GualletIconName = keyof typeof TablerIcons;

const validIconNames = Object.keys(TablerIcons).filter(
  (name) => name.startsWith("Icon") && name !== "Icon"
);

function isValidIcon(iconName: string): boolean {
  return validIconNames.includes(iconName);
}

interface GualletIconProps extends React.ComponentPropsWithoutRef<Icon> {
  iconName: string;
  iconColor?: string;
  size?: number;
}
export function GualletIcon({
  iconName,
  iconColor = "black",
  size = 24,
  ...props
}: Readonly<GualletIconProps>) {
  if (isValidIcon(iconName)) {
    const IconComponent = TablerIcons[iconName as GualletIconName] as Icon;
    return <IconComponent color={iconColor} size={size} {...props} />;
  } else {
    console.error(`Invalid category icon name ${iconName}`);
    return (
      <TablerIcons.IconQuestionMark color={iconColor} size={size} {...props} />
    );
  }
}
