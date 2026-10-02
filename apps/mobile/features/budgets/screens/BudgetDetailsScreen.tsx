import { useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useBudget,
  useBudgetMutations,
  useBudgetTransactions,
  useCategories,
} from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetMonthSelector } from '../components/BudgetMonthSelector';
import { BudgetTransactionRow } from '../components/BudgetTransactionRow';
import { getBudgetMonth, getMonthStart } from '../models';
import { useTranslation } from 'react-i18next';

export default function BudgetDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();
  const [selectedDate, setSelectedDate] = useState(() =>
    getMonthStart(new Date()),
  );
  const { month, year } = getBudgetMonth(selectedDate);
  const { budget, isError, isLoading, isRefetching, refetch } = useBudget(id, {
    month,
    year,
  });
  const {
    isRefetching: isTransactionsRefetching,
    isError: isTransactionsError,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
    transactions,
  } = useBudgetTransactions({
    args: { month, year },
    budgetId: id,
  });
  const { categories } = useCategories();
  const { deleteBudgetMutation } = useBudgetMutations();

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  function confirmDelete() {
    Alert.alert(
      t('Delete budget?'),
      t('This removes the budget but does not delete its transactions.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => {
            void deleteBudgetMutation.mutateAsync(id).then(
              () => router.replace('/budgets'),
              () =>
                Alert.alert(
                  t('Couldn’t delete budget'),
                  t('Please try again in a moment.'),
                ),
            );
          },
        },
      ],
    );
  }

  let transactionContent: ReactNode;
  if (isTransactionsLoading) {
    transactionContent = (
      <View style={styles.transactionLoading}>
        <ActivityIndicator color={colors.accent.primary} />
      </View>
    );
  } else if (isTransactionsError) {
    transactionContent = (
      <View style={{ paddingVertical: spacing.lg }}>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
          }}
        >
          {t('copy_8lz5x7')}
        </Text>
        <Pressable
          onPress={() => void refetchTransactions()}
          style={{ marginTop: spacing.sm }}
        >
          <Text
            style={{
              color: colors.accent.primary,
              fontSize: typography.sizes.sm,
              fontWeight: '600',
            }}
          >
            {t('copy_982hh6')}
          </Text>
        </Pressable>
      </View>
    );
  } else if (transactions.length === 0) {
    transactionContent = (
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.sizes.sm,
          paddingVertical: spacing.lg,
        }}
      >
        {t('copy_9blm08')}
      </Text>
    );
  } else {
    transactionContent = transactions.map((transaction) => {
      let categoryName: string | undefined;
      if (transaction.categoryId) {
        categoryName = categoryNames.get(transaction.categoryId);
      }
      return (
        <BudgetTransactionRow
          key={transaction.id}
          categoryName={categoryName}
          transaction={transaction}
        />
      );
    });
  }

  if (isLoading) {
    return (
      <AppScreen headerTitle={t('copy_auevmw')}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent.primary} />
        </View>
      </AppScreen>
    );
  }

  if (isError || !budget) {
    return (
      <AppScreen headerTitle={t('copy_auevmw')}>
        <View style={[styles.centered, { padding: spacing.lg }]}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '700',
            }}
          >
            {t('copy_1br31ae')}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              marginTop: spacing.xs,
            }}
          >
            {t('copy_g5cmja')}
          </Text>
          <Pressable
            onPress={() => void refetch()}
            style={{ marginTop: spacing.md }}
          >
            <Text
              style={{
                color: colors.accent.primary,
                fontSize: typography.sizes.sm,
                fontWeight: '600',
              }}
            >
              {t('copy_982hh6')}
            </Text>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      headerTitle={budget.name}
      headerOptions={{
        headerRight: () => (
          <BudgetDetailsHeaderActions
            disabled={deleteBudgetMutation.isPending}
            onDelete={confirmDelete}
            onEdit={() => router.push(`/budgets/${id}/edit`)}
          />
        ),
      }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: spacing.md, padding: spacing.md },
        ]}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              void refetch();
              void refetchTransactions();
            }}
            refreshing={isRefetching || isTransactionsRefetching}
            tintColor={colors.accent.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <BudgetMonthSelector date={selectedDate} onChange={setSelectedDate} />
        <BudgetCard budget={budget} />

        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.lg,
            fontWeight: '700',
          }}
        >
          {t('copy_14dfqxc')}
        </Text>

        <View
          style={[
            styles.transactionCard,
            {
              backgroundColor: colors.surface.background.primary,
              borderColor: colors.surface.border.primary,
              borderRadius: 16,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          {transactionContent}
        </View>
        <View style={styles.bottomPad} />
      </ScrollView>
    </AppScreen>
  );
}

interface BudgetDetailsHeaderActionsProps {
  disabled: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

function BudgetDetailsHeaderActions({
  disabled,
  onDelete,
  onEdit,
}: BudgetDetailsHeaderActionsProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  return (
    <View style={styles.headerActions}>
      <Pressable
        accessibilityLabel={t('copy_j0xlla')}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onEdit}
        style={styles.headerButton}
      >
        <Text
          style={{
            color: colors.accent.primary,
            fontSize: typography.sizes.sm,
          }}
        >
          {t('copy_1i1lcq9')}
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel={t('copy_1atz37r')}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onDelete}
        style={styles.headerButton}
      >
        <Text
          style={{
            color: colors.status.error,
            fontSize: typography.sizes.sm,
          }}
        >
          {t('copy_oay2cq')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    paddingVertical: 6,
  },
  transactionCard: {
    borderWidth: 1,
  },
  transactionLoading: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPad: {
    height: 16,
  },
});
