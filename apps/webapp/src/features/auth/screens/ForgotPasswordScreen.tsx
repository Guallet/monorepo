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
import { useTranslation } from 'react-i18next';
import { GualletLogo } from '@/components/GualletLogo/GualletLogo';
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';

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
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();

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
            <IconLock size={48} color="var(--mantine-color-blue-6)" />

            <Title order={2} ta="center">
              {t('screens.forgotPassword.title.label', 'Forgot your password?')}
            </Title>

            <Text ta="center" c="dimmed">
              {t(
                'screens.forgotPassword.description.label',
                "Enter your email address and we'll send you a link to reset your password.",
              )}
            </Text>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={t('screens.forgotPassword.error.title', 'Error')}
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
                  label={t('screens.forgotPassword.form.email.label', 'Email')}
                  type="email"
                  placeholder={t(
                    'screens.forgotPassword.form.email.placeholder',
                    'Enter your email',
                  )}
                  required
                />

                <Button fullWidth type="submit" loading={isLoading}>
                  {t(
                    'screens.forgotPassword.form.submitButton.label',
                    'Send reset link',
                  )}
                </Button>
              </Stack>
            </form>

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
              {t('screens.forgotPassword.backButton.label', 'Back to login')}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Center>
  );
}
