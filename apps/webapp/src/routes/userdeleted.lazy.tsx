import { useAuth } from '@guallet/auth';
import { Link, createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createLazyFileRoute('/userdeleted')({
  component: () => DeleteAccountConfirmationPage(),
});

function DeleteAccountConfirmationPage() {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    logout()
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, [logout]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="text-sm text-muted-foreground">Deleting your data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-6">
      <p>Your account and all your data has been deleted</p>
      <Link to="/">Go to home page</Link>
    </div>
  );
}
