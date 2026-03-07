import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@guallet/auth';
import { Link, Navigate, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const callbackSearchSchema = z.object({
  error: z.string().optional(),
  error_code: z.string().optional(),
  error_description: z.string().optional(),
});

export const Route = createFileRoute('/login/callback')({
  component: LoginCallbackPage,
  validateSearch: callbackSearchSchema,
});

function LoginCallbackPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { error, error_code, error_description } = Route.useSearch();

  // Read the destination redirection from the localstorage
  const redirectTo = localStorage.getItem('redirectDestination') ?? 'dashboard';

  if (isAuthLoading) {
    return (
      <BaseScreen fullScreen>
        <div className="flex min-h-screen items-center justify-center">
          <output className="sr-only">Loading</output>
          <div
            aria-hidden="true"
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          />
        </div>
      </BaseScreen>
    );
  }

  // Handle possible errors
  if (error) {
    return (
      <BaseScreen isLoading={isAuthLoading}>
        <div className="flex min-h-screen items-center justify-center p-6">
          <Card className="w-full max-w-lg shadow-md">
            <CardContent className="space-y-4 p-6">
              <h1 className="text-2xl font-semibold tracking-tight">
                Authentication error
              </h1>
              <p className="text-sm text-muted-foreground">{error_code}</p>
              <p className="text-sm text-muted-foreground">
                {error_description?.replaceAll('+', ' ') ??
                  'An unknown error occurred.'}
              </p>
              <Button asChild>
                <Link to="/login">Go back to login screen</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </BaseScreen>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: `${redirectTo}` }} />;
  }

  return <Navigate from="/" to={redirectTo} />;
}
