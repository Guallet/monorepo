import { Stack } from 'expo-router';
import { TransactionsListScreen } from '@/features/transactions/screens/TransactionsListScreen';

export default function TransactionsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TransactionsListScreen />
    </>
  );
}
