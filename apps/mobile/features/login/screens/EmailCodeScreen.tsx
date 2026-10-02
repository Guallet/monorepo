import { useAuth } from '@/auth/useAuth';
import {
  AuthIntro,
  AuthLink,
  AuthNotice,
  AuthScreen,
} from '@/features/login/components/AuthLayout';
import {
  Button,
  Label,
  Stack,
  TextInput,
  useTheme,
} from '@guallet/luna-mobile';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailCodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { getOtpCode } = useAuth();
  const { colors, spacing, typography } = useTheme();
  const [email, setEmail] = useState(params.email ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    const normalizedEmail = email.trim();

    if (!emailRegex.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setEmailError(null);
    setRequestError(null);
    setIsLoading(true);
    const result = await getOtpCode(normalizedEmail);
    setIsLoading(false);

    if (result.success) {
      router.push({
        pathname: '/login/otp',
        params: { email: normalizedEmail },
      });
      return;
    }

    setRequestError(
      result.error?.message ?? 'We could not send a code. Please try again.',
    );
  };

  return (
    <AuthScreen headerTitle={t('copy_1fs4j5g')} isLoading={isLoading}>
      <AuthIntro
        description={t('copy_13hwh4q')}
        eyebrow={t('copy_1l7drrh')}
        icon="mail-unread-outline"
        title={t('copy_ym0ol7')}
      />

      {requestError ? (
        <AuthNotice tone="error">{requestError}</AuthNotice>
      ) : null}

      <Stack gap={spacing.sm}>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          error={emailError}
          keyboardType="email-address"
          label={t('copy_1cdit03')}
          onChangeText={(value) => {
            setEmail(value);
            setEmailError(null);
            setRequestError(null);
          }}
          onSubmitEditing={handleSendCode}
          placeholder={t('copy_1f9hkpt')}
          returnKeyType="send"
          textContentType="emailAddress"
          value={email}
        />
        <Label
          color={colors.text.secondary}
          size="sm"
          style={{ lineHeight: typography.sizes.sm * 1.5 }}
        >
          {t('copy_t828z3')}
        </Label>
      </Stack>

      <Button disabled={!email.trim()} onClick={handleSendCode}>
        {t('copy_180hgrc')}
      </Button>

      <AuthLink
        onPress={() =>
          router.replace({
            pathname: '/login/password',
            params: { email: email.trim() },
          })
        }
      >
        {t('copy_rdoe27')}
      </AuthLink>
    </AuthScreen>
  );
}
