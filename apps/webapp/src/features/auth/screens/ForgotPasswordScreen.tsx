import {
  Center,
  Paper,
  Stack,
  Text,
  TextInput,
  Button,
  Title,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { IconAlertCircle, IconLock } from '@tabler/icons-react';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';
import { NavLinkButton } from '@/components/Buttons/NavLinkButton';

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
}: ForgotPasswordScreenProps) {
  const form = useForm<FormData>({
    initialValues: {
      email: '',
    },
    validate: zod4Resolver(formSchema),
  });

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data.email);
  };

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

          <IconLock size={48} color="var(--mantine-color-blue-6)" />

          <Title order={2} ta="center">
            Forgot your password?
          </Title>

          <Text ta="center" c="dimmed">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </Text>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              w="100%"
            >
              {error}
            </Alert>
          )}

          <form
            onSubmit={form.onSubmit(handleSubmit)}
            style={{ width: '100%' }}
          >
            <Stack gap="md">
              <TextInput
                {...form.getInputProps('email')}
                label="Email"
                type="email"
                placeholder="Enter your email"
                required
              />

              <Button fullWidth type="submit" loading={isLoading}>
                Send reset link
              </Button>
            </Stack>
          </form>

          <NavLinkButton to="/login">Back to login</NavLinkButton>
        </Stack>
      </Paper>
    </Center>
  );
}
