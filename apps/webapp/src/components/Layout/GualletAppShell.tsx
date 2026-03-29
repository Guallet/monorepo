import { AppShell } from "@mantine/core";
import { AppNavBar } from "./AppNavBar/AppNavBar";
import { useDisclosure } from "@mantine/hooks";
import AppHeader from "./AppHeader";
import { Outlet } from "@tanstack/react-router";
import { useTheme } from "@guallet/ui-react";

export default function GualletAppShell() {
  const [opened, { close, toggle }] = useDisclosure();
  const { colors } = useTheme();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      bg={colors.pageBackground}
      padding="md"
    >
      <AppShell.Header>
        <AppHeader isOpened={opened} onToggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar>
        <AppNavBar onItemSelected={close} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
