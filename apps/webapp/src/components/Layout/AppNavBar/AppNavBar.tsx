import {
  IconGauge,
  IconPresentationAnalytics,
  IconBuildingBank,
  IconCash,
  IconSettings,
  IconLogout,
  IconTools,
  IconCategory2,
  IconChartFunnel,
  IconPigMoney,
  IconRepeat,
  Icon,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { LinksGroup } from './NavbarLinksGroup';
import { useNavigate } from '@tanstack/react-router';

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
      { label: 'Pensions', link: '/' },
      { label: 'Investments', link: '/' },
      { label: 'Loans', link: '/tools/loan' },
      { label: 'Mortgages', link: '/tools/mortgage' },
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
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        {menuData.map((item) => {
          return (
            <LinksGroup
              {...item}
              key={item.label}
              onItemSelected={onItemSelected}
            />
          );
        })}
      </div>

      <div className="border-t p-3">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => {
            onItemSelected();
            navigate({ to: '/logout' });
          }}
        >
          <IconLogout className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
