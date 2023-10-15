import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { AppNavBar } from "./AppNavBar/AppNavBar";
import { useDisclosure } from "@mantine/hooks";
import AppHeader from "./AppHeader";

export default function GualletAppShell() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <AppHeader isOpened={opened} onToggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppNavBar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
