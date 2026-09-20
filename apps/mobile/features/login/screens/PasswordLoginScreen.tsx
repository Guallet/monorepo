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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PasswordLoginScreen() {
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
      router.replace('/(tabs)');
      return;
    }

    setFormError(
      result.error?.message ??
        'We could not sign you in. Check your details and try again.',
    );
  };

  return (
    <AuthScreen headerTitle="Sign in" isLoading={isLoading}>
      <AuthIntro
        description="Use the email and password linked to your Guallet account."
        eyebrow="Welcome back"
        title="Sign in to Guallet"
      />

      {formError ? <AuthNotice tone="error">{formError}</AuthNotice> : null}

      <Stack gap={spacing.xs}>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          error={emailError}
          keyboardType="email-address"
          label="Email address"
          onChangeText={(value) => {
            setEmail(value);
            setEmailError(null);
            setFormError(null);
          }}
          placeholder="you@example.com"
          returnKeyType="next"
          textContentType="emailAddress"
          value={email}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="current-password"
          autoCorrect={false}
          error={passwordError}
          label="Password"
          onChangeText={(value) => {
            setPassword(value);
            setPasswordError(null);
            setFormError(null);
          }}
          onSubmitEditing={handleLogin}
          placeholder="Enter your password"
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
            Forgot password?
          </AuthLink>
        </View>
      </Stack>

      <Button disabled={!email.trim() || !password} onClick={handleLogin}>
        Sign in
      </Button>

      <AuthLink
        onPress={() =>
          router.replace({
            pathname: '/login/email-code',
            params: { email: email.trim() },
          })
        }
      >
        Sign in with a one-time code
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
