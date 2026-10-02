import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/layout/AppScreen';
import { GoalForm } from '@/features/saving-goals/components/GoalForm';
import { useTranslation } from 'react-i18next';

export default function NewSavingGoalScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <AppScreen headerTitle={t('copy_1kduje4')}>
      <GoalForm
        onSaved={(goal) => router.replace(`/saving-goals/${goal.id}`)}
      />
    </AppScreen>
  );
}
