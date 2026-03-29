import { useLocalSearchParams } from 'expo-router';
import { AccountDetailScreen } from '@/features/accounts/screens/AccountDetailScreen';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AccountDetailScreen accountId={id} />;
}
