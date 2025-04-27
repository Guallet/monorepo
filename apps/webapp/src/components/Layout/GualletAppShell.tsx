import { AppShell } from "@mantine/core";
import { GualletAppNavBar } from "@/components/Layout/GualletAppNavBar";
import { AppHeader } from "@/components/Layout/AppHeader";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "@tanstack/react-router";
import { Colors } from "@/theme/colors";

export default function GualletAppShell() {
  const [opened, { close, toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
      bg={Colors.pageBackground}
    >
      <AppShell.Header>
        <AppHeader isOpened={opened} onToggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar>
        <GualletAppNavBar onItemSelected={close} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
