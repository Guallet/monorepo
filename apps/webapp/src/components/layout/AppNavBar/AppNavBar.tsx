import {
  IconGauge,
  IconPresentationAnalytics,
  IconBuildingBank,
  IconCash,
  IconSettings,
  IconLogout,
  IconTools,
} from "@tabler/icons-react";
import { Group, ScrollArea } from "@mantine/core";
import classes from "./AppNavBar.module.css";
import { LinksGroup } from "./NavbarLinksGroup";
import { UserButton } from "../../UserButton/UserButton";

type MenuData = {
  label: string;
  icon: React.FC<any>;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
};

const menuData: MenuData[] = [
  { label: "Dashboard", icon: IconGauge, initiallyOpened: true },
  {
    label: "Accounts",
    icon: IconBuildingBank,
    links: [
      { label: "Overview", link: "/" },
      { label: "Connections", link: "/" },
    ],
  },
  {
    label: "Transactions",
    icon: IconCash,
    links: [
      { label: "Pending (4)", link: "/" },
      { label: "Categories", link: "/" },
      { label: "Upcoming", link: "/" },
    ],
  },
  {
    label: "Reports",
    icon: IconPresentationAnalytics,
    links: [
      { label: "Security", link: "/" },
      { label: "App", link: "/" },
      { label: "User", link: "/" },
    ],
  },
  {
    label: "Tools",
    icon: IconTools,
    links: [
      { label: "Pensions", link: "/" },
      { label: "Investments", link: "/" },
      { label: "Loans", link: "/" },
      { label: "Mortgages", link: "/" },
    ],
  },
  {
    label: "Settings",
    icon: IconSettings,
    links: [
      { label: "Security", link: "/" },
      { label: "App", link: "/" },
      { label: "User", link: "/" },
      { label: "Export data", link: "/" },
    ],
  },
];

export function AppNavBar() {
  const links = menuData.map((item) => (
    <LinksGroup {...item} key={item.label} />
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
