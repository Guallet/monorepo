import TablerChevronDownIcon from '@tabler/icons-react-native/IconChevronDown';
import TablerChevronLeftIcon from '@tabler/icons-react-native/IconChevronLeft';
import TablerChevronRightIcon from '@tabler/icons-react-native/IconChevronRight';
import TablerSearchIcon from '@tabler/icons-react-native/IconSearch';
import TablerCheckIcon from '@tabler/icons-react-native/IconCheck';
import TablerXIcon from '@tabler/icons-react-native/IconX';
import TablerFileImportIcon from '@tabler/icons-react-native/IconFileImport';
import TablerCalculatorIcon from '@tabler/icons-react-native/IconCalculator';
import TablerBuildingBankIcon from '@tabler/icons-react-native/IconBuildingBank';
import TablerPigMoneyIcon from '@tabler/icons-react-native/IconPigMoney';
import TablerCreditCardIcon from '@tabler/icons-react-native/IconCreditCard';
import TablerChartLineIcon from '@tabler/icons-react-native/IconChartLine';
import TablerHomeIcon from '@tabler/icons-react-native/IconHome';
import TablerReceiptIcon from '@tabler/icons-react-native/IconReceipt';
import TablerBriefcaseIcon from '@tabler/icons-react-native/IconBriefcase';
import TablerHelpIcon from '@tabler/icons-react-native/IconHelp';
import TablerWalletIcon from '@tabler/icons-react-native/IconWallet';
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
export const BankIcon = createLunaIcon(TablerBuildingBankIcon, 'BankIcon');
export const SavingsIcon = createLunaIcon(TablerPigMoneyIcon, 'SavingsIcon');
export const AccountCreditCardIcon = createLunaIcon(
  TablerCreditCardIcon,
  'AccountCreditCardIcon',
);
export const InvestmentIcon = createLunaIcon(
  TablerChartLineIcon,
  'InvestmentIcon',
);
export const MortgageIcon = createLunaIcon(TablerHomeIcon, 'MortgageIcon');
export const LoanIcon = createLunaIcon(TablerReceiptIcon, 'LoanIcon');
export const PensionIcon = createLunaIcon(TablerBriefcaseIcon, 'PensionIcon');
export const OtherAccountIcon = createLunaIcon(
  TablerHelpIcon,
  'OtherAccountIcon',
);
export const AccountsIcon = createLunaIcon(TablerWalletIcon, 'AccountsIcon');
export const MailIcon = createLunaIcon(TablerMailIcon, 'MailIcon');
