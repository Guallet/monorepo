import { Button, Text, Box, Anchor } from '@mantine/core';
import { IconMailCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRouter, useCanGoBack, useNavigate } from '@tanstack/react-router';
import { AuthLayout } from '../components/AuthLayout';
import { useTheme } from '@guallet/ui-react';

interface ResetPasswordSentScreenProps {
  email: string;
}

export function ResetPasswordSentScreen({
  email,
}: Readonly<ResetPasswordSentScreenProps>) {
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
        {t('screens.resetPasswordSent.backButton', 'Back to sign in')}
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
            margin: `0 auto ${spacing.sm}px`,
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
          .
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
            'screens.resetPasswordSent.instructions',
            "Click the link in the email to reset your password. If you don't see it, check your spam folder.",
          )}
        </Text>

        <Text size="xs" c="dimmed" mb={spacing.md}>
          {t(
            'screens.resetPasswordSent.spamNote',
            "Didn't receive it? Check your spam or",
          )}{' '}
          <Anchor component="button" size="xs" fw={600} onClick={handleBack}>
            {t('screens.resetPasswordSent.tryAnother', 'try another email')}
          </Anchor>
        </Text>

        <Button variant="subtle" onClick={handleBack}>
          {t('screens.resetPasswordSent.backToSignIn', 'Back to sign in')}
        </Button>
      </Box>
    </AuthLayout>
  );
}
