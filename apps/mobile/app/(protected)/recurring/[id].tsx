import { useLocalSearchParams } from 'expo-router';
import RecurringDetailScreen from '@/features/recurring/screens/RecurringDetailScreen';

export default function RecurringDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecurringDetailScreen id={id} />;
}
