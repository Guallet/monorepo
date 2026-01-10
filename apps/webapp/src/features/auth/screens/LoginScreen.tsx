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
} from '@mantine/core';
import { useState } from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { GoogleButton } from '../components/GoogleButton';
import { NavLinkButton } from '@/components/Buttons/NavLinkButton';
import { zod4Resolver } from 'mantine-form-zod-resolver';

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
  isLoading?: boolean;
  onGoogleLogin: () => void;
  onMagicLink: (email: string) => void;
  onPassword: (email: string, password: string) => void;
}

export function LoginScreen({
  isLoading,
  onGoogleLogin,
  onMagicLink,
  onPassword,
}: Readonly<LoginScreenProps>) {
  const { t } = useTranslation();
  const [loginType, setLoginType] = useState<'magic-link' | 'password'>(
    'password',
  );

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

  const handlePasswordSubmit = (data: PasswordFormData) => {
    onPassword(data.email, data.password);
  };

  const handleMagicLinkSubmit = (data: MagicLinkFormData) => {
    onMagicLink(data.email);
  };

  const toggleLoginType = () => {
    setLoginType(loginType === 'password' ? 'magic-link' : 'password');
  };

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
            <GoogleButton onClick={onGoogleLogin}>
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
