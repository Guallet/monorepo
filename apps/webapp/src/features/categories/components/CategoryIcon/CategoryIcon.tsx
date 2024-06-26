import { useMantineTheme } from "@mantine/core";
import {
  IconCategory,
  IconMoneybag,
  TablerIconsProps,
  IconPigMoney,
  IconStatusChange,
  IconCashBanknote,
} from "@tabler/icons-react";

export enum GualletCategoryIcon {
  Money = "money",
  Salary = "salary",
  Transfer = "transfer",
  Savings = "savings",
}

interface CategoryIconProps {
  icon: string | GualletCategoryIcon;
  colour: string;
}

/**
 * @deprecated This component is deprecated and should not be used.
 */
export function CategoryIcon({
  icon,
  colour,
  ...rest
}: CategoryIconProps & TablerIconsProps) {
  const { primaryColor: defaultColor } = useMantineTheme();

  let IconToBeUsed = IconCategory;

  switch (icon) {
    case GualletCategoryIcon.Money:
      IconToBeUsed = IconMoneybag;
      break;
    case GualletCategoryIcon.Salary:
      IconToBeUsed = IconCashBanknote;
      break;
    case GualletCategoryIcon.Transfer:
      IconToBeUsed = IconStatusChange;
      break;
    case GualletCategoryIcon.Savings:
      IconToBeUsed = IconPigMoney;
      break;
  }

  return (
    IconToBeUsed && <IconToBeUsed {...rest} color={colour ?? defaultColor} />
  );
}
