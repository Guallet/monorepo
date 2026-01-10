import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { ResetPasswordSentScreen } from '@/features/auth/screens/ResetPasswordSentScreen';

export const Route = createFileRoute('/login/reset-password-sent')({
  validateSearch: z.object({
    email: z.string(),
  }),
  component: ResetPasswordSentPage,
});

function ResetPasswordSentPage() {
  const { email } = Route.useSearch();

  return <ResetPasswordSentScreen email={email} />;
}
