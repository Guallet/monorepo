import { useLocalSearchParams } from 'expo-router';
import { SavingGoalDetailScreen } from '@/features/saving-goals/screens/SavingGoalDetailScreen';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SavingGoalDetailScreen goalId={id} />;
}
