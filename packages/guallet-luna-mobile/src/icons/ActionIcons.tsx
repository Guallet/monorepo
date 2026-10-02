import TablerChevronDownIcon from '@tabler/icons-react-native/IconChevronDown';
import TablerChevronLeftIcon from '@tabler/icons-react-native/IconChevronLeft';
import TablerChevronRightIcon from '@tabler/icons-react-native/IconChevronRight';
import TablerSearchIcon from '@tabler/icons-react-native/IconSearch';
import TablerCheckIcon from '@tabler/icons-react-native/IconCheck';
import TablerXIcon from '@tabler/icons-react-native/IconX';
import TablerFileImportIcon from '@tabler/icons-react-native/IconFileImport';
import TablerCalculatorIcon from '@tabler/icons-react-native/IconCalculator';
import TablerPigMoneyIcon from '@tabler/icons-react-native/IconPigMoney';
import TablerMailIcon from '@tabler/icons-react-native/IconMail';
import type { IconProps } from '@tabler/icons-react-native';
import type { ComponentType, FC } from 'react';

function createLunaIcon(
  IconComponent: ComponentType<IconProps>,
  displayName: string,
): FC<IconProps> {
  const LunaIcon: FC<IconProps> = (props) => (
    <IconComponent strokeWidth={1.5} {...props} />
  );
  LunaIcon.displayName = displayName;
  return LunaIcon;
}

export const ChevronDownIcon = createLunaIcon(
  TablerChevronDownIcon,
  'ChevronDownIcon',
);
export const ChevronRightIcon = createLunaIcon(
  TablerChevronRightIcon,
  'ChevronRightIcon',
);
export const ChevronLeftIcon = createLunaIcon(
  TablerChevronLeftIcon,
  'ChevronLeftIcon',
);
export const CloseIcon = createLunaIcon(TablerXIcon, 'CloseIcon');
export const SearchIcon = createLunaIcon(TablerSearchIcon, 'SearchIcon');
export const CheckIcon = createLunaIcon(TablerCheckIcon, 'CheckIcon');
export const FileImportIcon = createLunaIcon(
  TablerFileImportIcon,
  'FileImportIcon',
);

export const CalculatorIcon = createLunaIcon(
  TablerCalculatorIcon,
  'CalculatorIcon',
);
export const SavingsIcon = createLunaIcon(TablerPigMoneyIcon, 'SavingsIcon');
export const MailIcon = createLunaIcon(TablerMailIcon, 'MailIcon');
