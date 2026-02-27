import { useLocalSearchParams } from 'expo-router';
import { ConnectionDetailScreen } from '@/features/connections/screens/ConnectionDetailScreen';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ConnectionDetailScreen connectionId={id} />;
}
