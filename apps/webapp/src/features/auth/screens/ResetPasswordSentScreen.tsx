import { Center, Paper, Stack, Text, Button, Title } from '@mantine/core';
import { IconMailCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';
import { useRouter, useCanGoBack, useNavigate } from '@tanstack/react-router';

interface ResetPasswordSentScreenProps {
  email: string;
}

export function ResetPasswordSentScreen({
  email,
}: Readonly<ResetPasswordSentScreenProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();

  return (
    <Center style={{ minHeight: '100vh' }}>
      <Stack align="center">
        <GualletLogo size={50} />

        <Paper
          radius="md"
          p="xl"
          withBorder
          style={{
            margin: '1.5rem',
            maxWidth: 420,
            width: '100%',
          }}
        >
          <Stack align="center" gap="md">
            <IconMailCheck size={48} color="var(--mantine-color-green-6)" />

            <Title order={2} ta="center">
              {t('screens.resetPasswordSent.title', 'Check your email')}
            </Title>

            <Text ta="center" c="dimmed">
              {t(
                'screens.resetPasswordSent.description',
                "We've sent a password reset link to",
              )}{' '}
              <Text span fw={600}>
                {email}
              </Text>
              .
            </Text>

            <Text ta="center" c="dimmed" size="sm">
              {t(
                'screens.resetPasswordSent.instructions',
                "Click the link in the email to reset your password. If you don't see it, check your spam folder.",
              )}
            </Text>

            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                if (canGoBack) {
                  router.history.back();
                } else {
                  navigate({
                    to: '/login',
                    search: { redirect: '/dashboard' },
                  });
                }
              }}
            >
              {t('screens.resetPasswordSent.backButton', 'Back to login')}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Center>
  );
}
