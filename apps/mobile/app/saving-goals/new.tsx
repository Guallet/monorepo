import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/layout/AppScreen';
import { GoalForm } from '@/features/saving-goals/components/GoalForm';

export default function NewSavingGoalScreen() {
  const router = useRouter();
  return (
    <AppScreen headerTitle="New goal">
      <GoalForm
        onSaved={(goal) => router.replace(`/saving-goals/${goal.id}`)}
      />
    </AppScreen>
  );
}
