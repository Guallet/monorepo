import {
  Stack,
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Text,
  Button,
  Divider,
  Box,
  Modal,
  Progress,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconExclamationMark } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAuth } from '@guallet/auth';
import { useTheme } from '@guallet/ui-react';
import { AuthLayout } from '../components/AuthLayout';
import { GoogleButton } from '../components/GoogleButton';
import { NavLinkButton } from '@/components/Buttons/NavLinkButton';

const registerFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Name must have at least 2 characters' }),
    email: z.email({ message: 'Invalid email' }),
    password: z.string().min(8, { message: 'At least 8 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof registerFormSchema>;

function passwordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z\d]/.test(pw)) score++;
  return score;
}

const STRENGTH_LEVELS = [
  { label: 'Very weak', color: 'red' },
  { label: 'Weak', color: 'orange' },
  { label: 'Fair', color: 'yellow' },
  { label: 'Good', color: 'lime' },
  { label: 'Strong', color: 'green' },
] as const;

export function RegisterScreen() {
  const {
    createAccount,
    login,
    loginWithProvider,
    isAuthenticated,
    isLoading,
  } = useAuth();
  const { spacing } = useTheme();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    validate: zod4Resolver(registerFormSchema),
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const pwValue = form.getValues().password;
  const strength = passwordStrength(pwValue);
  const strengthLevel = STRENGTH_LEVELS[Math.min(strength - 1, 4)];

  const getErrorMessage = (code: string, defaultMessage: string): string => {
    const errorMessages: Record<string, string> = {
      user_already_exists: t(
        'screens.register.errors.userAlreadyExists',
        'An account with this email already exists.',
      ),
      weak_password: t(
        'screens.register.errors.weakPassword',
        'Password is too weak. Please use a stronger password.',
      ),
      invalid_email: t(
        'screens.register.errors.invalidEmail',
        'Please enter a valid email address.',
      ),
      email_confirmation_required: t(
        'screens.register.errors.emailConfirmationRequired',
        'Please check your email to confirm your account.',
      ),
      signup_disabled: t(
        'screens.register.errors.signupDisabled',
        'Registration is currently disabled.',
      ),
      login_error: t(
        'screens.register.errors.loginError',
        'Unable to log in. Please try again.',
      ),
    };
    return errorMessages[code] ?? defaultMessage;
  };

  const handleSubmit = async (values: FormValues) => {
    if (!agreed) {
      notifications.show({
        title: t(
          'screens.register.notifications.termsRequired.title',
          'Terms required',
        ),
        message: t(
          'screens.register.notifications.termsRequired.message',
          'You must agree to the terms to continue.',
        ),
        color: 'orange',
        icon: <IconExclamationMark />,
        withBorder: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const createResult = await createAccount({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (createResult.error) {
        const errorMessage = getErrorMessage(
          createResult.error.code,
          createResult.error.message,
        );
        if (createResult.error.code === 'email_confirmation_required') {
          setShowEmailConfirmModal(true);
          form.reset();
          return;
        }
        notifications.show({
          title: t(
            'screens.register.notifications.accountCreationFailed.title',
            'Account creation failed',
          ),
          message: errorMessage,
          color: 'red',
          icon: <IconExclamationMark />,
          withBorder: true,
        });
        return;
      }

      const loginResult = await login(values.email, values.password);
      if (loginResult.error) {
        const errorMessage = getErrorMessage(
          loginResult.error.code,
          loginResult.error.message,
        );
        notifications.show({
          title: t(
            'screens.register.notifications.loginFailed.title',
            'Login failed',
          ),
          message: t(
            'screens.register.notifications.loginFailed.message',
            'Account created successfully, but login failed: {{error}}',
            { error: errorMessage },
          ),
          color: 'orange',
          icon: <IconExclamationMark />,
          withBorder: true,
        });
        navigate({ to: '/login', search: { redirect: '/dashboard' } });
        return;
      }

      notifications.show({
        title: t('screens.register.notifications.success.title', 'Welcome!'),
        message: t(
          'screens.register.notifications.success.message',
          'Your account has been created successfully.',
        ),
        color: 'green',
        icon: <IconCheck />,
        withBorder: true,
      });
      navigate({ to: '/dashboard' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailConfirmModalClose = () => {
    setShowEmailConfirmModal(false);
    navigate({ to: '/login', search: { redirect: '/dashboard' } });
  };

  return (
    <>
      <Modal
        opened={showEmailConfirmModal}
        onClose={handleEmailConfirmModalClose}
        title={t(
          'screens.register.emailConfirmModal.title',
          'Check your email',
        )}
        centered
      >
        <Stack>
          <Text>
            {t(
              'screens.register.emailConfirmModal.message',
              'Please check your email to confirm your account. You will need to verify your email address before you can log in.',
            )}
          </Text>
          <Button fullWidth onClick={handleEmailConfirmModalClose}>
            {t('screens.register.emailConfirmModal.button', 'Go to login page')}
          </Button>
        </Stack>
      </Modal>

      <AuthLayout>
        {/* Header */}
        <Box mb={spacing.lg}>
          <Text
            component="h1"
            style={{
              margin: `0 0 ${spacing.xs}px`,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {t('screens.register.title', 'Create your account')}
          </Text>
          <Text size="sm" c="dimmed">
            {t('screens.register.subtitle', 'Free forever · No card required')}
          </Text>
        </Box>

        {/* Social sign-up */}
        <GoogleButton
          fullWidth
          mb={spacing.xs}
          onClick={() => loginWithProvider('google', '/dashboard')}
        >
          {t('screens.register.form.googleButton.label', 'Sign up with Google')}
        </GoogleButton>

        <Divider
          label={t(
            'screens.register.form.divider.label',
            'or sign up with email',
          )}
          labelPosition="center"
          my="sm"
        />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput
              {...form.getInputProps('name')}
              key={form.key('name')}
              label={t('screens.register.form.name.label', 'Full name')}
              placeholder={t(
                'screens.register.form.name.placeholder',
                'Alex Galiana',
              )}
              autoFocus
            />
            <TextInput
              {...form.getInputProps('email')}
              key={form.key('email')}
              label={t('screens.register.form.email.label', 'Email address')}
              type="email"
              placeholder={t(
                'screens.register.form.email.placeholder',
                'you@example.com',
              )}
            />

            {/* Password with strength bar */}
            <Box>
              <PasswordInput
                {...form.getInputProps('password')}
                key={form.key('password')}
                label={t('screens.register.form.password.label', 'Password')}
                placeholder={t(
                  'screens.register.form.password.placeholder',
                  'Minimum 8 characters',
                )}
              />
              {pwValue.length > 0 && (
                <Box mt={8}>
                  <Progress
                    value={(strength / 5) * 100}
                    color={strengthLevel?.color ?? 'gray'}
                    size={4}
                    radius="xl"
                  />
                  {strengthLevel && (
                    <Text size="xs" c={strengthLevel.color} fw={600} mt={4}>
                      {t(
                        `screens.register.form.password.strength.${strengthLevel.label.toLowerCase().replace(' ', '_')}`,
                        strengthLevel.label,
                      )}
                    </Text>
                  )}
                </Box>
              )}
            </Box>

            <PasswordInput
              {...form.getInputProps('confirmPassword')}
              key={form.key('confirmPassword')}
              label={t(
                'screens.register.form.confirmPassword.label',
                'Confirm password',
              )}
              placeholder={t(
                'screens.register.form.confirmPassword.placeholder',
                'Repeat your password',
              )}
            />

            {/* T&C */}
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.currentTarget.checked)}
              label={
                <Text size="sm" c="dimmed">
                  {t(
                    'screens.register.form.termsAgreement.prefix',
                    'I agree to the',
                  )}{' '}
                  <Anchor
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    fw={600}
                  >
                    {t('screens.register.form.termsLink', 'Terms of Service')}
                  </Anchor>{' '}
                  {t('screens.register.form.termsAgreement.conjunction', 'and')}{' '}
                  <Anchor
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    fw={600}
                  >
                    {t('screens.register.form.privacyLink', 'Privacy Policy')}
                  </Anchor>
                </Text>
              }
            />

            <Button fullWidth type="submit" loading={isSubmitting} mt={4}>
              {t('screens.register.form.submitButton', 'Create account')}
            </Button>
          </Stack>
        </form>

        <Text ta="center" size="sm" mt={24} c="dimmed">
          {t('screens.register.alreadyHaveAccount', 'Already have an account?')}{' '}
          <NavLinkButton
            to="/login"
            search={{ redirect: '/dashboard' }}
            size="sm"
          >
            {t('screens.register.signInLink', 'Sign in')}
          </NavLinkButton>
        </Text>
      </AuthLayout>
    </>
  );
}
