import { Navigate, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { useAuth } from '@guallet/auth';

const loginSearchSchema = z.object({
  redirect: z.string().catch('/dashboard'),
});

export const Route = createFileRoute('/login/')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated } = useAuth();
  const { redirect: rawRedirect } = Route.useSearch();
  const oAuthRedirectionTo = `${globalThis.location.origin}/login/callback`;

  // Don't allow redirecting to login page itself
  const redirect =
    rawRedirect === 'login' || rawRedirect === '/login'
      ? '/dashboard'
      : rawRedirect;

  // if redirect is login, navigate to dashboard instead. This is to prevent redirect loops in case of misconfiguration
  if (redirect === '/login' || redirect === 'login') {
    console.warn(
      'Redirect destination is set to login page. Redirecting to dashboard instead to prevent redirect loop.',
      {
        originalRedirect: redirect,
      },
    );
    return <Navigate to="/login" search={{ redirect: '/dashboard' }} replace />;
  }

  console.log('LoginPage rendered. isAuthenticated:', isAuthenticated);
  console.log('Redirect destination after login:', redirect);

  if (isAuthenticated) {
    return <Navigate to={redirect || '/dashboard'} replace />;
  }

  return (
    <LoginScreen oAuthRedirectionTo={oAuthRedirectionTo} redirect={redirect} />
  );
}
