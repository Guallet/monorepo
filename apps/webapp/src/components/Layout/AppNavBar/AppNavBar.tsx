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
} from "@tabler/icons-react";
import { AppShell, Button, Divider, ScrollArea } from "@mantine/core";
import { LinksGroup } from "./NavbarLinksGroup";
import { useNavigate } from "@tanstack/react-router";

type MenuData = {
  label: string;
  icon: React.FC<any>;
  initiallyOpened?: boolean;
  link?: string;
  subLinks?: { label: string; link: string }[];
};

const menuData: MenuData[] = [
  {
    label: "Dashboard",
    icon: IconGauge,
    initiallyOpened: true,
    link: "/dashboard",
  },
  {
    label: "Accounts",
    icon: IconBuildingBank,
    subLinks: [
      { label: "Overview", link: "/accounts" },
      { label: "Connections", link: "/connections" },
    ],
  },
  {
    label: "Transactions",
    icon: IconCash,
    subLinks: [
      { label: "All transactions", link: "/transactions" },
      { label: "Inbox", link: "/transactions/inbox" },
    ],
  },
  {
    label: "Categories",
    icon: IconCategory2,
    subLinks: [
      { label: "Manage Categories", link: "/categories" },
      { label: "Rules", link: "/categories/rules" },
    ],
  },
  {
    label: "Budgets",
    icon: IconChartFunnel,
    link: "/budgets",
  },
  {
    label: "Saving Goals",
    icon: IconPigMoney,
    link: "/saving-goals",
  },
  {
    label: "Reports",
    icon: IconPresentationAnalytics,
    link: "/reports",
    subLinks: [{ label: "Cashflow", link: "/reports/cashflow" }],
  },
  {
    label: "Tools",
    icon: IconTools,
    subLinks: [
      { label: "Pensions", link: "/" },
      { label: "Investments", link: "/" },
      { label: "Loans", link: "/tools/loan" },
      { label: "Mortgages", link: "/tools/mortgage" },
    ],
  },
  {
    label: "Settings",
    icon: IconSettings,
    link: "/settings",
  },
];

interface Props {
  onItemSelected: () => void;
}

export function AppNavBar({ onItemSelected }: Readonly<Props>) {
  // TODO: Instead of this hook, the navbar should use the <Link> component
  const navigate = useNavigate();

  return (
    <>
      <AppShell.Section grow my="md" component={ScrollArea}>
        {menuData.map((item) => {
          return (
            <LinksGroup
              {...item}
              key={item.label}
              onItemSelected={onItemSelected}
            />
          );
        })}
      </AppShell.Section>
      <AppShell.Section>
        <Divider />

        <Button
          variant="transparent"
          onClick={() => {
            navigate({ to: "/logout" });
          }}
        >
          <IconLogout />
          Logout
        </Button>
      </AppShell.Section>
    </>
  );
}
