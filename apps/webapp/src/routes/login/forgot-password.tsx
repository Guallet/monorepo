import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '@guallet/auth';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';

export const Route = createFileRoute('/login/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string) => {
    setError(null);
    setIsLoading(true);

    const { success, error: resetError } = await resetPassword(
      email,
      `${globalThis.location.origin}/login/reset-password`,
    );

    setIsLoading(false);

    if (resetError) {
      console.error('Error sending password reset email', resetError);
      setError(
        resetError.message ?? 'Failed to send reset email. Please try again.',
      );
      return;
    }

    if (success) {
      navigate({
        to: '/login/reset-password-sent',
        search: { email },
      });
    }
  };

  return (
    <ForgotPasswordScreen
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}
