import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { useAuth } from '@guallet/auth';
import { useState } from 'react';

const loginSearchSchema = z.object({
  redirect: z.string().catch('/dashboard'),
});

export const Route = createFileRoute('/login/')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, isLoading, login, loginWithProvider, getOtpCode } =
    useAuth();
  const { redirect } = Route.useSearch();
  const navigation = useNavigate();
  const oAuthRedirectionTo = `${globalThis.location.origin}/login/callback`;
  const [passwordError, setPasswordError] = useState<string | null>(null);

  console.log('LoginPage rendered. isAuthenticated:', isAuthenticated);
  console.log('Redirect destination after login:', redirect);

  if (isAuthenticated) {
    return <Navigate to={redirect || 'dashboard'} />;
  }

  return (
    <LoginScreen
      isLoading={isLoading}
      passwordError={passwordError}
      onGoogleLogin={async () => {
        console.log('Logging in with Google');
        // Save the redirect url in the local storage to be able to restore it later
        localStorage.setItem('redirectDestination', redirect);
        await loginWithProvider('google', oAuthRedirectionTo);
      }}
      onMagicLink={async (email: string) => {
        console.log('Sending magic link to', email);

        const { success, error } = await getOtpCode(email);
        if (error) {
          console.error('Error sending the OTP', error);
        } else if (success) {
          navigation({
            from: Route.fullPath,
            to: '/login/validateotp',
            search: {
              email: email,
              redirectTo: redirect,
            },
          });
        }
      }}
      onPassword={async (email: string, password: string) => {
        console.log('Logging in with email and password');
        setPasswordError(null); // Clear previous error
        const { success, error } = await login(email, password);
        if (error) {
          console.error('Error logging in', error);
          setPasswordError(error.message || 'Login failed');
        } else if (success) {
          console.log('Success login');
          console.log('Redirecting to', redirect || '/dashboard');
          navigation({
            to: redirect || '/dashboard',
            replace: true,
          });
        }
      }}
    />
  );
}
