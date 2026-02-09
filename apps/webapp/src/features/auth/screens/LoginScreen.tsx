import {
  Paper,
  Group,
  Divider,
  Stack,
  TextInput,
  Button,
  Text,
  PasswordInput,
  Container,
  Anchor,
  Alert,
} from '@mantine/core';
import { useState } from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';
import { useNavigate } from '@tanstack/react-router';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { GoogleButton } from '../components/GoogleButton';
import { NavLinkButton } from '@/components/Buttons/NavLinkButton';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@guallet/auth';

// Define schemas for form validation using Zod
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
    initialValues: {
      email: '',
      password: '',
    },
    validate: zod4Resolver(passwordFormSchema),
  });

  const magicLinkForm = useForm<MagicLinkFormData>({
    initialValues: {
      email: '',
    },
    validate: zod4Resolver(magicLinkFormSchema),
  });

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
      // navigation({
      //   to: redirect || '/dashboard',
      //   replace: true,
      // });
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
    if (!result.success) {
      console.error('Error logging in with Google', result.error);
    } else {
      console.log('Success login with Google');
    }
  };

  const toggleLoginType = () => {
    setLoginType(loginType === 'password' ? 'magic-link' : 'password');
  };

  const displayError = localMagicLinkError;

  return (
    <BaseScreen isLoading={isLoading}>
      <Container
        size={420}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Stack justify="center" align="center">
          <GualletLogo size={50} />
          <Text ta="center" size="lg" w={500}>
            {t('screens.login.title.label', 'CNF: Sign in to your account')}
          </Text>
        </Stack>

        <Paper withBorder shadow="md" p={30} mt={20} radius="md">
          {displayError && loginType === 'magic-link' && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={t(
                'screens.login.form.magicLink.error.title',
                'CNF: Error sending magic link',
              )}
              color="red"
              mb="md"
            >
              {displayError}
            </Alert>
          )}

          {passwordError && loginType === 'password' && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={t(
                'screens.login.form.password.error.title',
                'CNF: Login failed',
              )}
              color="red"
              mb="md"
            >
              {passwordError}
            </Alert>
          )}

          {loginType === 'password' ? (
            <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
              <TextInput
                {...passwordForm.getInputProps('email')}
                label={t('screens.login.form.email.label', 'CNF: Email')}
                type="email"
                placeholder={t(
                  'screens.login.form.email.placeholder',
                  'CNF: Enter your email',
                )}
                required
              />

              <PasswordInput
                {...passwordForm.getInputProps('password')}
                label={t('screens.login.form.password.label', 'CNF: Password')}
                placeholder={t(
                  'screens.login.form.password.placeholder',
                  'CNF: Enter your password',
                )}
                required
                mt="md"
              />

              <Group justify="flex-end" mt="md">
                <NavLinkButton to="/login/forgot-password" size="sm">
                  {t(
                    'screens.login.form.forgotPassword.label',
                    'CNF: Forgot password?',
                  )}
                </NavLinkButton>
              </Group>

              <Button fullWidth mt="md" type="submit" color="blue">
                {t('screens.login.form.submitButton.label', 'CNF: Sign in')}
              </Button>
            </form>
          ) : (
            <form onSubmit={magicLinkForm.onSubmit(handleMagicLinkSubmit)}>
              <TextInput
                {...magicLinkForm.getInputProps('email')}
                label={t('screens.login.form.email.label', 'CNF: Email')}
                type="email"
                placeholder={t(
                  'screens.login.form.email.placeholder',
                  'CNF: Enter your email',
                )}
                required
              />

              <Button fullWidth mt="md" type="submit" color="blue">
                {t(
                  'screens.login.form.sendMagicLink.label',
                  'CNF: Send magic link',
                )}
              </Button>
            </form>
          )}

          <Text ta="center" size="sm" mt="md">
            <Anchor component="button" type="button" onClick={toggleLoginType}>
              {loginType === 'password'
                ? t(
                    'screens.login.form.useMagicLink.label',
                    'CNF: Use magic link instead',
                  )
                : t(
                    'screens.login.form.usePassword.label',
                    'CNF: Use password instead',
                  )}
            </Anchor>
          </Text>

          <Divider
            label={t(
              'screens.login.form.divider.label',
              'CNF: Or continue with',
            )}
            labelPosition="center"
            my="lg"
          />

          <Group grow>
            <GoogleButton onClick={handleGoogleLogin}>
              {t(
                'screens.login.form.googleLoginButton.label',
                'CNF: Continue with Google',
              )}
            </GoogleButton>
          </Group>
        </Paper>

        <Text ta="center" size="sm" mt="md">
          {t(
            'screens.login.createAccount.label',
            "CNF: Don't have an account?",
          )}{' '}
          <NavLinkButton to="/register">
            {t('screens.login.createAccount.cta', 'CNF: Sign up!')}
          </NavLinkButton>
        </Text>
      </Container>
    </BaseScreen>
  );
}
