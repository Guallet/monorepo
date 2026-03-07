import { IconMailCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';
import { useRouter, useCanGoBack, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ResetPasswordSentScreenProps {
  email: string;
}

export function ResetPasswordSentScreen({
  email,
}: Readonly<ResetPasswordSentScreenProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <GualletLogo size={50} />
        </div>

        <Card className="shadow-md">
          <CardContent className="space-y-5 p-6 text-center">
            <IconMailCheck className="mx-auto h-12 w-12 text-emerald-600" />

            <h1 className="text-2xl font-semibold tracking-tight">
              {t('screens.resetPasswordSent.title', 'Check your email')}
            </h1>

            <p className="text-sm text-muted-foreground">
              {t(
                'screens.resetPasswordSent.description',
                "We've sent a password reset link to",
              )}{' '}
              <span className="font-semibold text-foreground">{email}</span>.
            </p>

            <p className="text-sm text-muted-foreground">
              {t(
                'screens.resetPasswordSent.instructions',
                "Click the link in the email to reset your password. If you don't see it, check your spam folder.",
              )}
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (canGoBack) {
                  router.history.back();
                } else {
                  navigate({
                    to: '/login',
                    search: { redirect: '/dashboard' },
                  });
                }
              }}
            >
              {t('screens.resetPasswordSent.backButton', 'Back to login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
