import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError } from '@guallet/api-client';
import { useSavingGoal } from '@guallet/api-react';
import { Button, useTheme } from '@guallet/luna-mobile';
import { Text, View } from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { GoalForm } from '@/features/saving-goals/components/GoalForm';

export default function EditSavingGoalScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  let id = rawId ?? '';
  if (Array.isArray(id)) id = id[0] ?? '';
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();
  const { savingGoal, isLoading, isError, error, refetch } = useSavingGoal(id);
  if (
    !isLoading &&
    isError &&
    !(error instanceof ApiError && error.status === 404)
  ) {
    return (
      <AppScreen headerTitle="Edit goal">
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            padding: spacing.lg,
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
            }}
          >
            Couldn’t load goal
          </Text>
          <Button onClick={() => void refetch()} variant="outline">
            Try again
          </Button>
        </View>
      </AppScreen>
    );
  }
  if (isLoading) {
    return (
      <AppScreen
        headerTitle="Edit goal"
        isLoading
        loadingMessage="Loading goal…"
      />
    );
  }
  if (!savingGoal) {
    return (
      <AppScreen headerTitle="Edit goal">
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
          }}
        >
          <Text style={{ color: colors.text.primary }}>Goal not found</Text>
          <Button onClick={() => router.back()} variant="outline">
            Go back
          </Button>
        </View>
      </AppScreen>
    );
  }
  return (
    <AppScreen headerTitle="Edit goal">
      <GoalForm goal={savingGoal} onSaved={() => router.back()} />
    </AppScreen>
  );
}
