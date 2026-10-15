import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { useSubscriptions } from '@guallet/api-react';
import {
  RecurringPaymentType,
  type SubscriptionDto,
} from '@guallet/api-client';
import { TextInput, useTheme } from '@guallet/luna-mobile';
import { PlusIcon } from '@guallet/luna-mobile/icons';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { formatPreferenceDate } from '@/utils/formatPreferenceDate';
import {
  addDays,
  calendarDate,
  cadenceLabel,
  nextPaymentDate,
  summarise,
  typeLabel,
  upcomingPayments,
} from '../recurring';
import {
  Card,
  Choice,
  Copy,
  ItemRow,
  Loading,
  RecurringScreen,
  Status,
  Summary,
} from '../components/RecurringComponents';

type ListRow = { key: string; item: SubscriptionDto; meta: string };
type ListSection = { title: string; data: ListRow[] };
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: RecurringPaymentType.SUBSCRIPTION, label: 'Subscriptions' },
  { id: RecurringPaymentType.REGULAR_PAYMENT, label: 'Payments' },
  { id: RecurringPaymentType.REGULAR_INCOME, label: 'Income' },
];

export default function RecurringListScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { dateFormat } = useMobileUserPreferences();
  const { subscriptions, data, isLoading, isError, isRefetching, refetch } =
    useSubscriptions();
  const [view, setView] = useState('upcoming');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [today, setToday] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      setToday(new Date());
    }, []),
  );
  const filtered = useMemo(
    () =>
      subscriptions.filter(
        (item) =>
          (filter === 'all' || item.type === filter) &&
          (view === 'upcoming' ||
            item.name
              .toLocaleLowerCase()
              .includes(search.trim().toLocaleLowerCase())),
      ),
    [subscriptions, filter, search, view],
  );
  const estimate = view === 'all';
  const sections = useMemo<ListSection[]>(() => {
    if (view === 'upcoming') {
      const occurrences = upcomingPayments(filtered, today, addDays(today, 29));
      const groups = new Map<string, ListSection>();
      for (const { item, date, key } of occurrences) {
        const dateKey = calendarDate(date);
        let title = formatPreferenceDate(date, dateFormat);
        if (dateKey === calendarDate(today)) title = `Today · ${title}`;
        else if (dateKey === calendarDate(addDays(today, 1)))
          title = `Tomorrow · ${title}`;
        let section = groups.get(dateKey);
        if (!section) {
          section = { title, data: [] };
          groups.set(dateKey, section);
        }
        section.data.push({
          item,
          key,
          meta: `${typeLabel(item.type)} · ${cadenceLabel(item.cadence)}`,
        });
      }
      return [...groups.values()];
    }
    const scheduled: ListRow[] = [],
      undated: ListRow[] = [];
    const sorted = [...filtered].sort((a, b) => {
      const aDate = nextPaymentDate(a, today)?.getTime() ?? Infinity;
      const bDate = nextPaymentDate(b, today)?.getTime() ?? Infinity;
      return aDate - bDate || a.name.localeCompare(b.name);
    });
    for (const item of sorted) {
      const date = nextPaymentDate(item, today);
      let meta = `${typeLabel(item.type)} · ${cadenceLabel(item.cadence)} · Date not set`;
      if (date)
        meta = `${cadenceLabel(item.cadence)} · Next ${formatPreferenceDate(date, dateFormat)}`;
      const row = { item, key: item.id, meta };
      if (date) scheduled.push(row);
      else undated.push(row);
    }
    const result: ListSection[] = [];
    if (scheduled.length) result.push({ title: 'Scheduled', data: scheduled });
    if (undated.length) result.push({ title: 'Date not set', data: undated });
    return result;
  }, [filtered, view, today, dateFormat]);
  const totals = useMemo(() => {
    if (estimate) return summarise(filtered, true);
    const first = new Date(today.getFullYear(), today.getMonth(), 1, 12);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0, 12);
    return summarise(
      upcomingPayments(filtered, first, last).map((row) => row.item),
      false,
    );
  }, [filtered, today, estimate]);
  const undatedCount = filtered.filter(
    (item) => !nextPaymentDate(item, today),
  ).length;
  const add = () =>
    router.push({ pathname: '/recurring/new', params: { type: filter } });
  const headerRight = () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add recurring item"
      onPress={add}
      style={styles.iconButton}
    >
      <PlusIcon color={colors.accent.primary} size={spacing.lg} />
    </Pressable>
  );
  if (isLoading)
    return (
      <RecurringScreen title="Recurring">
        <Loading />
      </RecurringScreen>
    );
  if (isError && !data)
    return (
      <RecurringScreen title="Recurring">
        <View style={{ padding: spacing.md }}>
          <Status
            title="Couldn’t load recurring items"
            message="Check your connection and try again."
            action="Try again"
            onPress={() => void refetch()}
          />
        </View>
      </RecurringScreen>
    );
  let emptyTitle = 'No matching items';
  let emptyMessage = 'Try another search or clear the filters.';
  let emptyAction = 'Clear filters';
  let emptyPress = () => {
    setFilter('all');
    setSearch('');
  };
  if (!subscriptions.length) {
    emptyTitle = 'No recurring items yet';
    emptyMessage =
      'Keep track of subscriptions, regular payments and income in one place.';
    emptyAction = 'Add your first item';
    emptyPress = add;
  } else if (view === 'upcoming' && filter === 'all') {
    emptyTitle = 'No payments expected in the next 30 days';
    emptyMessage =
      'View all items to check your schedules or add a first payment date.';
    emptyAction = 'View all items';
    emptyPress = () => setView('all');
  }
  return (
    <RecurringScreen title="Recurring" headerRight={headerRight}>
      <SectionList
        sections={sections}
        keyExtractor={(row) => row.key}
        stickySectionHeadersEnabled={false}
        refreshing={isRefetching}
        onRefresh={() => {
          setToday(new Date());
          void refetch();
        }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <View style={[styles.controls, { gap: spacing.sm }]}>
              <Choice
                label="Upcoming"
                selected={view === 'upcoming'}
                onPress={() => setView('upcoming')}
              />
              <Choice
                label="All items"
                selected={estimate}
                onPress={() => setView('all')}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm }}
            >
              {FILTERS.map((option) => (
                <Choice
                  key={option.id}
                  label={option.label}
                  selected={filter === option.id}
                  onPress={() => setFilter(option.id)}
                />
              ))}
            </ScrollView>
            {isError && (
              <Status
                title="Couldn’t refresh items"
                message="Showing your last loaded schedules."
                action="Try again"
                onPress={() => void refetch()}
              />
            )}
            {subscriptions.length > 0 && (
              <Summary totals={totals} estimate={estimate} />
            )}
            {estimate && (
              <TextInput
                accessibilityLabel="Search recurring items"
                placeholder="Search recurring items"
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
              />
            )}
            {undatedCount > 0 && view === 'upcoming' && (
              <Copy muted>
                {undatedCount} without a date. Add a first payment date in All
                items to include them in upcoming payments.
              </Copy>
            )}
            {!estimate && subscriptions.length > 0 && (
              <Copy heading>Next 30 days</Copy>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={{ paddingTop: spacing.md, paddingBottom: spacing.sm }}>
            <Copy heading>{section.title}</Copy>
          </View>
        )}
        renderItem={({ item: row }) => (
          <Card>
            <ItemRow
              item={row.item}
              meta={row.meta}
              onPress={() =>
                router.push({
                  pathname: '/recurring/[id]',
                  params: { id: row.item.id },
                })
              }
            />
          </Card>
        )}
        ListEmptyComponent={
          <View style={{ paddingTop: spacing.md }}>
            <Status
              title={emptyTitle}
              message={emptyMessage}
              action={emptyAction}
              onPress={emptyPress}
            />
          </View>
        }
      />
    </RecurringScreen>
  );
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', flexWrap: 'wrap' },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
