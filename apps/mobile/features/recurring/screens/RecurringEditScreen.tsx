import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscription } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import {
  Loading,
  RecurringScreen,
  Status,
} from '../components/RecurringComponents';
import { RecurringForm } from '../components/RecurringForm';

export default function RecurringEditScreen({ id }: Readonly<{ id: string }>) {
  const router = useRouter();
  const { spacing } = useTheme();
  const { subscription, isLoading, isError, error, refetch } =
    useSubscription(id);
  const notFound = Boolean(error && 'status' in error && error.status === 404);
  if (isLoading)
    return (
      <RecurringScreen title="Edit recurring item">
        <Loading />
      </RecurringScreen>
    );
  if (isError && !notFound)
    return (
      <RecurringScreen title="Edit recurring item">
        <View style={{ padding: spacing.md }}>
          <Status
            title="Couldn’t load this item"
            message="Try again to load the latest values before editing."
            action="Try again"
            onPress={() => void refetch()}
          />
        </View>
      </RecurringScreen>
    );
  if (!subscription || notFound)
    return (
      <RecurringScreen title="Edit recurring item">
        <View style={{ padding: spacing.md }}>
          <Status
            title="Item no longer available"
            message="It may have been removed from Guallet."
            action="Back to recurring"
            onPress={() => router.dismissTo('/recurring')}
          />
        </View>
      </RecurringScreen>
    );
  return (
    <RecurringScreen title="Edit recurring item">
      <RecurringForm key={subscription.id} item={subscription} />
    </RecurringScreen>
  );
}
