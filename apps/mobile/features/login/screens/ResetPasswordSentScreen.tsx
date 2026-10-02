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
import { useTranslation } from 'react-i18next';

export function ResetPasswordSentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? 'your email address';

  const handleOpenEmailApp = async () => {
    try {
      await openInbox();
    } catch {
      Alert.alert(
        t('Could not open your inbox'),
        t('Open your email app and look for a message from Guallet.'),
      );
    }
  };

  return (
    <AuthScreen headerTitle={t('copy_asrdsa')}>
      <AuthIntro
        align="center"
        description={t('We sent a password reset link to {{email}}.', {
          email,
        })}
        icon="mail-open-outline"
        title={t('copy_mrtr7y')}
      />

      <AuthNotice>{t('copy_1e1985j')}</AuthNotice>

      <Button onClick={handleOpenEmailApp}>{t('copy_tbmk0e')}</Button>

      <AuthLink onPress={() => router.replace('/login/password')}>
        {t('copy_pdsptb')}
      </AuthLink>
    </AuthScreen>
  );
}
