import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@guallet/auth';
import { IconAlertCircle } from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GoogleButton } from '../components/GoogleButton';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordFormSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, { message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

const magicLinkFormSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, { message: 'Invalid email address' }),
});

type PasswordFormData = z.infer<typeof passwordFormSchema>;
type MagicLinkFormData = z.infer<typeof magicLinkFormSchema>;

interface LoginScreenProps {
  oAuthRedirectionTo: string;
  redirect: string;
}

export function LoginScreen({
  oAuthRedirectionTo,
  redirect: rawRedirect,
}: Readonly<LoginScreenProps>) {
  const { t } = useTranslation();
  const navigation = useNavigate();
  const { isLoading, login, loginWithProvider, getOtpCode } = useAuth();

  // Don't allow redirecting to login page itself
  const redirect =
    rawRedirect === 'login' || rawRedirect === '/login'
      ? '/dashboard'
      : rawRedirect;

  const [loginType, setLoginType] = useState<'magic-link' | 'password'>(
    'password',
  );
  const [localMagicLinkError, setLocalMagicLinkError] = useState<string | null>(
    null,
  );
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const {
    control: passwordControl,
    formState: { errors: passwordErrors },
  } = passwordForm;

  const magicLinkForm = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkFormSchema),
    defaultValues: {
      email: '',
    },
  });
  const {
    control: magicLinkControl,
    formState: { errors: magicLinkErrors },
  } = magicLinkForm;

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    console.log('Logging in with email and password');
    setPasswordError(null); // Clear previous error
    const { success, error } = await login(data.email, data.password);
    if (error) {
      console.error('Error logging in', error);
      setPasswordError(error.message || 'Login failed');
    } else if (success) {
      console.log('Success login');
      console.log('Redirecting to', redirect || '/dashboard');
    }
  };

  const handleMagicLinkSubmit = async (data: MagicLinkFormData) => {
    console.log('Sending magic link to', data.email);
    try {
      setLocalMagicLinkError(null);
      const { success, error } = await getOtpCode(data.email);
      if (error) {
        console.error('Error sending the OTP', error);
        setLocalMagicLinkError(error.message || 'Failed to send magic link');
      } else if (success) {
        navigation({
          to: '/login/validateotp',
          search: {
            email: data.email,
            redirectTo: redirect,
          },
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send magic link';
      setLocalMagicLinkError(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('Logging in with Google');
    // Save the redirect url in the local storage to be able to restore it later
    localStorage.setItem('redirectDestination', redirect);
    const result = await loginWithProvider('google', oAuthRedirectionTo);
    if (result.success) {
      console.log('Success login with Google');
      return;
    }

    console.error('Error logging in with Google', result.error);
  };

  const toggleLoginType = () => {
    setLoginType(loginType === 'password' ? 'magic-link' : 'password');
  };

  const displayError =
    loginType === 'magic-link' ? localMagicLinkError : passwordError;

  return (
    <BaseScreen isLoading={isLoading}>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <GualletLogo size={50} />
          <h1 className="text-xl font-semibold tracking-tight">
            {t('screens.login.title.label', 'CNF: Sign in to your account')}
          </h1>
        </div>

        <Card className="shadow-md">
          <CardContent className="space-y-5 p-6">
            {displayError && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {loginType === 'magic-link'
                    ? t(
                        'screens.login.form.magicLink.error.title',
                        'CNF: Error sending magic link',
                      )
                    : t(
                        'screens.login.form.password.error.title',
                        'CNF: Login failed',
                      )}
                </AlertTitle>
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            {loginType === 'password' ? (
              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                className="space-y-4"
              >
                <Controller
                  name="email"
                  control={passwordControl}
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="login-email">
                        {t('screens.login.form.email.label', 'CNF: Email')}
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder={t(
                          'screens.login.form.email.placeholder',
                          'CNF: Enter your email',
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
                      {passwordErrors.email?.message && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.email.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="password"
                  control={passwordControl}
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="login-password">
                        {t(
                          'screens.login.form.password.label',
                          'CNF: Password',
                        )}
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        placeholder={t(
                          'screens.login.form.password.placeholder',
                          'CNF: Enter your password',
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
                      {passwordErrors.password?.message && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.password.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <div className="flex justify-end">
                  <Link
                    to="/login/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {t(
                      'screens.login.form.forgotPassword.label',
                      'CNF: Forgot password?',
                    )}
                  </Link>
                </div>

                <Button className="w-full" type="submit" disabled={isLoading}>
                  {t('screens.login.form.submitButton.label', 'CNF: Sign in')}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={magicLinkForm.handleSubmit(handleMagicLinkSubmit)}
                className="space-y-4"
              >
                <Controller
                  name="email"
                  control={magicLinkControl}
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="magic-link-email">
                        {t('screens.login.form.email.label', 'CNF: Email')}
                      </Label>
                      <Input
                        id="magic-link-email"
                        type="email"
                        autoComplete="email"
                        placeholder={t(
                          'screens.login.form.email.placeholder',
                          'CNF: Enter your email',
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
                      {magicLinkErrors.email?.message && (
                        <p className="text-sm text-destructive">
                          {magicLinkErrors.email.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Button className="w-full" type="submit" disabled={isLoading}>
                  {t(
                    'screens.login.form.sendMagicLink.label',
                    'CNF: Send magic link',
                  )}
                </Button>
              </form>
            )}

            <p className="text-center text-sm">
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={toggleLoginType}
              >
                {loginType === 'password'
                  ? t(
                      'screens.login.form.useMagicLink.label',
                      'CNF: Use magic link instead',
                    )
                  : t(
                      'screens.login.form.usePassword.label',
                      'CNF: Use password instead',
                    )}
              </button>
            </p>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('screens.login.form.divider.label', 'CNF: Or continue with')}
              </span>
              <Separator className="flex-1" />
            </div>

            <GoogleButton onClick={handleGoogleLogin} className="w-full">
              {t(
                'screens.login.form.googleLoginButton.label',
                'CNF: Continue with Google',
              )}
            </GoogleButton>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t(
            'screens.login.createAccount.label',
            "CNF: Don't have an account?",
          )}{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            {t('screens.login.createAccount.cta', 'CNF: Sign up!')}
          </Link>
        </p>
      </div>
    </BaseScreen>
  );
}
