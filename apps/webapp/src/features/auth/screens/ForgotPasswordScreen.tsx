import { IconAlertCircle, IconLock } from '@tabler/icons-react';
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormData {
  email: string;
}

interface ForgotPasswordScreenProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function ForgotPasswordScreen({
  onSubmit,
  isLoading,
  error,
}: Readonly<ForgotPasswordScreenProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    defaultValues: {
      email: '',
    },
  });
  const {
    control,
    formState: { errors },
  } = form;

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data.email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <GualletLogo size={50} />
        </div>

        <Card className="shadow-md">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <IconLock className="h-12 w-12 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">
                {t(
                  'screens.forgotPassword.title.label',
                  'Forgot your password?',
                )}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t(
                  'screens.forgotPassword.description.label',
                  "Enter your email address and we'll send you a link to reset your password.",
                )}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {t('screens.forgotPassword.error.title', 'Error')}
                </AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: EMAIL_REGEX,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="forgot-password-email">
                      {t('screens.forgotPassword.form.email.label', 'Email')}
                    </Label>
                    <Input
                      id="forgot-password-email"
                      type="email"
                      autoComplete="email"
                      placeholder={t(
                        'screens.forgotPassword.form.email.placeholder',
                        'Enter your email',
                      )}
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      required
                    />
                    {errors.email?.message && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Button className="w-full" type="submit" disabled={isLoading}>
                {t(
                  'screens.forgotPassword.form.submitButton.label',
                  'Send reset link',
                )}
              </Button>
            </form>

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
              {t('screens.forgotPassword.backButton.label', 'Back to login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
