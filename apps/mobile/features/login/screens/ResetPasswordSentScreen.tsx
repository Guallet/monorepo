import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Label, Title, Stack, useTheme } from '@luna-ui/react-native';
import { openInbox } from 'react-native-email-link';
import Ionicons from '@expo/vector-icons/Ionicons';

export function ResetPasswordSentScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();

  const handleOpenEmailApp = async () => {
    await openInbox();
  };

  const handleBackToLogin = () => {
    router.replace('/login');
  };

  return (
    <AppScreen headerTitle="Check your email">
      <Stack style={{ flex: 1, padding: spacing.md }} gap={spacing.lg}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={64} color={colors.primary} />
          </View>

          <Title center>Check your email</Title>

          <Label center>
            We&apos;ve sent a password reset link to{' '}
            {params.email ? (
              <Label style={{ fontWeight: 'bold' }}>{params.email}</Label>
            ) : (
              'your email'
            )}
            .
          </Label>

          <Label center>
            Click the link in the email to reset your password. If you
            don&apos;t see it, check your spam folder.
          </Label>
        </View>

        <View style={styles.buttonContainer}>
          <Button onClick={handleOpenEmailApp}>Open email app</Button>
          <Button variant="outline" onClick={handleBackToLogin}>
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
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
    paddingBottom: 24,
  },
});
