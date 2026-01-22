import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router';
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
  const { isAuthenticated, isLoading, loginWithProvider, sendOtpEmail, login } = useAuth();
  const { redirect } = Route.useSearch();
  const navigation = useNavigate();
  const redirectTo = `${globalThis.location.origin}/login/callback`;

  if (isAuthenticated) {
    return <Navigate to={redirect || 'dashboard'} />;
  }

  return (
    <LoginScreen
      isLoading={isLoading}
      onGoogleLogin={async () => {
        console.log('Logging in with Google');
        // Save the redirect url in the local storage to be able to restore it later
        localStorage.setItem('redirectDestination', redirect);
        await loginWithProvider('google', redirectTo);
      }}
      onMagicLink={async (email: string) => {
        console.log('Sending magic link to', email);

        const result = await sendOtpEmail(email);
        if (result.error) {
          console.error('Error sending the OTP', result.error);
        } else {
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
        console.log('Logging in with', email, password);
        const result = await login(email, password);
        if (result.error) {
          console.error('Error logging in', result.error);
        } else {
          console.log('Success');
        }
      }}
    />
  );
}
