import { useLocalSearchParams } from 'expo-router';
import { TransactionDetailsScreen } from '@/features/transactions/screens/TransactionDetailsScreen';

export default function TransactionDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const transactionId = Array.isArray(id) ? id[0] : id;

  if (!transactionId) {
    return null;
  }

  return <TransactionDetailsScreen transactionId={transactionId} />;
}
