import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useSavingGoals } from '@guallet/api-react';
import { SavingGoalDto } from '@guallet/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, EmptyState, Label, useTheme } from '@luna-ui/react-native';
import { useRouter } from 'expo-router';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function SavingGoalCard({ goal }: { goal: SavingGoalDto }) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/saving-goal/${goal.id}`)}
      activeOpacity={0.7}
    >
      <Card gap={8}>
        <Text style={[styles.goalName, { color: colors.text }]}>
          {goal.name}
        </Text>
        {goal.description ? (
          <Label size="sm" color="#6B7280">
            {goal.description}
          </Label>
        ) : null}
        <View style={styles.goalFooter}>
          <Label size="sm" color="#6B7280">
            Target: {goal.target_amount.toLocaleString()}
          </Label>
          <Label size="sm" color="#6B7280">
            By {formatDate(goal.target_date)}
          </Label>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export function SavingGoalsListScreen() {
  const { savingGoals, isLoading, refetch } = useSavingGoals();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen
        headerTitle="Saving Goals"
        isLoading={isLoading && !refreshing}
      >
        {savingGoals.length === 0 && !isLoading ? (
          <EmptyState
            title="No saving goals yet"
            message="Create a saving goal to start tracking your progress."
          />
        ) : (
          <FlatList
            data={savingGoals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SavingGoalCard goal={item} />}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
