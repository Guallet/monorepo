import { useMantineTheme } from "@mantine/core";
import { TablerIconsProps } from "@tabler/icons-react";
import * as allIcons from "@tabler/icons-react";

export type CategoryIcon = "money" | "salary";

interface CategoryIconProps {
  icon: string;
  colour: string;
}

export function CategoryIcon({
  icon,
  colour,
  ...rest
}: CategoryIconProps & TablerIconsProps) {
  const { primaryColor: defaultColor } = useMantineTheme();

  let IconToBeUsed = allIcons.IconCategory;
  console.log("Icon name", icon);
  switch (icon) {
    case "money":
      IconToBeUsed = allIcons.IconMoneybag;
      break;
    case "salary":
      IconToBeUsed = allIcons.IconCashBanknote;
      break;
  }

  return (
    IconToBeUsed && <IconToBeUsed {...rest} color={colour ?? defaultColor} />
  );
}
