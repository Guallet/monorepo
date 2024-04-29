import { AppShell } from "@mantine/core";
import { AppNavBar } from "./AppNavBar/AppNavBar";
import { useDisclosure } from "@mantine/hooks";
import AppHeader from "./AppHeader";
import { Outlet } from "@tanstack/react-router";
import { Colors } from "@/theme/colors";

export default function GualletAppShell() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      bg={Colors.pageBackground}
      padding="md"
    >
      <AppShell.Header>
        <AppHeader isOpened={opened} onToggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar>
        <AppNavBar onItemSelected={toggle} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
