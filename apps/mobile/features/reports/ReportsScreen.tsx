import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  useAccounts,
  useCategories,
  useMonthlyReport,
} from '@guallet/api-react';
import { BottomSheet, useTheme } from '@guallet/luna-mobile';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@guallet/luna-mobile/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { SelectionSheet } from '@/components/ui/SelectionSheet';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { CategoryDonut } from './components/CategoryDonut';
import {
  ReportAmount,
  ReportButton as Button,
  ReportCard,
  ReportCategoryRows,
  ReportText,
} from './components/ReportUi';
import {
  ReportFiltersSheet,
  type ReportFilters,
} from './components/ReportFiltersSheet';
import { ReportPeriodSheet } from './components/ReportPeriodSheet';
import {
  categoryDetails,
  periodLabel,
  previousMonth,
  reportCategories,
  shiftMonth,
  type ReportCategory,
  type ReportView,
} from './reportModels';

const tabs: { id: ReportView; label: string }[] = [
  { id: 'spending', label: 'Spending' },
  { id: 'income', label: 'Income' },
  { id: 'cashflow', label: 'Cash flow' },
];

export default function ReportsScreen() {
  const router = useRouter();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { languageTag, defaultCurrency } = useMobileUserPreferences();
  const [period, setPeriod] = useState(previousMonth);
  const [view, setView] = useState<ReportView>('spending');
  const [filters, setFilters] = useState<ReportFilters>({
    accounts: [],
    categories: [],
  });
  const [periodOpen, setPeriodOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [detailPath, setDetailPath] = useState<ReportCategory[]>([]);
  const accountsQuery = useAccounts();
  const categoriesQuery = useCategories();
  const query = useMonthlyReport({ ...period, ...filters });
  const { refetch } = query;
  // Reports reflect edits made elsewhere even when the user returns via Back.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );
  const reports = query.report?.currencies ?? [];
  const currencyReport =
    reports.find((report) => report.currency === selectedCurrency) ??
    reports[0];
  let currency = defaultCurrency;
  if (currencyReport) currency = currencyReport.currency;
  const label = periodLabel(period, languageTag);
  let heading = 'Spending by category';
  let total = 0;
  let rows: ReportCategory[] = [];
  let income = false;
  let moneyView: 'income' | 'spending' = 'spending';
  if (view === 'income') {
    income = true;
    moneyView = 'income';
    heading = 'Income by category';
  }
  if (currencyReport) {
    total = Number(currencyReport.expenses);
    if (income) total = Number(currencyReport.income);
    rows = reportCategories(currencyReport, moneyView);
  }
  let scope = 'All accounts';
  if (filters.accounts.length)
    scope = `${filters.accounts.length} accounts selected`;
  if (filters.categories.length)
    scope += ` · ${filters.categories.length} categories selected`;
  const filterCount = filters.accounts.length + filters.categories.length;
  let filtersLabel = 'Filters';
  if (filterCount) filtersLabel = `Filters (${filterCount})`;
  const today = new Date();
  const currentMonth =
    period.year === today.getUTCFullYear() &&
    period.month === today.getUTCMonth() + 1;
  let maxPeriod = false;
  if (
    period.year >= today.getUTCFullYear() &&
    period.month >= today.getUTCMonth() + 1
  )
    maxPeriod = true;
  let minPeriod = false;
  if (period.year === 1900 && period.month === 1) minPeriod = true;
  const detail = detailPath[detailPath.length - 1];
  const filterLoading = accountsQuery.isLoading || categoriesQuery.isLoading;
  const filterError = accountsQuery.isError || categoriesQuery.isError;
  const refreshing = query.isRefetching && !query.isLoading;

  function changePeriod(next: typeof period) {
    setPeriod(next);
    setPeriodOpen(false);
    setDetailPath([]);
  }
  function resetFilters() {
    setFilters({ accounts: [], categories: [] });
    setDetailPath([]);
  }

  let content;
  if (query.isLoading) {
    content = (
      <ReportCard>
        <ActivityIndicator
          color={colors.accent.primary}
          accessibilityLabel="Loading report"
        />
        <ReportText>Loading your report…</ReportText>
      </ReportCard>
    );
  } else if (query.isError) {
    content = (
      <ReportCard>
        <ReportText heading>Couldn’t load your report</ReportText>
        <ReportText secondary>Check your connection and try again.</ReportText>
        <Button onClick={() => void query.refetch()}>Try again</Button>
      </ReportCard>
    );
  } else if (!currencyReport) {
    content = (
      <ReportCard>
        <ReportText heading>No transactions in this period</ReportText>
        <ReportText secondary>
          Choose a different month or reset the filters.
        </ReportText>
        <Button variant="outline" onClick={() => setPeriodOpen(true)}>
          Change period
        </Button>
        {filterCount > 0 && (
          <Button variant="outline" onClick={resetFilters}>
            Reset filters
          </Button>
        )}
      </ReportCard>
    );
  } else if (view === 'cashflow') {
    content = (
      <>
        <ReportCard>
          <ReportText secondary>NET CASH FLOW</ReportText>
          <ReportAmount
            amount={Number(currencyReport.net)}
            currency={currency}
            locale={languageTag}
            large
          />
          <ReportText secondary>Income minus expenses · {label}</ReportText>
        </ReportCard>
        <ReportCard>
          <ReportText heading>Monthly breakdown</ReportText>
          <ReportText>Income</ReportText>
          <ReportAmount
            amount={Number(currencyReport.income)}
            currency={currency}
            locale={languageTag}
            large
          />
          <ReportText>Expenses</ReportText>
          <ReportAmount
            amount={-Number(currencyReport.expenses)}
            currency={currency}
            locale={languageTag}
            large
          />
        </ReportCard>
      </>
    );
  } else if (total === 0) {
    let title = 'No spending in this period';
    if (income) title = 'No income in this period';
    content = (
      <ReportCard>
        <ReportText heading>{title}</ReportText>
        <ReportText secondary>
          Switch reports or choose another month.
        </ReportText>
        <Button variant="outline" onClick={() => setPeriodOpen(true)}>
          Change period
        </Button>
        {filterCount > 0 && (
          <Button variant="outline" onClick={resetFilters}>
            Reset filters
          </Button>
        )}
      </ReportCard>
    );
  } else {
    content = (
      <>
        <ReportCard>
          <CategoryDonut
            rows={rows}
            total={total}
            currency={currency}
            locale={languageTag}
            income={income}
            period={label}
          />
        </ReportCard>
        <ReportCard>
          <ReportText heading>{heading}</ReportText>
          <ReportCategoryRows
            rows={rows}
            total={total}
            currency={currency}
            locale={languageTag}
            income={income}
            onSelect={(row) => setDetailPath([row])}
          />
        </ReportCard>
      </>
    );
  }

  return (
    <AppScreen
      isHeaderVisible={false}
      safeAreaEdges={['top', 'left', 'right', 'bottom']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void query.refetch()}
            tintColor={colors.accent.primary}
          />
        }
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/');
          }}
          style={[styles.back, { gap: spacing.xs }]}
        >
          <ChevronLeftIcon
            size={spacing.lg}
            color={colors.accent.primary}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text
            style={{
              color: colors.accent.primary,
              fontSize: typography.sizes.md,
            }}
          >
            Dashboard
          </Text>
        </Pressable>
        <Text
          accessibilityRole="header"
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.xxl,
            fontWeight: '700',
          }}
        >
          Reports
        </Text>
        <ReportText secondary>See where your money goes</ReportText>
        <View style={[styles.toolbar, { gap: spacing.sm }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Choose report month, ${label}`}
            onPress={() => setPeriodOpen(true)}
            style={[
              styles.month,
              {
                padding: spacing.md,
                gap: spacing.sm,
                borderRadius: borderRadius.lg,
                borderColor: colors.surface.border.primary,
                backgroundColor: colors.surface.background.primary,
              },
            ]}
          >
            <View style={styles.flex}>
              <ReportText>{label}</ReportText>
            </View>
            <ChevronDownIcon
              size={spacing.lg}
              color={colors.accent.primary}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </Pressable>
          <Button variant="outline" onClick={() => setFiltersOpen(true)}>
            {filtersLabel}
          </Button>
        </View>
        <View style={[styles.toolbar, { gap: spacing.sm }]}>
          <MonthArrow
            label="Previous month"
            previous
            disabled={minPeriod}
            onPress={() => changePeriod(shiftMonth(period, -1))}
          />
          <View style={styles.flex}>
            <ReportText secondary>
              {scope} · {currency}
            </ReportText>
            {currentMonth && <ReportText secondary>Month to date</ReportText>}
          </View>
          <MonthArrow
            label="Next month"
            disabled={maxPeriod}
            onPress={() => changePeriod(shiftMonth(period, 1))}
          />
        </View>
        {reports.length > 1 && (
          <Button variant="outline" onClick={() => setCurrencyOpen(true)}>
            Currency: {currency}
          </Button>
        )}
        <View
          accessibilityRole="tablist"
          style={[
            styles.tabs,
            {
              padding: spacing.xs,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface.background.secondary,
            },
          ]}
        >
          {tabs.map((tab) => {
            let backgroundColor = colors.surface.background.secondary;
            let color = colors.text.secondary;
            if (view === tab.id) {
              backgroundColor = colors.surface.background.primary;
              color = colors.accent.primary;
            }
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: view === tab.id }}
                onPress={() => {
                  setView(tab.id);
                  setDetailPath([]);
                }}
                style={[
                  styles.tab,
                  {
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.xs,
                    borderRadius: borderRadius.md,
                    backgroundColor,
                  },
                ]}
              >
                <Text
                  style={{
                    color,
                    fontSize: typography.sizes.sm,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {content}
        <ReportText secondary>
          Positive amounts are income; negative amounts are spending. Transfers
          and refunds are included. Currencies are shown separately. Reports use
          UTC calendar months.
        </ReportText>
      </ScrollView>
      {periodOpen && (
        <ReportPeriodSheet
          period={period}
          locale={languageTag}
          onClose={() => setPeriodOpen(false)}
          onSelect={changePeriod}
        />
      )}
      {filtersOpen && (
        <ReportFiltersSheet
          applied={filters}
          accounts={accountsQuery.accounts}
          categories={categoriesQuery.categories}
          loading={filterLoading}
          error={filterError}
          onRetry={() => {
            void accountsQuery.refetch();
            void categoriesQuery.refetch();
          }}
          onClose={() => setFiltersOpen(false)}
          onApply={(next) => {
            setFilters(next);
            setFiltersOpen(false);
            setDetailPath([]);
          }}
        />
      )}
      <SelectionSheet
        visible={currencyOpen}
        title="Report currency"
        options={reports.map((report) => ({
          id: report.currency,
          label: report.currency,
        }))}
        selectedId={currency}
        onClose={() => setCurrencyOpen(false)}
        onSelect={(id) => {
          if (id) setSelectedCurrency(id);
          setDetailPath([]);
        }}
      />
      {detail && (
        <BottomSheet
          isOpen
          title={detail.name}
          showCloseIcon
          onClose={() => setDetailPath([])}
          snapPoints={['full']}
        >
          <ScrollView
            contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
          >
            {detailPath.length > 1 && (
              <Button
                variant="outline"
                onClick={() => setDetailPath((current) => current.slice(0, -1))}
              >
                Back to parent category
              </Button>
            )}
            <ReportText secondary>
              {label} · {currency}
            </ReportText>
            <ReportCategoryRows
              rows={categoryDetails(detail)}
              total={detail.amount}
              currency={currency}
              locale={languageTag}
              income={income}
              onSelect={(row) => setDetailPath((current) => [...current, row])}
            />
          </ScrollView>
        </BottomSheet>
      )}
    </AppScreen>
  );
}

function MonthArrow({
  label,
  previous = false,
  disabled,
  onPress,
}: Readonly<{
  label: string;
  previous?: boolean;
  disabled: boolean;
  onPress: () => void;
}>) {
  const { colors, spacing } = useTheme();
  let Icon = ChevronRightIcon;
  let color = colors.accent.primary;
  if (previous) Icon = ChevronLeftIcon;
  if (disabled) color = colors.text.disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.arrow}
    >
      <Icon
        size={spacing.lg}
        color={color}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  flex: { flex: 1 },
  toolbar: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  month: {
    flex: 1,
    minWidth: 160,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  tabs: { flexDirection: 'row', alignItems: 'stretch' },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
