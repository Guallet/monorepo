import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { AccountDto, CategoryDto } from '@guallet/api-client';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@guallet/luna-mobile';
import { BottomSheet } from '@/components/ui/BottomSheet';
import {
  DateRangePreset,
  TransactionFilterDraft,
  TransactionListFilters,
} from '../models';
import { endOfDay, formatDateRange, getDateRange, startOfDay } from '../utils';

interface TransactionFiltersSheetProps {
  visible: boolean;
  filters: TransactionListFilters;
  accounts: AccountDto[];
  categories: CategoryDto[];
  onClose: () => void;
  onApply: (filters: TransactionListFilters) => void;
}

function createDraft(filters: TransactionListFilters): TransactionFilterDraft {
  let datePreset: DateRangePreset = 'all';
  if (filters.startDate) datePreset = 'custom';

  return {
    accountIds: filters.accounts ?? [],
    categoryIds: filters.categories ?? [],
    startDate: filters.startDate ?? null,
    endDate: filters.endDate ?? null,
    datePreset,
  };
}

export function TransactionFiltersSheet({
  visible,
  filters,
  accounts,
  categories,
  onClose,
  onApply,
}: Readonly<TransactionFiltersSheetProps>) {
  const { colors, spacing, typography } = useTheme();
  const [draft, setDraft] = useState(() => createDraft(filters));
  const [datePickerTarget, setDatePickerTarget] = useState<
    'start' | 'end' | null
  >(null);

  useEffect(() => {
    if (visible) {
      setDraft(createDraft(filters));
      setDatePickerTarget(null);
    }
  }, [filters, visible]);

  const dateLabel = formatDateRange(draft.startDate, draft.endDate);

  const selectedAccountCount = draft.accountIds.length;
  const selectedCategoryCount = draft.categoryIds.length;
  let datePickerValue = draft.startDate ?? new Date();
  let minimumDate: Date | undefined;
  if (datePickerTarget === 'end') {
    datePickerValue = draft.endDate ?? draft.startDate ?? new Date();
    minimumDate = draft.startDate ?? undefined;
  }

  function setPreset(preset: DateRangePreset) {
    if (preset === 'all') {
      setDraft((current) => ({
        ...current,
        datePreset: preset,
        startDate: null,
        endDate: null,
      }));
      return;
    }

    if (preset === 'custom') {
      setDraft((current) => ({ ...current, datePreset: preset }));
      setDatePickerTarget('start');
      return;
    }

    const range = getDateRange(preset);
    setDraft((current) => ({
      ...current,
      datePreset: preset,
      startDate: range.startDate,
      endDate: range.endDate,
    }));
  }

  function handleDateChange(event: DateTimePickerEvent, date?: Date) {
    if (event.type === 'dismissed' || !date || !datePickerTarget) {
      setDatePickerTarget(null);
      return;
    }

    if (datePickerTarget === 'start') {
      const nextStart = startOfDay(date);
      setDraft((current) => {
        let nextEndDate = endOfDay(nextStart);
        if (current.endDate && current.endDate >= nextStart) {
          nextEndDate = current.endDate;
        }

        return {
          ...current,
          datePreset: 'custom',
          startDate: nextStart,
          endDate: nextEndDate,
        };
      });
      setDatePickerTarget('end');
    } else {
      setDraft((current) => {
        let nextEndDate = date;
        if (current.startDate && date < current.startDate) {
          nextEndDate = current.startDate;
        }

        return {
          ...current,
          datePreset: 'custom',
          endDate: endOfDay(nextEndDate),
        };
      });
      setDatePickerTarget(null);
    }
  }

  function toggleAccount(id: string) {
    setDraft((current) => {
      const allIds = accounts.map((account) => account.id);
      let selected: string[];
      if (current.accountIds.length === 0) {
        selected = allIds.filter((accountId) => accountId !== id);
      } else if (current.accountIds.includes(id)) {
        selected = current.accountIds.filter((accountId) => accountId !== id);
      } else {
        selected = [...current.accountIds, id];
      }

      let accountIds = selected;
      if (selected.length === allIds.length) accountIds = [];

      return {
        ...current,
        accountIds,
      };
    });
  }

  function toggleCategory(id: string) {
    setDraft((current) => {
      const allIds = categories.map((category) => category.id);
      let selected: string[];
      if (current.categoryIds.length === 0) {
        selected = allIds.filter((categoryId) => categoryId !== id);
      } else if (current.categoryIds.includes(id)) {
        selected = current.categoryIds.filter(
          (categoryId) => categoryId !== id,
        );
      } else {
        selected = [...current.categoryIds, id];
      }

      let categoryIds = selected;
      if (selected.length === allIds.length) categoryIds = [];

      return {
        ...current,
        categoryIds,
      };
    });
  }

  function apply() {
    const nextFilters: TransactionListFilters = {};
    if (draft.accountIds.length > 0) nextFilters.accounts = draft.accountIds;
    if (draft.categoryIds.length > 0) {
      nextFilters.categories = draft.categoryIds;
    }
    if (draft.startDate && draft.endDate) {
      nextFilters.startDate = draft.startDate;
      nextFilters.endDate = draft.endDate;
    }
    onApply(nextFilters);
  }

  return (
    <BottomSheet
      contentPadding={0}
      isPresented={visible}
      onDismiss={onClose}
      snapPoints={['full']}
    >
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface.background.primary,
            padding: spacing.lg,
          },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.title,
                { color: colors.text.primary, fontSize: typography.sizes.lg },
              ]}
            >
              Filter transactions
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.xs,
              }}
            >
              Choose one or more filters
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: spacing.lg,
            paddingBottom: spacing.md,
          }}
        >
          <FilterSection title="Date range">
            <View style={styles.presetGrid}>
              <PresetButton
                label="Any date"
                selected={draft.datePreset === 'all'}
                onPress={() => setPreset('all')}
              />
              <PresetButton
                label="Today"
                selected={draft.datePreset === 'today'}
                onPress={() => setPreset('today')}
              />
              <PresetButton
                label="This month"
                selected={draft.datePreset === 'this-month'}
                onPress={() => setPreset('this-month')}
              />
              <PresetButton
                label="Last 30 days"
                selected={draft.datePreset === 'last-30-days'}
                onPress={() => setPreset('last-30-days')}
              />
            </View>
            <Pressable
              onPress={() => setPreset('custom')}
              style={[
                styles.fieldButton,
                { borderColor: colors.surface.border.input },
              ]}
            >
              <View>
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.sizes.xs,
                  }}
                >
                  Custom range
                </Text>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.md,
                  }}
                >
                  {dateLabel}
                </Text>
              </View>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.text.secondary}
              />
            </Pressable>
          </FilterSection>

          <FilterSection
            title="Accounts"
            summary={getSelectionSummary(selectedAccountCount, 'accounts')}
          >
            <SelectionList
              options={accounts.map((account) => ({
                id: account.id,
                label: account.name,
              }))}
              selectedIds={draft.accountIds}
              allSelected={selectedAccountCount === 0}
              onToggle={toggleAccount}
              onSelectAll={() =>
                setDraft((current) => ({ ...current, accountIds: [] }))
              }
            />
          </FilterSection>

          <FilterSection
            title="Categories"
            summary={getSelectionSummary(selectedCategoryCount, 'categories')}
          >
            <SelectionList
              options={categories.map((category) => ({
                id: category.id,
                label: category.name,
              }))}
              selectedIds={draft.categoryIds}
              allSelected={selectedCategoryCount === 0}
              onToggle={toggleCategory}
              onSelectAll={() =>
                setDraft((current) => ({ ...current, categoryIds: [] }))
              }
            />
          </FilterSection>
        </ScrollView>

        <View style={[styles.actions, { gap: spacing.sm }]}>
          <Pressable
            onPress={() => {
              setDraft(createDraft({}));
            }}
            style={[
              styles.actionButton,
              { borderColor: colors.surface.border.input },
            ]}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.md,
              }}
            >
              Reset
            </Text>
          </Pressable>
          <Pressable
            onPress={apply}
            style={[
              styles.actionButton,
              styles.primaryAction,
              { backgroundColor: colors.accent.primary },
            ]}
          >
            <Text
              style={{
                color: colors.button.onPrimary.default,
                fontSize: typography.sizes.md,
              }}
            >
              Apply filters
            </Text>
          </Pressable>
        </View>
        {datePickerTarget && (
          <DateTimePicker
            value={datePickerValue}
            mode="date"
            maximumDate={new Date()}
            minimumDate={minimumDate}
            onChange={handleDateChange}
          />
        )}
      </View>
    </BottomSheet>
  );
}

function FilterSection({
  title,
  summary,
  children,
}: Readonly<{
  title: string;
  summary?: string;
  children: React.ReactNode;
}>) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text.primary, fontSize: typography.sizes.md },
          ]}
        >
          {title}
        </Text>
        {summary && (
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.xs,
            }}
          >
            {summary}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

function getSelectionSummary(count: number, name: string): string {
  if (count === 0) return `All ${name}`;
  return `${count} selected`;
}

function PresetButton({
  label,
  selected,
  onPress,
}: Readonly<{
  label: string;
  selected: boolean;
  onPress: () => void;
}>) {
  const { colors, borderRadius, typography } = useTheme();
  let backgroundColor = colors.surface.background.secondary;
  let borderColor = colors.surface.border.primary;
  let textColor = colors.text.primary;
  if (selected) {
    backgroundColor = colors.accent.primary;
    borderColor = colors.accent.primary;
    textColor = colors.button.onPrimary.default;
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.preset,
        {
          backgroundColor,
          borderColor,
          borderRadius: borderRadius.md,
        },
      ]}
    >
      <Text
        style={{
          color: textColor,
          fontSize: typography.sizes.sm,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SelectionList({
  options,
  selectedIds,
  allSelected,
  onToggle,
  onSelectAll,
}: Readonly<{
  options: Array<{ id: string; label: string }>;
  selectedIds: string[];
  allSelected: boolean;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
}>) {
  const { colors, spacing, typography } = useTheme();

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <View>
      <Pressable
        onPress={onSelectAll}
        style={[
          styles.selectionRow,
          { borderBottomColor: colors.surface.border.primary },
        ]}
      >
        <Text
          style={{ color: colors.text.primary, fontSize: typography.sizes.sm }}
        >
          All
        </Text>
        {allSelected && <Text style={{ color: colors.accent.primary }}>✓</Text>}
      </Pressable>
      {options.map((option) => {
        const selected = allSelected || selectedSet.has(option.id);
        return (
          <Pressable
            key={option.id}
            onPress={() => onToggle(option.id)}
            style={[
              styles.selectionRow,
              {
                borderBottomColor: colors.surface.border.primary,
                paddingLeft: spacing.sm,
              },
            ]}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.sm,
              }}
              numberOfLines={1}
            >
              {option.label}
            </Text>
            {selected && (
              <Text style={{ color: colors.accent.primary }}>✓</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '700',
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preset: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldButton: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: 'row',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    borderWidth: 0,
  },
});
