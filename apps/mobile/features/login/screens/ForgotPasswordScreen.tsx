import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Button,
  Label,
  TextInput,
  Title,
  Stack,
  useTheme,
} from '@luna-ui/react-native';
import { useAuth } from '@/auth/useAuth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { resetPassword } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = emailRegex.test(email);

  const handleResetPassword = async () => {
    if (!isValidEmail) {
      setEmailError('Please enter a valid email');
      return;
    }

    setEmailError(null);
    setIsLoading(true);

    const result = await resetPassword(email, 'guallet://login/reset-password');
    setIsLoading(false);

    if (result.success) {
      router.navigate({
        pathname: '/login/reset-password-sent',
        params: { email },
      });
    } else {
      setEmailError('Failed to send reset email. Please try again.');
    }
  };

  return (
    <AppScreen headerTitle="Reset Password" isLoading={isLoading}>
      <Stack style={{ flex: 1, padding: spacing.md }} gap={spacing.lg}>
        <View style={styles.content}>
          <Title>Forgot your password?</Title>
          <Label>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </Label>

          <TextInput
            label="Email"
            onChangeText={(input) => {
              setEmail(input);
              setEmailError(null);
            }}
            value={email}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button onClick={handleResetPassword} disabled={!isValidEmail}>
            Send reset link
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Back to login
          </Button>
        </View>
      </Stack>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
  },
  buttonContainer: {
    gap: 12,
    paddingBottom: 24,
  },
});
