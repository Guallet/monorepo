import { BaseScreen } from '@/components/Screens/BaseScreen';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@guallet/auth';
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Modal,
  Paper,
  PasswordInput,
  TextInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@/lib/notifications';
import { IconCheck, IconExclamationMark } from '@tabler/icons-react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const Route = createFileRoute('/register')({
  component: RouteComponent,
});

function RouteComponent() {
  const { createAccount, login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const { t } = useTranslation();

  const registerFormSchema = z
    .object({
      name: z.string().min(2, {
        message: t(
          'screens.register.form.name.validation',
          'CNF: Name must have at least 2 characters',
        ),
      }),
      email: z.string().email({
        message: t(
          'screens.register.form.email.validation',
          'CNF: Invalid email',
        ),
      }),
      password: z.string().min(6, {
        message: t(
          'screens.register.form.password.validation',
          'CNF: Password must have at least 6 characters',
        ),
      }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t(
        'screens.register.form.confirmPassword.validation',
        'CNF: Passwords do not match',
      ),
      path: ['confirmPassword'],
    });

  type FormValues = z.infer<typeof registerFormSchema>;

  useEffect(() => {
    // If there is already a logged in user, just navigate away from here. Force the user to logout before create a new account
    if (!isLoading && isAuthenticated) {
      navigate({
        to: '/dashboard',
      });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const {
    control,
    formState: { errors },
  } = form;

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

      if (createResult.error) {
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

      if (loginResult.error) {
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
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <Stack>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label={t('screens.register.form.name.label', 'CNF: Name')}
                      placeholder={t(
                        'screens.register.form.name.placeholder',
                        'CNF: Enter your name',
                      )}
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.currentTarget.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      error={errors.name?.message}
                      required
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label={t(
                        'screens.register.form.email.label',
                        'CNF: Email address',
                      )}
                      placeholder={t(
                        'screens.register.form.email.placeholder',
                        'CNF: Enter your email',
                      )}
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.currentTarget.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      error={errors.email?.message}
                      required
                    />
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <PasswordInput
                      label={t(
                        'screens.register.form.password.label',
                        'CNF: Password',
                      )}
                      placeholder={t(
                        'screens.register.form.password.placeholder',
                        'CNF: Password',
                      )}
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.currentTarget.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      error={errors.password?.message}
                      required
                    />
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <PasswordInput
                      label={t(
                        'screens.register.form.confirmPassword.label',
                        'CNF: Confirm Password',
                      )}
                      placeholder={t(
                        'screens.register.form.confirmPassword.placeholder',
                        'CNF: Confirm your password',
                      )}
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.currentTarget.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      error={errors.confirmPassword?.message}
                      required
                    />
                  )}
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
                    )}
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
