import { StyleSheet } from 'react-native-unistyles';
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
import { Pressable } from 'react-native';
import { revalidateLogic, useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters.'),
    confirmation: z.string(),
  })
  .refine((value) => value.confirmation === value.password, {
    path: ['confirmation'],
    message: 'Passwords do not match.',
  });

export function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = params.token ?? '';
  const { confirmPasswordReset } = useAuth();
  const { colors, spacing } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const form = useForm({
    defaultValues: { password: '', confirmation: '' },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: resetPasswordSchema },
    listeners: { onChange: () => setRequestError(null) },
    onSubmit: async ({ value }) => {
      if (!token) return;
      const parsed = resetPasswordSchema.parse(value);
      setRequestError(null);
      const result = await confirmPasswordReset(parsed.password, token);
      if (result.success) {
        setIsComplete(true);
        return;
      }
      setRequestError(
        result.error?.message ??
          'This reset link may have expired. Request a new one and try again.',
      );
    },
  });
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  if (isComplete) {
    return (
      <AuthScreen headerTitle="Password updated">
        <AuthIntro
          align="center"
          description="Your new password is ready. You can now use it to sign in."
          icon="checkmark-circle-outline"
          title="Password updated"
        />
        <AuthNotice tone="success">
          Your account is protected with your new password.
        </AuthNotice>
        <Button onClick={() => router.replace('/login/password')}>
          Continue to sign in
        </Button>
      </AuthScreen>
    );
  }

  if (!token) {
    return (
      <AuthScreen headerTitle="Reset password">
        <AuthIntro
          description="This link is incomplete or has expired. Request a new reset email to continue."
          icon="time-outline"
          title="Request a new link"
        />
        <Button onClick={() => router.replace('/login/forgot-password')}>
          Send a new reset link
        </Button>
        <AuthLink onPress={() => router.replace('/login/password')}>
          Back to sign in
        </AuthLink>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen headerTitle="Reset password" isLoading={isSubmitting}>
      <AuthIntro
        description="Choose a strong password you haven’t used for this account before."
        eyebrow="Secure your account"
        icon="lock-closed-outline"
        title="Create a new password"
      />

      {requestError ? (
        <AuthNotice tone="error">{requestError}</AuthNotice>
      ) : null}

      <Stack gap={spacing.xs}>
        <form.Field name="password">
          {(field) => (
            <TextInput
              autoCapitalize="none"
              autoComplete="new-password"
              accessibilityHint={field.state.meta.errors[0]?.message}
              error={field.state.meta.errors[0]?.message}
              label="New password"
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              placeholder="At least 8 characters"
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
              value={field.state.value}
            />
          )}
        </form.Field>
        <form.Field name="confirmation">
          {(field) => (
            <TextInput
              autoCapitalize="none"
              autoComplete="new-password"
              accessibilityHint={field.state.meta.errors[0]?.message}
              error={field.state.meta.errors[0]?.message}
              label="Confirm new password"
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              onSubmitEditing={() => {
                if (!form.state.isSubmitting) void form.handleSubmit();
              }}
              placeholder="Enter it again"
              returnKeyType="done"
              secureTextEntry={!isPasswordVisible}
              textContentType="newPassword"
              value={field.state.value}
            />
          )}
        </form.Field>
      </Stack>

      <form.Subscribe
        selector={(state) =>
          [
            state.canSubmit,
            state.isSubmitting,
            state.values.password,
            state.values.confirmation,
          ] as const
        }
      >
        {([canSubmit, isSubmitting, password, confirmation]) => (
          <Button
            disabled={!canSubmit || !password || !confirmation || isSubmitting}
            onClick={() => {
              if (!form.state.isSubmitting) void form.handleSubmit();
            }}
          >
            {isSubmitting ? 'Updating…' : 'Update password'}
          </Button>
        )}
      </form.Subscribe>
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
