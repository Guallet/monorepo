import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useSavingGoal } from '@guallet/api-react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Label, Section, useTheme } from '@luna-ui/react-native';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface SavingGoalDetailScreenProps {
  goalId: string;
}

export function SavingGoalDetailScreen({
  goalId,
}: SavingGoalDetailScreenProps) {
  const { savingGoal, isLoading } = useSavingGoal(goalId);
  const { colors } = useTheme();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen
        headerTitle={savingGoal?.name ?? 'Saving Goal'}
        isLoading={isLoading}
      >
        {savingGoal && (
          <ScrollView contentContainerStyle={styles.content}>
            <Card style={styles.headerCard} gap={8}>
              <Label size="sm" color="#6B7280">
                Target Amount
              </Label>
              <Text style={[styles.targetAmount, { color: colors.text }]}>
                {savingGoal.target_amount.toLocaleString()}
              </Text>
              <Label size="sm" color="#6B7280">
                By {formatDate(savingGoal.target_date)}
              </Label>
            </Card>

            <Section title="Details">
              {savingGoal.description ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text
                    style={[styles.detailValue, { color: colors.text }]}
                    numberOfLines={3}
                  >
                    {savingGoal.description}
                  </Text>
                </View>
              ) : null}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Target Date</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatDate(savingGoal.target_date)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Linked Accounts</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {savingGoal.accounts.length}
                </Text>
              </View>
              {savingGoal.priority != null && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Priority</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {savingGoal.priority}
                  </Text>
                </View>
              )}
            </Section>
          </ScrollView>
        )}
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  headerCard: {
    alignItems: 'center',
  },
  targetAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
});
