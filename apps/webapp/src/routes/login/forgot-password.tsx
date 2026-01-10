import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/auth/supabase';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';

export const Route = createFileRoute('/login/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string) => {
    setError(null);
    setIsLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${globalThis.location.origin}/login/reset-password`,
      },
    );

    setIsLoading(false);

    if (resetError) {
      console.error('Error sending password reset email', resetError);
      setError(
        resetError.message ?? 'Failed to send reset email. Please try again.',
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
