import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/layout/AppScreen';
import { AccountForm } from '@/features/accounts/components/AccountForm';

export default function NewAccountScreen() {
  const router = useRouter();

  return (
    <AppScreen headerTitle="New account">
      <AccountForm
        onCancel={() => router.back()}
        onSaved={(account) => router.replace(`/accounts/${account.id}`)}
      />
    </AppScreen>
  );
}
