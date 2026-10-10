import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { BottomSheet, useTheme } from '@guallet/luna-mobile';
import { CheckIcon } from '@guallet/luna-mobile/icons';
import type { AccountDto, CategoryDto } from '@guallet/api-client';
import { ReportButton as Button, ReportText } from './ReportUi';

export type ReportFilters = { accounts: string[]; categories: string[] };

export function ReportFiltersSheet({
  applied,
  accounts,
  categories,
  loading,
  error,
  onRetry,
  onClose,
  onApply,
}: Readonly<{
  applied: ReportFilters;
  accounts: AccountDto[];
  categories: CategoryDto[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onClose: () => void;
  onApply: (filters: ReportFilters) => void;
}>) {
  const [draft, setDraft] = useState(applied);
  const { spacing, colors } = useTheme();
  function toggle(key: keyof ReportFilters, id: string) {
    setDraft((current) => {
      let ids = [...current[key], id];
      if (current[key].includes(id))
        ids = current[key].filter((value) => value !== id);
      return { ...current, [key]: ids };
    });
  }
  return (
    <BottomSheet
      isOpen
      title="Report filters"
      showCloseIcon
      onClose={onClose}
      snapPoints={['full']}
    >
      <View style={[styles.fill, { gap: spacing.md }]}>
        <ScrollView
          contentContainerStyle={{ gap: spacing.md, padding: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          <ReportText secondary>
            Choose accounts and categories. Parent categories include their
            subcategories.
          </ReportText>
          {loading && (
            <ActivityIndicator
              accessibilityLabel="Loading filter options"
              color={colors.accent.primary}
            />
          )}
          {error && (
            <>
              <ReportText>Couldn’t load filter options.</ReportText>
              <Button variant="outline" onClick={onRetry}>
                Try again
              </Button>
            </>
          )}
          {!loading && !error && (
            <>
              <ReportText heading>Accounts</ReportText>
              <FilterChoice
                label="All accounts"
                checked={draft.accounts.length === 0}
                onPress={() =>
                  setDraft((current) => ({ ...current, accounts: [] }))
                }
              />
              {accounts.map((account) => (
                <FilterChoice
                  key={account.id}
                  label={`${account.name} · ${account.currency}`}
                  checked={draft.accounts.includes(account.id)}
                  onPress={() => toggle('accounts', account.id)}
                />
              ))}
              <ReportText heading>Categories</ReportText>
              <FilterChoice
                label="All categories, including untagged"
                checked={draft.categories.length === 0}
                onPress={() =>
                  setDraft((current) => ({ ...current, categories: [] }))
                }
              />
              {categories.map((category) => (
                <FilterChoice
                  key={category.id}
                  label={category.name}
                  checked={draft.categories.includes(category.id)}
                  onPress={() => toggle('categories', category.id)}
                />
              ))}
            </>
          )}
          <Button
            variant="outline"
            onClick={() => setDraft({ accounts: [], categories: [] })}
          >
            Reset filters
          </Button>
          <Button disabled={loading || error} onClick={() => onApply(draft)}>
            Apply filters
          </Button>
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

function FilterChoice({
  label,
  checked,
  onPress,
}: Readonly<{ label: string; checked: boolean; onPress: () => void }>) {
  const { colors, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[styles.choice, { gap: spacing.md, paddingVertical: spacing.sm }]}
    >
      <View style={styles.fill}>
        <ReportText>{label}</ReportText>
      </View>
      {checked && (
        <CheckIcon
          size={spacing.lg}
          color={colors.accent.primary}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  choice: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
