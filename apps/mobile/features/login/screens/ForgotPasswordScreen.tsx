import { useAuth } from '@/auth/useAuth';
import {
  AuthIntro,
  AuthLink,
  AuthNotice,
  AuthScreen,
} from '@/features/login/components/AuthLayout';
import { Button, TextInput } from '@guallet/luna-mobile';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { revalidateLogic, useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';
import { useState } from 'react';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { resetPassword } = useAuth();
  const [requestError, setRequestError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { email: params.email ?? '' },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: forgotPasswordSchema },
    listeners: { onChange: () => setRequestError(null) },
    onSubmit: async ({ value }) => {
      const { email } = forgotPasswordSchema.parse(value);
      setRequestError(null);
      const result = await resetPassword(
        email,
        'guallet://login/reset-password',
      );
      if (result.success) {
        router.push({
          pathname: '/login/reset-password-sent',
          params: { email },
        });
        return;
      }
      setRequestError(
        result.error?.message ??
          'We could not send the reset email. Please try again.',
      );
    },
  });
  const [email, canSubmit, isSubmitting] = useStore(
    form.store,
    (state) =>
      [state.values.email, state.canSubmit, state.isSubmitting] as const,
  );

  return (
    <AuthScreen headerTitle="Password help" isLoading={isSubmitting}>
      <AuthIntro
        description="Enter your account email and we’ll send you a secure link to choose a new password."
        eyebrow="Account recovery"
        icon="key-outline"
        title="Reset your password"
      />

      {requestError ? (
        <AuthNotice tone="error">{requestError}</AuthNotice>
      ) : null}

      <form.Field name="email">
        {(field) => (
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            accessibilityHint={field.state.meta.errors[0]?.message}
            error={field.state.meta.errors[0]?.message}
            keyboardType="email-address"
            label="Email address"
            onBlur={field.handleBlur}
            onChangeText={field.handleChange}
            onSubmitEditing={() => {
              if (!form.state.isSubmitting) void form.handleSubmit();
            }}
            placeholder="you@example.com"
            returnKeyType="send"
            textContentType="emailAddress"
            value={field.state.value}
          />
        )}
      </form.Field>

      <Button
        disabled={!canSubmit || !email.trim() || isSubmitting}
        onClick={() => {
          if (!form.state.isSubmitting) void form.handleSubmit();
        }}
      >
        {isSubmitting ? 'Sending…' : 'Send reset link'}
      </Button>

      <AuthLink
        onPress={() =>
          router.replace({
            pathname: '/login/password',
            params: { email: email.trim() },
          })
        }
      >
        Back to sign in
      </AuthLink>
    </AuthScreen>
  );
}
