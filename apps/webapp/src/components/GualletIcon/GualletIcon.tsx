import { FontAwesome6IconNames } from "@/core/FontAwesome6";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type CategoryIconName = IconName;
export const CategoryIconNames = FontAwesome6IconNames;

const unknownIcon: IconName = "question";

interface GualletIconProps {
  iconName: string;
  iconColor?: string;
}
export function GualletIcon({
  iconName,
  iconColor = "black",
}: GualletIconProps) {
  if (isValidIcon(iconName)) {
    return (
      <FontAwesomeIcon icon={iconName as CategoryIconName} color={iconColor} />
    );
  } else {
    console.error(`Invalid category icon name ${iconName}`);
    return <FontAwesomeIcon icon={unknownIcon} color={iconColor} />;
  }
}

function isValidIcon(iconName: string): boolean {
  return CategoryIconNames.includes(iconName);
}
