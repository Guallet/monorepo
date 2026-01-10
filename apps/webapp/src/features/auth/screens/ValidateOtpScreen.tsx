import {
  Center,
  Paper,
  Stack,
  Text,
  TextInput,
  Button,
  Title,
  Anchor,
  Alert,
} from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconMail, IconAlertCircle } from '@tabler/icons-react';

interface ValidateOtpScreenProps {
  email: string;
  onValidateOtp: (code: string) => void;
  onResendCode?: () => void;
  error?: string | null;
  isLoading?: boolean;
}

export function ValidateOtpScreen({
  email,
  onValidateOtp,
  onResendCode,
  error,
  isLoading,
}: Readonly<ValidateOtpScreenProps>) {
  const { t } = useTranslation();
  const [code, setCode] = useState<string>('');

  const isCodeValid = code.length === 6;

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
          <IconMail size={48} color="var(--mantine-color-blue-6)" />

          <Title order={2} ta="center">
            {t('screens.validateOtp.title', 'Check your email')}
          </Title>

          <Text ta="center" c="dimmed">
            {t(
              'screens.validateOtp.description',
              "We've sent a 6-digit code to",
            )}{' '}
            <Text span fw={600}>
              {email}
            </Text>
            .{' '}
            {t(
              'screens.validateOtp.instructionText',
              'Enter the code below to sign in.',
            )}
          </Text>

          <Text ta="center" c="dimmed" size="sm">
            {t(
              'screens.validateOtp.instructionNote',
              'The email also contains a magic link you can click to sign in automatically.',
            )}
          </Text>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={t('screens.validateOtp.error.title', 'Error')}
              color="red"
              w="100%"
            >
              {error}
            </Alert>
          )}

          <TextInput
            placeholder={t(
              'screens.validateOtp.form.codeInput.placeholder',
              'Enter the 6 digit code',
            )}
            value={code}
            onChange={(event) => {
              setCode(event.currentTarget.value);
            }}
            maxLength={6}
            size="lg"
            w="100%"
            styles={{
              input: {
                textAlign: 'center',
                letterSpacing: '0.5em',
                fontWeight: 600,
              },
            }}
          />

          <Button
            fullWidth
            onClick={() => {
              onValidateOtp(code);
            }}
            disabled={!isCodeValid}
            loading={isLoading}
          >
            {t('screens.validateOtp.form.verifyButton.label', 'Verify code')}
          </Button>

          {onResendCode && (
            <Text size="sm" ta="center">
              {t(
                'screens.validateOtp.resendCode.question',
                "Didn't receive the code?",
              )}{' '}
              <Anchor component="button" type="button" onClick={onResendCode}>
                {t(
                  'screens.validateOtp.resendCode.resendButton',
                  'Resend code',
                )}
              </Anchor>
            </Text>
          )}
        </Stack>
      </Paper>
    </Center>
  );
}
