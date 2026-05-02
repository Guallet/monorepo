import {
  Divider,
  Stack,
  TextInput,
  Button,
  Text,
  PasswordInput,
  Alert,
  Box,
  SimpleGrid,
} from '@mantine/core';
import { useState } from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';
import { useNavigate } from '@tanstack/react-router';
import { NavLinkButton } from '@/components/Buttons/NavLinkButton';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { IconAlertCircle, IconMail } from '@tabler/icons-react';
import { useAuth } from '@guallet/auth';
import { useTheme } from '@guallet/ui-react';
import { AuthLayout } from '../components/AuthLayout';
import { GoogleButton } from '../components/GoogleButton';

const passwordFormSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

const magicLinkFormSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
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
  const { spacing } = useTheme();
  const navigation = useNavigate();
  const { isLoading, login, loginWithProvider, getOtpCode } = useAuth();

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
    initialValues: { email: '', password: '' },
    validate: zod4Resolver(passwordFormSchema),
  });

  const magicLinkForm = useForm<MagicLinkFormData>({
    initialValues: { email: '' },
    validate: zod4Resolver(magicLinkFormSchema),
  });

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError(null);
    const { success, error } = await login(data.email, data.password);
    if (error) {
      setPasswordError(error.message || 'Login failed');
    } else if (success) {
      navigation({ to: redirect || '/dashboard', replace: true });
    }
  };

  const handleMagicLinkSubmit = async (data: MagicLinkFormData) => {
    try {
      setLocalMagicLinkError(null);
      const { success, error } = await getOtpCode(data.email);
      if (error) {
        setLocalMagicLinkError(error.message || 'Failed to send magic link');
      } else if (success) {
        navigation({
          to: '/login/validateotp',
          search: { email: data.email, redirectTo: redirect },
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send magic link';
      setLocalMagicLinkError(msg);
    }
  };

  const handleGoogleLogin = async () => {
    await loginWithProvider('google', oAuthRedirectionTo);
  };

  return (
    <AuthLayout>
      {/* Header */}
      <Box mb={spacing.xl}>
        <Text
          component="h1"
          style={{ margin: `0 0 ${spacing.xs}px`, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}
        >
          {t('screens.login.title.label', 'Welcome back')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('screens.login.subtitle', 'Sign in to your Guallet account')}
        </Text>
      </Box>

      <Stack gap="sm">
        {/* Social buttons */}
        <SimpleGrid cols={1}>
          <GoogleButton onClick={handleGoogleLogin} loading={isLoading}>
            {t('screens.login.form.googleLoginButton.label', 'Continue with Google')}
          </GoogleButton>
        </SimpleGrid>

        <Divider
          label={t('screens.login.form.divider.label', 'or continue with email')}
          labelPosition="center"
        />

        {/* Error alerts */}
        {passwordError && loginType === 'password' && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={t('screens.login.form.password.error.title', 'Login failed')}
            color="red"
          >
            {passwordError}
          </Alert>
        )}
        {localMagicLinkError && loginType === 'magic-link' && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={t('screens.login.form.magicLink.error.title', 'Error sending code')}
            color="red"
          >
            {localMagicLinkError}
          </Alert>
        )}

        {loginType === 'password' ? (
          <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
            <Stack gap="sm">
              <TextInput
                {...passwordForm.getInputProps('email')}
                label={t('screens.login.form.email.label', 'Email')}
                type="email"
                placeholder={t('screens.login.form.email.placeholder', 'you@example.com')}
                autoFocus
              />

              <Box>
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: spacing.xs,
                  }}
                >
                  <Text component="label" size="sm" fw={500}>
                    {t('screens.login.form.password.label', 'Password')}
                  </Text>
                  <NavLinkButton to="/login/forgot-password" size="xs">
                    {t('screens.login.form.forgotPassword.label', 'Forgot password?')}
                  </NavLinkButton>
                </Box>
                <PasswordInput
                  {...passwordForm.getInputProps('password')}
                  placeholder={t('screens.login.form.password.placeholder', 'Enter your password')}
                />
              </Box>

              <Button fullWidth type="submit" loading={isLoading} mt={spacing.xs}>
                {t('screens.login.form.submitButton.label', 'Sign in')}
              </Button>
            </Stack>
          </form>
        ) : (
          <form onSubmit={magicLinkForm.onSubmit(handleMagicLinkSubmit)}>
            <Stack gap="sm">
              <TextInput
                {...magicLinkForm.getInputProps('email')}
                label={t('screens.login.form.email.label', 'Email')}
                type="email"
                placeholder={t('screens.login.form.email.placeholder', 'you@example.com')}
                autoFocus
              />
              <Button fullWidth type="submit" loading={isLoading} mt={spacing.xs}>
                {t('screens.login.form.sendMagicLink.label', 'Send one-time code')}
              </Button>
            </Stack>
          </form>
        )}

        <Divider />

        {/* OTP / password toggle */}
        <Button
          variant="default"
          fullWidth
          leftSection={<IconMail size={16} />}
          onClick={() =>
            setLoginType(loginType === 'password' ? 'magic-link' : 'password')
          }
        >
          {loginType === 'password'
            ? t('screens.login.form.useMagicLink.label', 'Sign in with one-time code instead')
            : t('screens.login.form.usePassword.label', 'Sign in with password instead')}
        </Button>
      </Stack>

      {/* Footer */}
      <Text ta="center" size="sm" mt={spacing.lg} c="dimmed">
        {t('screens.login.createAccount.label', "Don't have an account?")}{' '}
        <NavLinkButton to="/register" size="sm">
          {t('screens.login.createAccount.cta', 'Create one')}
        </NavLinkButton>
      </Text>
    </AuthLayout>
  );
}
