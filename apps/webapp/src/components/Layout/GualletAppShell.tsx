import { AppNavBar } from './AppNavBar/AppNavBar';
import { useDisclosure } from '@/hooks/useDisclosure';
import AppHeader from './AppHeader';
import { Outlet } from '@tanstack/react-router';
import { Colors } from '@/theme/colors';
import { cn } from '@/lib/utils';

export default function GualletAppShell() {
  const [opened, { close, toggle }] = useDisclosure();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: Colors.pageBackground }}
    >
      <header className="sticky top-0 z-40 h-[60px] border-b bg-background px-4">
        <AppHeader isOpened={opened} onToggle={toggle} />
      </header>

      <div className="relative flex min-h-[calc(100dvh-60px)]">
        <aside
          className={cn(
            'absolute left-0 top-0 z-30 h-full w-[300px] border-r bg-background sm:static sm:block',
            opened ? 'block' : 'hidden sm:block',
          )}
        >
          <AppNavBar onItemSelected={close} />
        </aside>

        <main className="min-w-0 flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
