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

export function ResetPasswordScreen() {
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
    <AuthScreen headerTitle="Reset password" isLoading={isLoading}>
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
        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          error={passwordError}
          label="New password"
          onChangeText={(value) => {
            setPassword(value);
            setPasswordError(null);
            setRequestError(null);
          }}
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
          value={password}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          error={confirmationError}
          label="Confirm new password"
          onChangeText={(value) => {
            setConfirmation(value);
            setConfirmationError(null);
            setRequestError(null);
          }}
          onSubmitEditing={handleReset}
          placeholder="Enter it again"
          returnKeyType="done"
          secureTextEntry={!isPasswordVisible}
          textContentType="newPassword"
          value={confirmation}
        />
      </Stack>

      <Button disabled={!password || !confirmation} onClick={handleReset}>
        Update password
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
