import { IconAlertCircle, IconMail } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ValidateOtpScreenProps {
  email: string;
  onValidateOtp: (code: string) => void;
  onResendCode?: () => void;
  error?: string | null;
  isLoading?: boolean;
}

export function ValidateOtpScreen({
  email,
  onValidateOtp,
  onResendCode,
  error,
  isLoading,
}: Readonly<ValidateOtpScreenProps>) {
  const { t } = useTranslation();
  const [code, setCode] = useState<string>('');

  const isCodeValid = code.length === 6;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-md">
        <CardContent className="space-y-5 p-6 text-center">
          <IconMail className="mx-auto h-12 w-12 text-primary" />

          <h1 className="text-2xl font-semibold tracking-tight">
            {t('screens.validateOtp.title', 'Check your email')}
          </h1>

          <p className="text-sm text-muted-foreground">
            {t(
              'screens.validateOtp.description',
              "We've sent a 6-digit code to",
            )}{' '}
            <span className="font-semibold text-foreground">{email}</span>.{' '}
            {t(
              'screens.validateOtp.instructionText',
              'Enter the code below to sign in.',
            )}
          </p>

          <p className="text-sm text-muted-foreground">
            {t(
              'screens.validateOtp.instructionNote',
              'The email also contains a magic link you can click to sign in automatically.',
            )}
          </p>

          {error && (
            <Alert variant="destructive" className="text-left">
              <IconAlertCircle className="h-4 w-4" />
              <AlertTitle>
                {t('screens.validateOtp.error.title', 'Error')}
              </AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Input
            placeholder={t(
              'screens.validateOtp.form.codeInput.placeholder',
              'Enter the 6 digit code',
            )}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
            }}
            maxLength={6}
            className="text-center text-lg font-semibold tracking-[0.45em]"
            inputMode="numeric"
            autoComplete="one-time-code"
          />

          <Button
            className="w-full"
            onClick={() => {
              onValidateOtp(code);
            }}
            disabled={!isCodeValid || isLoading}
          >
            {t('screens.validateOtp.form.verifyButton.label', 'Verify code')}
          </Button>

          {onResendCode && (
            <p className="text-sm text-muted-foreground">
              {t(
                'screens.validateOtp.resendCode.question',
                "Didn't receive the code?",
              )}{' '}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={onResendCode}
                disabled={isLoading}
              >
                {t(
                  'screens.validateOtp.resendCode.resendButton',
                  'Resend code',
                )}
              </button>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
