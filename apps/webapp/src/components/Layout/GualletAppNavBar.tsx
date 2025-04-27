import {
  IconGauge,
  IconPresentationAnalytics,
  IconBuildingBank,
  IconCash,
  IconSettings,
  IconTools,
  IconCategory2,
  IconArrowsRightLeft,
  IconAutomation,
  IconCalculator,
  IconCashBanknote,
  IconCategory,
  IconCloudDataConnection,
  IconHome,
  IconInbox,
  IconList,
  IconReportMoney,
  IconTax,
} from "@tabler/icons-react";
import { AppShell, NavLink, ScrollArea } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

interface Props {
  onItemSelected: () => void;
}

export function GualletAppNavBar({ onItemSelected }: Props) {
  const { t } = useTranslation();

  function isActive(url: string): boolean {
    return window.location.pathname === url;
  }

  return (
    <AppShell.Section grow component={ScrollArea}>
      <NavLink
        label={t("app.navbar.menu.dashboard.title", "Dashboard")}
        leftSection={<IconGauge size="1rem" />}
        component={Link}
        to="/dashboard"
        onClick={onItemSelected}
        active={isActive("/dashboard")}
      />

      <NavLink
        label={t("app.navbar.menu.accounts.title", "Accounts")}
        leftSection={<IconBuildingBank size="1rem" />}
        childrenOffset={28}
      >
        <NavLink
          label={t("app.navbar.menu.accounts.overview", "Overview")}
          leftSection={<IconCashBanknote size="1rem" />}
          component={Link}
          to="/accounts"
          active={isActive("/accounts")}
        />
        <NavLink
          label={t("app.navbar.menu.accounts.connections", "Connections")}
          leftSection={<IconCloudDataConnection size="1rem" />}
          component={Link}
          to="/connections"
          active={isActive("/connections")}
        />
      </NavLink>

      <NavLink
        label={t("app.navbar.menu.transactions.title", "Transactions")}
        leftSection={<IconCash size="1rem" />}
        childrenOffset={28}
      >
        <NavLink
          label={t(
            "app.navbar.menu.transactions.allTransactions",
            "All transactions"
          )}
          leftSection={<IconList size="1rem" />}
          component={Link}
          to="/transactions"
          active={isActive("/transactions")}
        />
        <NavLink
          label={t("app.navbar.menu.transactions.inbox", "Inbox")}
          leftSection={<IconInbox size="1rem" />}
          component={Link}
          to="/transactions/inbox"
          active={isActive("/transactions/inbox")}
        />
      </NavLink>

      <NavLink
        label={t("app.navbar.menu.categories.title", "Categories")}
        leftSection={<IconCategory2 size="1rem" />}
        childrenOffset={28}
      >
        <NavLink
          label={t("app.navbar.menu.categories.manage", "Manage categories")}
          leftSection={<IconCategory size="1rem" />}
          component={Link}
          to="/categories"
        />
        <NavLink
          label={t("app.navbar.menu.categories.rules", "Rules")}
          leftSection={<IconAutomation size="1rem" />}
          component={Link}
          to="/categories/rules"
        />
      </NavLink>

      <NavLink
        label={t("app.navbar.menu.reports.title", "Reports")}
        leftSection={<IconPresentationAnalytics size="1rem" />}
        childrenOffset={28}
      >
        <NavLink
          label={t("app.navbar.menu.reports.cashflow", "Cashflow")}
          leftSection={<IconReportMoney size="1rem" />}
          component={Link}
          to="/reports/cashflow"
        />
        <NavLink
          label={t("app.navbar.menu.reports.inout", "In/Out")}
          leftSection={<IconArrowsRightLeft size="1rem" />}
          component={Link}
          to="/reports/in-out"
        />
      </NavLink>

      <NavLink
        label={t("app.navbar.menu.budgets.title", "Budgets")}
        leftSection={<IconBuildingBank size="1rem" />}
        component={Link}
        to="/budgets"
      />

      <NavLink
        label={t("app.navbar.menu.tools.title", "Tools")}
        leftSection={<IconTools size="1rem" />}
        childrenOffset={28}
        component={Link}
        to="/tools"
      >
        <NavLink
          label={t("app.navbar.menu.tools.loansCalculator", "Loans calculator")}
          leftSection={<IconCalculator size="1rem" />}
          component={Link}
          to="/tools/loans-calculator"
        />
        <NavLink
          label={t(
            "app.navbar.menu.tools.mortgageCalculator",
            "Mortgage calculator"
          )}
          leftSection={<IconHome size="1rem" />}
          component={Link}
          to="/tools/mortgage-calculator"
        />
        <NavLink
          label={t("app.navbar.menu.tools.taxCalculator", "Tax calculator")}
          leftSection={<IconTax size="1rem" />}
          component={Link}
          to="/tools/tax-calculator"
        />
        <NavLink
          label={t(
            "app.navbar.menu.tools.stampDutyCalculator",
            "Stamp duty calculator"
          )}
          leftSection={<IconHome size="1rem" />}
          component={Link}
          to="/tools/stamp-duty-calculator"
        />
      </NavLink>

      <NavLink
        label={t("app.navbar.menu.settings.title", "Settings")}
        leftSection={<IconSettings size="1rem" />}
        component={Link}
        to="/settings"
      />
    </AppShell.Section>
  );
}
