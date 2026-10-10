import { useAuth } from '@/auth/useAuth';
import {
  AuthIntro,
  AuthLink,
  AuthNotice,
  AuthScreen,
} from '@/features/login/components/AuthLayout';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button, Stack, TextInput, useTheme } from '@guallet/luna-mobile';
import { useForm, useSelector } from '@tanstack/react-form';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { passwordLoginFormOptions } from '../passwordLoginForm';

export function PasswordLoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { login } = useAuth();
  const { colors, spacing } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm({
    ...passwordLoginFormOptions,
    defaultValues: { email: params.email ?? '', password: '' },
    listeners: { onChange: () => setFormError(null) },
    onSubmit: async ({ value }) => {
      setFormError(null);
      const fallback =
        'We could not sign you in. Check your details and try again.';
      try {
        const result = await login(value.email.trim(), value.password);
        if (!result.success) setFormError(result.error?.message ?? fallback);
      } catch {
        setFormError(fallback);
      }
    },
  });
  const submitForm = async () => {
    if (form.state.isSubmitting) return;
    await form.handleSubmit();
  };
  const email = useSelector(form.store, (state) => state.values.email);
  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
  let visibilityLabel = 'Show password';
  let visibilityIcon: 'eye-outline' | 'eye-off-outline' = 'eye-outline';
  if (isPasswordVisible) {
    visibilityLabel = 'Hide password';
    visibilityIcon = 'eye-off-outline';
  }

  return (
    <AuthScreen headerTitle="Sign in" isLoading={isSubmitting}>
      <AuthIntro
        description="Use the email and password linked to your Guallet account."
        eyebrow="Welcome back"
        title="Sign in to Guallet"
      />

      {formError && <AuthNotice tone="error">{formError}</AuthNotice>}

      <Stack gap={spacing.xs}>
        <form.Field name="email">
          {(field) => (
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              disabled={isSubmitting}
              error={field.state.meta.errors[0] ?? null}
              keyboardType="email-address"
              label="Email address"
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              placeholder="you@example.com"
              returnKeyType="next"
              textContentType="emailAddress"
              value={field.state.value}
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <TextInput
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect={false}
              disabled={isSubmitting}
              error={field.state.meta.errors[0] ?? null}
              label="Password"
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              onSubmitEditing={() => void submitForm()}
              placeholder="Enter your password"
              returnKeyType="done"
              rightSection={
                <Pressable
                  accessibilityLabel={visibilityLabel}
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => setIsPasswordVisible((visible) => !visible)}
                  style={styles.visibilityButton}
                >
                  <Ionicons
                    color={colors.text.secondary}
                    name={visibilityIcon}
                    size={21}
                  />
                </Pressable>
              }
              secureTextEntry={!isPasswordVisible}
              textContentType="password"
              value={field.state.value}
            />
          )}
        </form.Field>
        <View style={styles.forgotPassword}>
          <AuthLink
            disabled={isSubmitting}
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

      <form.Subscribe
        selector={(state) =>
          [
            state.canSubmit,
            state.isSubmitting,
            state.values.email,
            state.values.password,
          ] as const
        }
      >
        {([canSubmit, submitting, formEmail, password]) => (
          <Button
            disabled={
              !canSubmit ||
              submitting ||
              !formEmail.trim() ||
              !password
            }
            onClick={() => void submitForm()}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        )}
      </form.Subscribe>

      <AuthLink
        disabled={isSubmitting}
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
