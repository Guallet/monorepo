import { supabase } from '@/auth/supabase';
import { ValidateOtpScreen } from '@/features/auth/screens/ValidateOtpScreen';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useState } from 'react';

export const Route = createFileRoute('/login/validateotp')({
  validateSearch: z.object({
    email: z.string(),
    redirectTo: z.string().optional(),
  }),
  component: ValidateOtpPage,
});

function ValidateOtpPage() {
  const { email, redirectTo } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleValidateOtp = async (code: string) => {
    setError(null);
    setIsLoading(true);

    const { error: verifyError, data } = await supabase.auth.verifyOtp({
      email: email,
      token: code,
      type: 'email',
    });

    setIsLoading(false);

    if (verifyError) {
      console.error('Error verifying OTP', verifyError);
      setError(verifyError.message ?? 'Invalid code. Please try again.');
      return;
    }

    if (data) {
      navigate({
        to: redirectTo ?? '/dashboard',
      });
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setIsLoading(true);

    const { error: resendError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${globalThis.location.origin}/login/callback`,
      },
    });

    setIsLoading(false);

    if (resendError) {
      console.error('Error resending OTP', resendError);
      setError(resendError.message ?? 'Failed to resend code. Please try again.');
    }
  };

  return (
    <ValidateOtpScreen
      email={email}
      onValidateOtp={handleValidateOtp}
      onResendCode={handleResendCode}
      error={error}
      isLoading={isLoading}
    />
  );
}
