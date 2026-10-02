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
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PasswordLoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { login } = useAuth();
  const { colors, spacing } = useTheme();
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const nextEmailError = emailRegex.test(email.trim())
      ? null
      : 'Enter a valid email address.';
    const nextPasswordError =
      password.length >= 6 ? null : 'Password must be at least 6 characters.';

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      return;
    }

    setFormError(
      result.error?.message ??
        'We could not sign you in. Check your details and try again.',
    );
  };

  return (
    <AuthScreen headerTitle={t('copy_w9nig3')} isLoading={isLoading}>
      <AuthIntro
        description={t('copy_1u17k19')}
        eyebrow={t('copy_k7z2ue')}
        title={t('copy_17oz2u2')}
      />

      {formError ? <AuthNotice tone="error">{formError}</AuthNotice> : null}

      <Stack gap={spacing.xs}>
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
            setFormError(null);
          }}
          placeholder={t('copy_1f9hkpt')}
          returnKeyType="next"
          textContentType="emailAddress"
          value={email}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="current-password"
          autoCorrect={false}
          error={passwordError}
          label={t('copy_cf437c')}
          onChangeText={(value) => {
            setPassword(value);
            setPasswordError(null);
            setFormError(null);
          }}
          onSubmitEditing={handleLogin}
          placeholder={t('copy_y81xq5')}
          returnKeyType="done"
          rightSection={
            <Pressable
              accessibilityLabel={
                isPasswordVisible ? 'Hide password' : 'Show password'
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
          textContentType="password"
          value={password}
        />
        <View style={styles.forgotPassword}>
          <AuthLink
            onPress={() =>
              router.push({
                pathname: '/login/forgot-password',
                params: { email: email.trim() },
              })
            }
          >
            {t('copy_1qt9b3c')}
          </AuthLink>
        </View>
      </Stack>

      <Button disabled={!email.trim() || !password} onClick={handleLogin}>
        {t('copy_w9nig3')}
      </Button>

      <AuthLink
        onPress={() =>
          router.replace({
            pathname: '/login/email-code',
            params: { email: email.trim() },
          })
        }
      >
        {t('copy_1qyfr1h')}
      </AuthLink>
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
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: -12,
  },
});
