import { useAuth } from '@/auth/useAuth';
import {
  AuthIntro,
  AuthLink,
  AuthNotice,
  AuthScreen,
} from '@/features/login/components/AuthLayout';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button, Stack, TextInput, useTheme } from '@guallet/luna-mobile';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = params.token ?? '';
  const { confirmPasswordReset } = useAuth();
  const { colors, spacing } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmationError, setConfirmationError] = useState<string | null>(
    null,
  );
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleReset = async () => {
    const nextPasswordError =
      password.length >= 8 ? null : 'Use at least 8 characters.';
    const nextConfirmationError =
      confirmation === password ? null : 'Passwords do not match.';

    setPasswordError(nextPasswordError);
    setConfirmationError(nextConfirmationError);
    setRequestError(null);

    if (nextPasswordError || nextConfirmationError || !token) {
      return;
    }

    setIsLoading(true);
    const result = await confirmPasswordReset(password, token);
    setIsLoading(false);

    if (result.success) {
      setIsComplete(true);
      return;
    }

    setRequestError(
      result.error?.message ??
        'This reset link may have expired. Request a new one and try again.',
    );
  };

  if (isComplete) {
    return (
      <AuthScreen headerTitle={t('copy_1sd5pzr')}>
        <AuthIntro
          align="center"
          description={t('copy_2p7450')}
          icon="checkmark-circle-outline"
          title={t('copy_1sd5pzr')}
        />
        <AuthNotice tone="success">{t('copy_1vevt4l')}</AuthNotice>
        <Button onClick={() => router.replace('/login/password')}>
          {t('copy_1711vg1')}
        </Button>
      </AuthScreen>
    );
  }

  if (!token) {
    return (
      <AuthScreen headerTitle={t('copy_squy21')}>
        <AuthIntro
          description={t('copy_dqdakm')}
          icon="time-outline"
          title={t('copy_1gsqfs1')}
        />
        <Button onClick={() => router.replace('/login/forgot-password')}>
          {t('copy_igsw9j')}
        </Button>
        <AuthLink onPress={() => router.replace('/login/password')}>
          {t('copy_pdsptb')}
        </AuthLink>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen headerTitle={t('copy_squy21')} isLoading={isLoading}>
      <AuthIntro
        description={t('copy_2jxogj')}
        eyebrow={t('copy_1t0i8xc')}
        icon="lock-closed-outline"
        title={t('copy_1owuo7d')}
      />

      {requestError ? (
        <AuthNotice tone="error">{requestError}</AuthNotice>
      ) : null}

      <Stack gap={spacing.xs}>
        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          error={passwordError}
          label={t('copy_th3d82')}
          onChangeText={(value) => {
            setPassword(value);
            setPasswordError(null);
            setRequestError(null);
          }}
          placeholder={t('copy_4nuljv')}
          rightSection={
            <Pressable
              accessibilityLabel={
                isPasswordVisible ? 'Hide passwords' : 'Show passwords'
              }
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => setIsPasswordVisible((visible) => !visible)}
              style={styles.visibilityButton}
            >
              <Ionicons
                color={colors.text.secondary}
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={21}
              />
            </Pressable>
          }
          secureTextEntry={!isPasswordVisible}
          textContentType="newPassword"
          value={password}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          error={confirmationError}
          label={t('copy_1f7shm2')}
          onChangeText={(value) => {
            setConfirmation(value);
            setConfirmationError(null);
            setRequestError(null);
          }}
          onSubmitEditing={handleReset}
          placeholder={t('copy_1oblt9i')}
          returnKeyType="done"
          secureTextEntry={!isPasswordVisible}
          textContentType="newPassword"
          value={confirmation}
        />
      </Stack>

      <Button disabled={!password || !confirmation} onClick={handleReset}>
        {t('copy_10vguct')}
      </Button>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  visibilityButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
