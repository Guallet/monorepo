import { useAuth } from '@/auth/useAuth';
import {
  AuthIntro,
  AuthLink,
  AuthNotice,
  AuthScreen,
} from '@/features/login/components/AuthLayout';
import { Button, TextInput } from '@guallet/luna-mobile';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(params.email ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    const normalizedEmail = email.trim();

    if (!emailRegex.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setEmailError(null);
    setRequestError(null);
    setIsLoading(true);
    const result = await resetPassword(
      normalizedEmail,
      'guallet://login/reset-password',
    );
    setIsLoading(false);

    if (result.success) {
      router.push({
        pathname: '/login/reset-password-sent',
        params: { email: normalizedEmail },
      });
      return;
    }

    setRequestError(
      result.error?.message ??
        'We could not send the reset email. Please try again.',
    );
  };

  return (
    <AuthScreen headerTitle={t('copy_12vk0xn')} isLoading={isLoading}>
      <AuthIntro
        description={t('copy_ws5fyo')}
        eyebrow={t('copy_g068bv')}
        icon="key-outline"
        title={t('copy_ikn7x8')}
      />

      {requestError ? (
        <AuthNotice tone="error">{requestError}</AuthNotice>
      ) : null}

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
        onSubmitEditing={handleResetPassword}
        placeholder={t('copy_1f9hkpt')}
        returnKeyType="send"
        textContentType="emailAddress"
        value={email}
      />

      <Button disabled={!email.trim()} onClick={handleResetPassword}>
        {t('copy_1qg1xu0')}
      </Button>

      <AuthLink
        onPress={() =>
          router.replace({
            pathname: '/login/password',
            params: { email: email.trim() },
          })
        }
      >
        {t('copy_pdsptb')}
      </AuthLink>
    </AuthScreen>
  );
}
