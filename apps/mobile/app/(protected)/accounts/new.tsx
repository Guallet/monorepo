import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/layout/AppScreen';
import { AccountForm } from '@/features/accounts/components/AccountForm';
import { useTranslation } from 'react-i18next';

export default function NewAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <AppScreen headerTitle={t('copy_g0ccsm')}>
      <AccountForm
        onCancel={() => router.back()}
        onSaved={(account) => router.replace(`/accounts/${account.id}`)}
      />
    </AppScreen>
  );
}
