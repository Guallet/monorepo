import {
  IconCategory,
  IconMoneybag,
  IconPigMoney,
  IconStatusChange,
  IconCashBanknote,
  Icon,
} from '@tabler/icons-react';
import { GualletCategoryIcon } from './GualletCategoryIcon';

interface CategoryIconProps extends React.ComponentProps<Icon> {
  icon: string | GualletCategoryIcon;
  colour: string;
}

/**
 * @deprecated This component is deprecated and should not be used.
 */
export function CategoryIcon({ icon, colour, ...rest }: CategoryIconProps) {
  const defaultColor = '#2563eb';

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
    IconToBeUsed && <IconToBeUsed {...rest} color={colour || defaultColor} />
  );
}
