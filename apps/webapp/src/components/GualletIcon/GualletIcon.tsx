import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type CategoryIconName = IconName;

const unknownIcon: IconName = "question";

interface GualletIconProps {
  iconName: string;
  iconColor?: string;
}
export function GualletIcon({
  iconName,
  iconColor = "black",
}: GualletIconProps) {
  const fontAwesomeIconName = iconName as CategoryIconName;

  if (fontAwesomeIconName) {
    return <FontAwesomeIcon icon={fontAwesomeIconName} color={iconColor} />;
  } else {
    return <FontAwesomeIcon icon={unknownIcon} color={iconColor} />;
  }
}
