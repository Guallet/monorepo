import { Center, Paper, Stack, Text, Button, Title } from '@mantine/core';
import { IconMailCheck } from '@tabler/icons-react';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';
import { NavLinkButton } from '@/components/Buttons/NavLinkButton';

interface ResetPasswordSentScreenProps {
  email: string;
}

export function ResetPasswordSentScreen({
  email,
}: ResetPasswordSentScreenProps) {
  return (
    <Center style={{ minHeight: '100vh' }}>
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
          <GualletLogo size={50} />

          <IconMailCheck size={48} color="var(--mantine-color-green-6)" />

          <Title order={2} ta="center">
            Check your email
          </Title>

          <Text ta="center" c="dimmed">
            We&apos;ve sent a password reset link to{' '}
            <Text span fw={600}>
              {email}
            </Text>
            .
          </Text>

          <Text ta="center" c="dimmed" size="sm">
            Click the link in the email to reset your password. If you
            don&apos;t see it, check your spam folder.
          </Text>

          <NavLinkButton to="/login">
            <Button variant="outline" fullWidth>
              Back to login
            </Button>
          </NavLinkButton>
        </Stack>
      </Paper>
    </Center>
  );
}
