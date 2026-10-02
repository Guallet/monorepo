import { useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudgets } from '@guallet/api-react';
import { Button, useTheme } from '@guallet/luna-mobile';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetMonthSelector } from '../components/BudgetMonthSelector';
import { BudgetSummaryCard } from '../components/BudgetSummaryCard';
import { getBudgetMonth, getBudgetMetrics, getMonthStart } from '../models';
import { useTranslation } from 'react-i18next';

export default function BudgetsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() =>
    getMonthStart(new Date()),
  );
  const { month, year } = getBudgetMonth(selectedDate);
  const { budgets, isError, isLoading, isRefetching, refetch } = useBudgets({
    month,
    year,
  });

  const sortedBudgets = useMemo(
    () =>
      [...budgets].sort((left, right) => {
        const leftMetrics = getBudgetMetrics(left);
        const rightMetrics = getBudgetMetrics(right);
        if (leftMetrics.isOverBudget !== rightMetrics.isOverBudget) {
          if (leftMetrics.isOverBudget) return -1;
          return 1;
        }
        if (leftMetrics.isNearLimit !== rightMetrics.isNearLimit) {
          if (leftMetrics.isNearLimit) return -1;
          return 1;
        }
        return rightMetrics.percent - leftMetrics.percent;
      }),
    [budgets],
  );

  let budgetContent: ReactNode;
  if (isLoading) {
    budgetContent = <LoadingState />;
  } else if (isError) {
    budgetContent = (
      <MessageCard
        title={t('copy_1bs5gvd')}
        body={t('copy_k8irws')}
        actionLabel={t('copy_982hh6')}
        onAction={() => void refetch()}
      />
    );
  } else if (budgets.length === 0) {
    budgetContent = <EmptyState onCreate={() => router.push('/budgets/new')} />;
  } else {
    budgetContent = (
      <>
        <BudgetSummaryCard budgets={budgets} />
        <View style={{ gap: spacing.sm }}>
          {sortedBudgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onPress={() => router.push(`/budgets/${budget.id}`)}
            />
          ))}
        </View>
      </>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: colors.surface.background.page },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: spacing.md, padding: spacing.md },
        ]}
        refreshControl={
          <RefreshControl
            onRefresh={() => void refetch()}
            refreshing={isRefetching}
            tintColor={colors.accent.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.xxl,
                fontWeight: '700',
              }}
            >
              {t('copy_rb49fl')}
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.sm,
              }}
            >
              {t('copy_1ixdl1e')}
            </Text>
          </View>
          <Button
            onClick={() => router.push('/budgets/new')}
            style={styles.addButton}
          >
            {t('copy_lec9u0')}
          </Button>
        </View>

        <BudgetMonthSelector date={selectedDate} onChange={setSelectedDate} />

        {budgetContent}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

function LoadingState() {
  const { borderRadius, colors, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      {[1, 2, 3].map((item) => {
        let height = 130;
        if (item === 1) height = 190;
        return (
          <View
            key={item}
            style={{
              backgroundColor: colors.surface.background.secondary,
              borderRadius: borderRadius.lg,
              height,
            }}
          />
        );
      })}
      <ActivityIndicator color={colors.accent.primary} style={styles.loader} />
    </View>
  );
}

function EmptyState({ onCreate }: Readonly<{ onCreate: () => void }>) {
  const { t } = useTranslation();
  const { borderRadius, colors, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.messageCard,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes.lg,
          fontWeight: '700',
        }}
      >
        {t('copy_l1kd2')}
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.sizes.sm,
          marginTop: spacing.xs,
        }}
      >
        {t('copy_dedn9e')}
      </Text>
      <Button onClick={onCreate} style={{ marginTop: spacing.md }}>
        {t('copy_utnk9r')}
      </Button>
    </View>
  );
}

function MessageCard({
  actionLabel,
  body,
  onAction,
  title,
}: Readonly<{
  actionLabel: string;
  body: string;
  onAction: () => void;
  title: string;
}>) {
  const { borderRadius, colors, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.messageCard,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes.lg,
          fontWeight: '700',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.sizes.sm,
          marginTop: spacing.xs,
        }}
      >
        {body}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAction}
        style={{ marginTop: spacing.md }}
      >
        <Text
          style={{
            color: colors.accent.primary,
            fontSize: typography.sizes.sm,
            fontWeight: '600',
          }}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: 3,
    paddingRight: 8,
  },
  addButton: {
    minWidth: 78,
  },
  messageCard: {
    borderWidth: 1,
  },
  loader: {
    marginTop: -34,
  },
  bottomPad: {
    height: 16,
  },
});
