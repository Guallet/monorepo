import { ValidateOtpScreen } from '@/features/auth/screens/ValidateOtpScreen';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '@guallet/auth';

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
  const { verifyOtp, sendOtpEmail } = useAuth();

  const handleValidateOtp = async (code: string) => {
    setError(null);
    setIsLoading(true);

    const result = await verifyOtp(email, code);

    setIsLoading(false);

    if (result.error) {
      console.error('Error verifying OTP', result.error);
      setError(result.error.message ?? 'Invalid code. Please try again.');
      return;
    }

    navigate({
      to: redirectTo ?? '/dashboard',
    });
  };

  const handleResendCode = async () => {
    setError(null);
    setIsLoading(true);

    const result = await sendOtpEmail(email);

    setIsLoading(false);

    if (result.error) {
      console.error('Error resending OTP', result.error);
      setError(result.error.message ?? 'Failed to resend code. Please try again.');
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
