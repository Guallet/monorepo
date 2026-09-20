import {
  AuthIntro,
  AuthLink,
  AuthNotice,
  AuthScreen,
} from '@/features/login/components/AuthLayout';
import { Button } from '@guallet/luna-mobile';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { openInbox } from 'react-native-email-link';

export function ResetPasswordSentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? 'your email address';

  const handleOpenEmailApp = async () => {
    try {
      await openInbox();
    } catch {
      Alert.alert(
        'Could not open your inbox',
        'Open your email app and look for a message from Guallet.',
      );
    }
  };

  return (
    <AuthScreen headerTitle="Check your email">
      <AuthIntro
        align="center"
        description={`We sent a password reset link to ${email}.`}
        icon="mail-open-outline"
        title="Check your inbox"
      />

      <AuthNotice>
        The link expires for your security. If you don&apos;t see the email,
        check your spam or junk folder.
      </AuthNotice>

      <Button onClick={handleOpenEmailApp}>Open email app</Button>

      <AuthLink onPress={() => router.replace('/login/password')}>
        Back to sign in
      </AuthLink>
    </AuthScreen>
  );
}
