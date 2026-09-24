import { Ionicons } from '@expo/vector-icons';
import {
  useInfiniteTransactions,
  useAccounts,
  useCategories,
} from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionFiltersSheet } from '../components/TransactionFiltersSheet';
import { TransactionRow } from '../components/TransactionRow';
import { TransactionListFilters } from '../models';
import { groupTransactionsByDate } from '../utils';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { formatPreferenceDate } from '@/utils/formatPreferenceDate';

export function TransactionsListScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const router = useRouter();
  const [filters, setFilters] = useState<TransactionListFilters>({});
  const [filtersVisible, setFiltersVisible] = useState(false);
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { dateFormat } = useMobileUserPreferences();
  const query = useInfiniteTransactions(filters);

  const accountNames = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const sections = useMemo(
    () => groupTransactionsByDate(query.transactions, dateFormat),
    [dateFormat, query.transactions],
  );

  const activeFilterCount =
    Number(Boolean(filters.accounts?.length)) +
    Number(Boolean(filters.categories?.length)) +
    Number(Boolean(filters.startDate && filters.endDate));

  let transactionsContent: ReactNode;
  if (query.isLoading) {
    transactionsContent = (
      <View style={styles.centerState}>
        <ActivityIndicator color={colors.accent.primary} />
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
          }}
        >
          Loading transactions…
        </Text>
      </View>
    );
  } else if (query.isError) {
    transactionsContent = (
      <View style={styles.centerState}>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
          }}
        >
          We couldn’t load your transactions.
        </Text>
        <Pressable onPress={() => query.refetch()}>
          <Text
            style={{
              color: colors.accent.primary,
              fontSize: typography.sizes.sm,
            }}
          >
            Try again
          </Text>
        </Pressable>
      </View>
    );
  } else {
    let listFooter: ReactNode = null;
    if (query.isFetchingNextPage) {
      listFooter = (
        <ActivityIndicator
          style={{ paddingVertical: spacing.lg }}
          color={colors.accent.primary}
        />
      );
    }

    transactionsContent = (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text
            style={[
              styles.sectionTitle,
              {
                backgroundColor: colors.surface.background.page,
                color: colors.text.secondary,
                fontSize: typography.sizes.xs,
                paddingHorizontal: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.xs,
              },
            ]}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            accountName={accountNames.get(item.accountId)}
            categoryName={getCategoryName(item.categoryId, categoryNames)}
            onPress={() => router.push(`/transactions/${item.id}`)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          sections.length === 0 && styles.emptyListContent,
          { paddingBottom: spacing.xl },
        ]}
        stickySectionHeadersEnabled={false}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => query.refetch()}
            tintColor={colors.accent.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.md,
              }}
            >
              No transactions found
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.sm,
              }}
            >
              Try changing or resetting your filters.
            </Text>
          </View>
        }
        ListFooterComponent={listFooter}
      />
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
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <View>
          <Text
            style={[
              styles.title,
              { color: colors.text.primary, fontSize: typography.sizes.xxl },
            ]}
          >
            Transactions
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
            }}
          >
            Your spending and income
          </Text>
        </View>
        <Pressable
          onPress={() => setFiltersVisible(true)}
          style={({ pressed }) => {
            let opacity = 1;
            if (pressed) opacity = 0.7;

            return [
              styles.filterButton,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.md,
                opacity,
              },
            ];
          }}
          accessibilityRole="button"
          accessibilityLabel="Filter transactions"
        >
          <Ionicons
            name="options-outline"
            size={21}
            color={colors.text.primary}
          />
          {activeFilterCount > 0 && (
            <View
              style={[styles.badge, { backgroundColor: colors.accent.primary }]}
            >
              <Text
                style={{ color: colors.button.onPrimary.default, fontSize: 11 }}
              >
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={[styles.chips, { paddingHorizontal: spacing.md }]}>
        <FilterChip
          label={getDateChipLabel(filters, dateFormat)}
          active={Boolean(filters.startDate && filters.endDate)}
          onPress={() => setFiltersVisible(true)}
        />
        <FilterChip
          label={getSelectionChipLabel(
            filters.accounts,
            accounts.length,
            'Accounts',
          )}
          active={Boolean(filters.accounts?.length)}
          onPress={() => setFiltersVisible(true)}
        />
        <FilterChip
          label={getSelectionChipLabel(
            filters.categories,
            categories.length,
            'Categories',
          )}
          active={Boolean(filters.categories?.length)}
          onPress={() => setFiltersVisible(true)}
        />
      </View>

      {transactionsContent}

      <TransactionFiltersSheet
        visible={filtersVisible}
        filters={filters}
        accounts={accounts}
        categories={categories}
        onClose={() => setFiltersVisible(false)}
        onApply={(nextFilters) => {
          setFilters(nextFilters);
          setFiltersVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: Readonly<{
  label: string;
  active: boolean;
  onPress: () => void;
}>) {
  const { colors, borderRadius, typography } = useTheme();
  let backgroundColor = colors.surface.background.primary;
  let borderColor = colors.surface.border.primary;
  let textColor = colors.text.primary;
  if (active) {
    backgroundColor = colors.accent.primary;
    borderColor = colors.accent.primary;
    textColor = colors.button.onPrimary.default;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => {
        let opacity = 1;
        if (pressed) opacity = 0.7;

        return [
          styles.chip,
          {
            backgroundColor,
            borderColor,
            borderRadius: borderRadius.md,
            opacity,
          },
        ];
      }}
    >
      <Text
        style={{
          color: textColor,
          fontSize: typography.sizes.xs,
          fontWeight: '600',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getDateChipLabel(
  filters: TransactionListFilters,
  dateFormat: ReturnType<typeof useMobileUserPreferences>['dateFormat'],
): string {
  if (!filters.startDate || !filters.endDate) return 'Any date';
  return `${formatPreferenceDate(filters.startDate, dateFormat)} – ${formatPreferenceDate(filters.endDate, dateFormat)}`;
}

function getSelectionChipLabel(
  selected: string[] | undefined,
  total: number,
  name: string,
): string {
  if (!selected?.length || selected.length === total) return `All ${name}`;
  return `${selected.length} ${name.toLowerCase()}`;
}

function getCategoryName(
  categoryId: string | null,
  categoryNames: Map<string, string>,
): string | undefined {
  if (!categoryId) return undefined;
  return categoryNames.get(categoryId);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: 78,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontWeight: '700',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -4,
    top: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    maxWidth: 140,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyListContent: {
    justifyContent: 'center',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  sectionTitle: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
