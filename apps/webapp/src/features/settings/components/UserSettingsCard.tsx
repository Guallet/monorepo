import { AppSection } from '@/components/Cards/AppSection';
import { Button } from '@/components/ui/button';
import { useUser } from '@guallet/api-react';
import { useNavigate } from '@tanstack/react-router';

export function UserSettingsCard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const initials =
    user?.name
      ?.split(' ')
      .map((namePart) => namePart[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'U';

  return (
    <AppSection title="User Information" gap={0}>
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="flex size-[120px] items-center justify-center overflow-hidden rounded-full border bg-muted">
          {user?.profile_src ? (
            <img
              src={user.profile_src}
              alt={user?.name ?? 'User avatar'}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-muted-foreground">
              {initials}
            </span>
          )}
        </div>
        <p className="text-base font-medium">{user?.name}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <Button
          variant="outline"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            navigate({ to: '/logout' });
          }}
        >
          Log out
        </Button>
      </div>
    </AppSection>
  );
}
