import { useAuth } from '@/auth/useAuth';
import {
  AuthIntro,
  AuthLink,
  AuthNotice,
  AuthScreen,
} from '@/features/login/components/AuthLayout';
import { Label, Stack, TextInput, useTheme } from '@guallet/luna-mobile';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { revalidateLogic, useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';
import { SubmitButton, submitForm, fieldError } from '@/components/forms';
import { useState } from 'react';

const emailSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export function EmailCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { getOtpCode } = useAuth();
  const { colors, spacing, typography } = useTheme();
  const [requestError, setRequestError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { email: params.email ?? '' },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: emailSchema },
    listeners: { onChange: () => setRequestError(null) },
    onSubmit: async ({ value }) => {
      const { email } = emailSchema.parse(value);
      setRequestError(null);
      const result = await getOtpCode(email);
      if (result.success) {
        router.push({ pathname: '/login/otp', params: { email } });
        return;
      }
      setRequestError(
        result.error?.message ?? 'We could not send a code. Please try again.',
      );
    },
  });
  const email = useStore(form.store, (state) => state.values.email);

  return (
    <AuthScreen headerTitle="Email code">
      <AuthIntro
        description="We’ll email you a 6-digit code. It expires after 5 minutes."
        eyebrow="Password-free"
        icon="mail-unread-outline"
        title="Sign in with a code"
      />

      {requestError ? (
        <AuthNotice tone="error">{requestError}</AuthNotice>
      ) : null}

      <Stack gap={spacing.sm}>
        <form.Field name="email">
          {(field) => (
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              accessibilityHint={fieldError(field.state.meta.errors)}
              error={fieldError(field.state.meta.errors)}
              keyboardType="email-address"
              label="Email address"
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              onSubmitEditing={() => void submitForm(form)}
              placeholder="you@example.com"
              returnKeyType="send"
              textContentType="emailAddress"
              value={field.state.value}
            />
          )}
        </form.Field>
        <Label
          color={colors.text.secondary}
          size="sm"
          style={{ lineHeight: typography.sizes.sm * 1.5 }}
        >
          You can also use the secure sign-in link included in the email.
        </Label>
      </Stack>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting] as const}
      >
        {([canSubmit, isSubmitting]) => (
          <SubmitButton
            canSubmit={canSubmit && Boolean(email.trim())}
            isSubmitting={isSubmitting}
            onSubmit={() => void submitForm(form)}
            submittingLabel="Sending…"
          >
            Send my code
          </SubmitButton>
        )}
      </form.Subscribe>

      <AuthLink
        onPress={() =>
          router.replace({
            pathname: '/login/password',
            params: { email: email.trim() },
          })
        }
      >
        Use password instead
      </AuthLink>
    </AuthScreen>
  );
}
