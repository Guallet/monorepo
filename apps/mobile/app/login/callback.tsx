import { AuthIntro, AuthScreen } from '@/features/login/components/AuthLayout';
import { useTheme } from '@guallet/luna-mobile';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

/** The shared navigator completes or retries sign-in after session resolution. */
export default function Screen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <AuthScreen isHeaderVisible={false}>
      <AuthIntro
        title={t('copy_eh8dlf')}
        description={t('copy_1sjjio0')}
        align="center"
      />
      <ActivityIndicator
        accessibilityLabel={t('copy_eh8dlf')}
        color={colors.accent.primary}
      />
    </AuthScreen>
  );
}
