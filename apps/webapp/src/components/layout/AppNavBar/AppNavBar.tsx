import {
  IconGauge,
  IconPresentationAnalytics,
  IconBuildingBank,
  IconCash,
  IconSettings,
  IconLogout,
  IconTools,
} from "@tabler/icons-react";
import { ScrollArea } from "@mantine/core";
import classes from "./AppNavBar.module.css";
import { LinksGroup } from "./NavbarLinksGroup";
import { UserButton } from "../../UserButton/UserButton";

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
    link: "/accounts",
    subLinks: [
      { label: "Overview", link: "/" },
      { label: "Connections", link: "/" },
    ],
  },
  {
    label: "Transactions",
    icon: IconCash,
    link: "/transactions",
    subLinks: [
      { label: "Inbox (4)", link: "/transactions/inbox" },
      { label: "Categories", link: "/categories" },
      { label: "Upcoming", link: "/" },
    ],
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
      { label: "Loans", link: "/" },
      { label: "Mortgages", link: "/tools/mortgage" },
    ],
  },
  {
    label: "Settings",
    icon: IconSettings,
    subLinks: [
      { label: "Security", link: "/" },
      { label: "App", link: "/" },
      { label: "User", link: "/" },
      { label: "Export data", link: "/" },
    ],
  },
];

interface Props {
  onItemSelected: () => void;
}

export function AppNavBar({ onItemSelected }: Props) {
  const links = menuData.map((item) => (
    <LinksGroup {...item} key={item.label} onItemSelected={onItemSelected} />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <UserButton />
      </div>

      <ScrollArea w={300} h={200} className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}></div>
    </nav>
  );
}
