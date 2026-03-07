import { Button } from '@/components/ui/button';
import { IconMenu2, IconUser, IconX } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { GualletLogo } from '../GualletLogo/GualletLogo';
import { NotificationIcon } from '@/features/notifications/components/NotificationIcon';

interface Props {
  isOpened: boolean;
  onToggle: () => void;
}

export default function AppHeader({ isOpened, onToggle }: Readonly<Props>) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Toggle navigation menu"
          onClick={onToggle}
        >
          {isOpened ? (
            <IconX className="h-5 w-5" />
          ) : (
            <IconMenu2 className="h-5 w-5" />
          )}
        </Button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-accent"
          onClick={() => {
            navigate({ to: '/dashboard' });
          }}
        >
          <GualletLogo size={40} />
          <h2 className="text-2xl font-semibold tracking-tight">Guallet</h2>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <NotificationIcon />
        <button
          type="button"
          title="User"
          aria-label="User"
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <IconUser className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
