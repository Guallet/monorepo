import { useAuth } from '@/auth/useAuth';
import { submitForm, useAppForm } from '@/components/forms';
import {
  AuthIntro,
  AuthLink,
  AuthNotice,
  AuthScreen,
} from '@/features/login/components/AuthLayout';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useTheme } from '@guallet/luna-mobile';
import { useSelector } from '@tanstack/react-form';
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
  const form = useAppForm({
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
      <form.AppForm>
        <AuthIntro
          description="Use the email and password linked to your Guallet account."
          eyebrow="Welcome back"
          title="Sign in to Guallet"
        />

        {formError && <AuthNotice tone="error">{formError}</AuthNotice>}

        <Stack gap={spacing.xs}>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                disabled={isSubmitting}
                keyboardType="email-address"
                label="Email address"
                placeholder="you@example.com"
                returnKeyType="next"
                textContentType="emailAddress"
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.TextField
                autoCapitalize="none"
                autoComplete="current-password"
                autoCorrect={false}
                disabled={isSubmitting}
                label="Password"
                onSubmitEditing={() => void submitForm(form)}
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
              />
            )}
          </form.AppField>
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

        <form.Subscribe
          selector={(state) =>
            !state.values.email.trim() || !state.values.password
          }
        >
          {(empty) => (
            <form.SubmitButton disabled={empty} submittingLabel="Signing in…">
              Sign in
            </form.SubmitButton>
          )}
        </form.Subscribe>

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
      </form.AppForm>
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
