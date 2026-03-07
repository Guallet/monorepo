import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@guallet/auth';
import { notifications } from '@/lib/notifications';
import { IconCheck, IconExclamationMark } from '@tabler/icons-react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      email: z.string().regex(EMAIL_REGEX, {
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
    if (!isLoading && isAuthenticated) {
      navigate({ to: '/dashboard' });
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
            'CNF: Account creation failed',
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

        navigate({ to: '/login', search: { redirect: '/dashboard' } });
        return;
      }

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
      <Dialog
        open={showEmailConfirmModal}
        onOpenChange={(open) => {
          if (!open) {
            handleEmailConfirmModalClose();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(
                'screens.register.emailConfirmModal.title',
                'CNF: Check your email',
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                'screens.register.emailConfirmModal.message',
                'CNF: Please check your email to confirm your account. You will need to verify your email address before you can log in.',
              )}
            </DialogDescription>
          </DialogHeader>

          <Button className="w-full" onClick={handleEmailConfirmModalClose}>
            {t(
              'screens.register.emailConfirmModal.button',
              'CNF: Go to login page',
            )}
          </Button>
        </DialogContent>
      </Dialog>

      <BaseScreen fullScreen>
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
          <Card className="shadow-md">
            <CardContent className="space-y-6 p-6">
              <h1 className="text-center text-2xl font-semibold tracking-tight">
                {t('screens.register.title', 'CNF: Create new account')}
              </h1>

              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="register-name">
                        {t('screens.register.form.name.label', 'CNF: Name')}
                      </Label>
                      <Input
                        id="register-name"
                        placeholder={t(
                          'screens.register.form.name.placeholder',
                          'CNF: Enter your name',
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
                      {errors.name?.message && (
                        <p className="text-sm text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="register-email">
                        {t(
                          'screens.register.form.email.label',
                          'CNF: Email address',
                        )}
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        placeholder={t(
                          'screens.register.form.email.placeholder',
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
                      {errors.email?.message && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="register-password">
                        {t(
                          'screens.register.form.password.label',
                          'CNF: Password',
                        )}
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder={t(
                          'screens.register.form.password.placeholder',
                          'CNF: Password',
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
                      {errors.password?.message && (
                        <p className="text-sm text-destructive">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="register-confirm-password">
                        {t(
                          'screens.register.form.confirmPassword.label',
                          'CNF: Confirm Password',
                        )}
                      </Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder={t(
                          'screens.register.form.confirmPassword.placeholder',
                          'CNF: Confirm your password',
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
                      {errors.confirmPassword?.message && (
                        <p className="text-sm text-destructive">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <div className="flex items-start gap-3">
                  <Checkbox id="register-terms-and-policy" />
                  <Label
                    htmlFor="register-terms-and-policy"
                    className="text-sm font-normal leading-relaxed text-muted-foreground"
                  >
                    {t(
                      'screens.register.form.termsAgreement',
                      'CNF: Agree the {{link}}.',
                      {
                        link: '',
                      },
                    )}{' '}
                    <a
                      href="https://guallet.io"
                      className="font-medium text-primary hover:underline"
                    >
                      {t(
                        'screens.register.form.termsLink',
                        'CNF: terms and policy',
                      )}
                      .
                    </a>
                  </Label>
                </div>

                <Button
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {t(
                    'screens.register.form.submitButton',
                    'CNF: Create new account',
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t(
              'screens.register.alreadyHaveAccount',
              'CNF: Already have an account?',
            )}{' '}
            <Link
              to="/login"
              search={{ redirect: '/dashboard' }}
              className="font-medium text-primary hover:underline"
            >
              {t('screens.register.signInLink', 'CNF: Sign in')}
            </Link>
          </p>
        </div>
      </BaseScreen>
    </>
  );
}
