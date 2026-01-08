import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useAuth } from '@/auth/useAuth';
import {
  Container,
  Paper,
  Title,
  Stack,
  TextInput,
  PasswordInput,
  Group,
  Checkbox,
  Anchor,
  Text,
  Button,
  Modal,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconExclamationMark } from '@tabler/icons-react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/register')({
  component: RouteComponent,
});

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function RouteComponent() {
  const { createAccount, login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // If there is already a logged in user, just navigate away from here. Force the user to logout before create a new account
    if (!isLoading && isAuthenticated) {
      navigate({
        to: '/dashboard',
      });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },

    validate: {
      name: (value) =>
        value.length < 2
          ? t(
              'screens.register.form.name.validation',
              'CNF: Name must have at least 2 characters',
            )
          : null,

      email: (value) =>
        /^\S+@\S+$/.test(value)
          ? null
          : t('screens.register.form.email.validation', 'CNF: Invalid email'),

      password: (value) =>
        value.length < 6
          ? t(
              'screens.register.form.password.validation',
              'CNF: Password must have at least 6 characters',
            )
          : null,

      confirmPassword: (value, values) =>
        value === values.password
          ? null
          : t(
              'screens.register.form.confirmPassword.validation',
              'CNF: Passwords do not match',
            ),
    },
  });

  const getErrorMessage = (code: string, defaultMessage: string): string => {
    const errorMessages: Record<string, string> = {
      user_already_exists: t(
        'screens.register.errors.userAlreadyExists',
        'CNF: An account with this email already exists.',
      ),
      weak_password: t(
        'screens.register.errors.weakPassword',
        'CNF: Password is too weak. Please use a stronger password.',
      ),
      invalid_email: t(
        'screens.register.errors.invalidEmail',
        'CNF: Please enter a valid email address.',
      ),
      email_confirmation_required: t(
        'screens.register.errors.emailConfirmationRequired',
        'CNF: Please check your email to confirm your account.',
      ),
      signup_disabled: t(
        'screens.register.errors.signupDisabled',
        'CNF: Registration is currently disabled.',
      ),
      login_error: t(
        'screens.register.errors.loginError',
        'CNF: Unable to log in. Please try again.',
      ),
    };
    return errorMessages[code] ?? defaultMessage;
  };

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Step 1: Create the account
      const createResult = await createAccount({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (!createResult.success) {
        const errorMessage = getErrorMessage(
          createResult.error.code,
          createResult.error.message,
        );

        // Special case: email confirmation required
        if (createResult.error.code === 'email_confirmation_required') {
          // reset the form to avoid resubmission issues
          setShowEmailConfirmModal(true);
          form.reset();
          return;
        }

        notifications.show({
          title: t(
            'screens.register.notifications.accountCreationFailed.title',
            'CNF: Account creation failed',
          ),
          message: errorMessage,
          color: 'red',
          icon: <IconExclamationMark />,
          withBorder: true,
        });
        return;
      }

      // Step 2: Log in the user
      const loginResult = await login(values.email, values.password);

      if (!loginResult.success) {
        const errorMessage = getErrorMessage(
          loginResult.error.code,
          loginResult.error.message,
        );

        notifications.show({
          title: t(
            'screens.register.notifications.loginFailed.title',
            'CNF: Login failed',
          ),
          message: t(
            'screens.register.notifications.loginFailed.message',
            'CNF: Account created successfully, but login failed: {{error}}',
            { error: errorMessage },
          ),
          color: 'orange',
          icon: <IconExclamationMark />,
          withBorder: true,
        });

        // Redirect to login page since account was created
        navigate({ to: '/login', search: { redirect: '/dashboard' } });
        return;
      }

      // Success - redirect to dashboard
      notifications.show({
        title: t(
          'screens.register.notifications.success.title',
          'CNF: Welcome!',
        ),
        message: t(
          'screens.register.notifications.success.message',
          'CNF: Your account has been created successfully.',
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
          'CNF: Check your email',
        )}
        centered
      >
        <Stack>
          <Text>
            {t(
              'screens.register.emailConfirmModal.message',
              'CNF: Please check your email to confirm your account. You will need to verify your email address before you can log in.',
            )}
          </Text>
          <Button fullWidth onClick={handleEmailConfirmModalClose}>
            {t(
              'screens.register.emailConfirmModal.button',
              'CNF: Go to login page',
            )}
          </Button>
        </Stack>
      </Modal>
      <BaseScreen fullScreen>
        <Container size={450}>
          {/* <LoginScreenHeader /> */}
          <Paper withBorder shadow="md" p={30} radius="md">
            <Title order={2} ta="center" mb="md">
              {t('screens.register.title', 'CNF: Create new account')}
            </Title>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  {...form.getInputProps('name')}
                  key={form.key('name')}
                  label={t('screens.register.form.name.label', 'CNF: Name')}
                  placeholder={t(
                    'screens.register.form.name.placeholder',
                    'CNF: Enter your name',
                  )}
                  required
                />
                <TextInput
                  {...form.getInputProps('email')}
                  key={form.key('email')}
                  label={t(
                    'screens.register.form.email.label',
                    'CNF: Email address',
                  )}
                  placeholder={t(
                    'screens.register.form.email.placeholder',
                    'CNF: Enter your email',
                  )}
                  required
                />
                <PasswordInput
                  {...form.getInputProps('password')}
                  key={form.key('password')}
                  label={t(
                    'screens.register.form.password.label',
                    'CNF: Password',
                  )}
                  placeholder={t(
                    'screens.register.form.password.placeholder',
                    'CNF: Password',
                  )}
                  required
                />
                <PasswordInput
                  {...form.getInputProps('confirmPassword')}
                  key={form.key('confirmPassword')}
                  label={t(
                    'screens.register.form.confirmPassword.label',
                    'CNF: Confirm Password',
                  )}
                  placeholder={t(
                    'screens.register.form.confirmPassword.placeholder',
                    'CNF: Confirm your password',
                  )}
                  required
                />
                <Group>
                  <Checkbox />
                  <Text size="sm">
                    {t(
                      'screens.register.form.termsAgreement',
                      'CNF: Agree the {{link}}.',
                      {
                        link: '',
                      },
                    ).replace('', '')}
                    <Anchor href="https://guallet.io">
                      {t(
                        'screens.register.form.termsLink',
                        'CNF: terms and policy',
                      )}
                    </Anchor>
                    .
                  </Text>
                </Group>
                <Button
                  fullWidth
                  mt="md"
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {t(
                    'screens.register.form.submitButton',
                    'CNF: Create new account',
                  )}
                </Button>
              </Stack>
            </form>
          </Paper>
          <Text ta="center" size="sm" mt="md">
            {t(
              'screens.register.alreadyHaveAccount',
              'CNF: Already have an account?',
            )}{' '}
            <Link to="/login" search={{ redirect: '/dashboard' }}>
              {t('screens.register.signInLink', 'CNF: Sign in')}
            </Link>
          </Text>
        </Container>
      </BaseScreen>
    </>
  );
}
