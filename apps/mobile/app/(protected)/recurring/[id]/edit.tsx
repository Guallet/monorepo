import { useLocalSearchParams } from 'expo-router';
import RecurringEditScreen from '@/features/recurring/screens/RecurringEditScreen';

export default function EditRecurringRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecurringEditScreen id={id} />;
}
