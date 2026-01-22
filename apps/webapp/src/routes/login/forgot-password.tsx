import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { useAuth } from '@guallet/auth';

export const Route = createFileRoute('/login/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (email: string) => {
    setError(null);
    setIsLoading(true);

    const result = await forgotPassword(
      email,
      `${globalThis.location.origin}/login/reset-password`,
    );

    setIsLoading(false);

    if (result.error) {
      console.error('Error sending password reset email', result.error);
      setError(
        result.error.message ?? 'Failed to send reset email. Please try again.',
      );
      return;
    }

    navigate({
      to: '/login/reset-password-sent',
      search: { email },
    });
  };

  return (
    <ForgotPasswordScreen
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}
