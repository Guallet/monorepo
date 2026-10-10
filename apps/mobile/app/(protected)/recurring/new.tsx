import { useLocalSearchParams } from 'expo-router';
import { RecurringPaymentType } from '@guallet/api-client';
import { TYPE_OPTIONS } from '@/features/recurring/recurring';
import { RecurringForm } from '@/features/recurring/components/RecurringForm';
import { RecurringScreen } from '@/features/recurring/components/RecurringComponents';

export default function NewRecurringRoute() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const initialType =
    TYPE_OPTIONS.find((option) => option.id === type)?.id ??
    RecurringPaymentType.SUBSCRIPTION;
  return (
    <RecurringScreen title="Add recurring item">
      <RecurringForm initialType={initialType} />
    </RecurringScreen>
  );
}
