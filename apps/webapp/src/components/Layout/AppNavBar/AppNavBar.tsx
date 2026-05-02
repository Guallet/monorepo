import {
  IconGauge,
  IconPresentationAnalytics,
  IconBuildingBank,
  IconCash,
  IconSettings,
  IconTools,
  IconCategory2,
  IconChartFunnel,
  IconPigMoney,
  IconRepeat,
  Icon,
} from '@tabler/icons-react';
import { AppShell, ScrollArea } from '@mantine/core';
import { LinksGroup } from './NavbarLinksGroup';

type MenuData = {
  label: string;
  icon: Icon;
  initiallyOpened?: boolean;
  link?: string;
  subLinks?: { label: string; link: string }[];
};

const menuData: MenuData[] = [
  {
    label: 'Dashboard',
    icon: IconGauge,
    initiallyOpened: true,
    link: '/dashboard',
  },
  {
    label: 'Accounts',
    icon: IconBuildingBank,
    subLinks: [
      { label: 'Overview', link: '/accounts' },
      { label: 'Connections', link: '/connections' },
    ],
  },
  {
    label: 'Transactions',
    icon: IconCash,
    subLinks: [
      { label: 'All transactions', link: '/transactions' },
      { label: 'Inbox', link: '/transactions/inbox' },
    ],
  },
  {
    label: 'Categories',
    icon: IconCategory2,
    subLinks: [
      { label: 'Manage Categories', link: '/categories' },
      { label: 'Rules', link: '/categories/rules' },
    ],
  },
  {
    label: 'Budgets',
    icon: IconChartFunnel,
    link: '/budgets',
  },
  {
    label: 'Saving Goals',
    icon: IconPigMoney,
    link: '/saving-goals',
  },
  {
    label: 'Subscriptions',
    icon: IconRepeat,
    link: '/subscriptions',
  },
  {
    label: 'Reports',
    icon: IconPresentationAnalytics,
    link: '/reports',
    subLinks: [{ label: 'Cashflow', link: '/reports/cashflow' }],
  },
  {
    label: 'Tools',
    icon: IconTools,
    subLinks: [
      { label: 'Loans', link: '/tools/loan' },
      { label: 'Mortgages', link: '/tools/mortgage' },
      { label: 'UK Stamp Duty', link: '/tools/stamp-duty' },
      { label: 'UK Salary Calculator', link: '/tools/salary' },
    ],
  },
  {
    label: 'Settings',
    icon: IconSettings,
    link: '/settings',
  },
];

interface Props {
  onItemSelected: () => void;
}

export function AppNavBar({ onItemSelected }: Readonly<Props>) {
  return (
    <AppShell.Section grow my="md" component={ScrollArea}>
      {menuData.map((item) => (
        <LinksGroup
          {...item}
          key={item.label}
          onItemSelected={onItemSelected}
        />
      ))}
    </AppShell.Section>
  );
}
