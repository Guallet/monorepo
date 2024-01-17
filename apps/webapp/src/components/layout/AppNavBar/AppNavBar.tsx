import {
  IconGauge,
  IconPresentationAnalytics,
  IconBuildingBank,
  IconCash,
  IconSettings,
  IconLogout,
  IconTools,
} from "@tabler/icons-react";
import { Button, ScrollArea } from "@mantine/core";
import classes from "./AppNavBar.module.css";
import { LinksGroup } from "./NavbarLinksGroup";
import { UserButton } from "../../UserButton/UserButton";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "../../../router/AppRoutes";

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
      { label: "Categories", link: "/categories" },
      { label: "Rules", link: "/categories/rules" },
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
    link: "/settings",
  },
];

interface Props {
  onItemSelected: () => void;
}

export function AppNavBar({ onItemSelected }: Props) {
  const navigate = useNavigate();

  const links = menuData.map((item) => (
    <LinksGroup {...item} key={item.label} onItemSelected={onItemSelected} />
  ));

  return (
    <nav className={classes.navbar}>
      <div
        className={classes.header}
        onClick={() => {
          navigate(AppRoutes.User.USER_DETAILS);
        }}
      >
        <UserButton />
      </div>

      <ScrollArea w={300} h={200} className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <Button
          variant="transparent"
          onClick={() => {
            navigate(AppRoutes.Auth.LOGOUT);
          }}
        >
          <IconLogout />
          Logout
        </Button>
      </div>
    </nav>
  );
}
