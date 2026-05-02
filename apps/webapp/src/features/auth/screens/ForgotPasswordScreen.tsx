import {
  Stack,
  TextInput,
  Button,
  Text,
  Alert,
  Box,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { IconAlertCircle, IconLock, IconMailCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';
import { AuthLayout } from '../components/AuthLayout';
import { useTheme } from '@guallet/ui-react';

const formSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
});

type FormData = z.infer<typeof formSchema>;

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
  const { colors, spacing, borderRadius } = useTheme();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    initialValues: { email: '' },
    validate: zod4Resolver(formSchema),
  });

  const handleBack = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      navigate({ to: '/login', search: { redirect: '/dashboard' } });
    }
  };

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data.email);
  };

  return (
    <AuthLayout>
      {/* Back link */}
      <Button
        variant="subtle"
        size="xs"
        mb={spacing.lg}
        leftSection={
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        onClick={handleBack}
        style={{ paddingLeft: 0 }}
      >
        {t('screens.forgotPassword.backButton.label', 'Back to sign in')}
      </Button>

      {/* Icon header */}
      <Box
        style={{
          width: 52,
          height: 52,
          borderRadius: borderRadius.lg,
          background: `color-mix(in oklab, ${colors.primary} 12%, white)`,
          color: colors.primary,
          display: 'grid',
          placeItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <IconLock size={26} />
      </Box>

      <Box mb={spacing.xl}>
        <Text
          component="h1"
          style={{
            margin: `0 0 ${spacing.sm}px`,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {t('screens.forgotPassword.title.label', 'Forgot your password?')}
        </Text>
        <Text size="sm" c="dimmed" style={{ lineHeight: 1.55 }}>
          {t(
            'screens.forgotPassword.description.label',
            "No problem. Enter your email and we'll send a reset link.",
          )}
        </Text>
      </Box>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t('screens.forgotPassword.error.title', 'Error')}
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            {...form.getInputProps('email')}
            label={t(
              'screens.forgotPassword.form.email.label',
              'Email address',
            )}
            type="email"
            placeholder={t(
              'screens.forgotPassword.form.email.placeholder',
              'you@example.com',
            )}
            autoFocus
          />
          <Button fullWidth type="submit" loading={isLoading}>
            {t(
              'screens.forgotPassword.form.submitButton.label',
              'Send reset link',
            )}
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}

// Separate "email sent" confirmation screen
interface ResetEmailSentProps {
  email: string;
}

export function ForgotPasswordSentScreen({
  email,
}: Readonly<ResetEmailSentProps>) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();

  const handleBack = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      navigate({ to: '/login', search: { redirect: '/dashboard' } });
    }
  };

  return (
    <AuthLayout>
      <Button
        variant="subtle"
        size="xs"
        mb={spacing.lg}
        leftSection={
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        onClick={handleBack}
        style={{ paddingLeft: 0 }}
      >
        {t('screens.forgotPassword.backButton.label', 'Back to sign in')}
      </Button>

      <Box ta="center" py={spacing.sm} pb={spacing.xl}>
        <Box
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: `color-mix(in oklab, ${colors.support} 12%, white)`,
            border: `2px solid color-mix(in oklab, ${colors.support} 28%, white)`,
            display: 'grid',
            placeItems: 'center',
            margin: `0 auto ${spacing.lg}px`,
          }}
        >
          <IconMailCheck size={36} color={colors.support} />
        </Box>

        <Text
          component="h2"
          style={{
            margin: `0 0 ${spacing.sm}px`,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          {t('screens.resetPasswordSent.title', 'Check your email')}
        </Text>
        <Text
          size="sm"
          c="dimmed"
          style={{
            maxWidth: 340,
            margin: `0 auto ${spacing.lg}px`,
            lineHeight: 1.6,
          }}
        >
          {t(
            'screens.resetPasswordSent.description',
            "We've sent a password reset link to",
          )}{' '}
          <Text span fw={600} c="dark">
            {email}
          </Text>
          . {t('screens.resetPasswordSent.expiry', 'It expires in 30 minutes.')}
        </Text>

        <Text size="xs" c="dimmed" mb={spacing.md}>
          {t(
            'screens.resetPasswordSent.spamNote',
            "Didn't receive it? Check your spam folder or",
          )}{' '}
          <Anchor component="button" size="xs" fw={600} onClick={handleBack}>
            {t('screens.resetPasswordSent.tryAnother', 'try another email')}
          </Anchor>
        </Text>

        <Button variant="subtle" onClick={handleBack}>
          {t('screens.resetPasswordSent.backButton', 'Back to sign in')}
        </Button>
      </Box>
    </AuthLayout>
  );
}
