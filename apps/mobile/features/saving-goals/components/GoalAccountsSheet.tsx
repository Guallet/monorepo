import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AccountDto } from '@guallet/api-client';
import { useTheme, BottomSheet } from '@guallet/luna-mobile';
import { CheckIcon } from '@guallet/luna-mobile/icons';
import { formatMoney } from '@/utils/formatMoney';

type Props = {
  accounts: AccountDto[];
  selectedIds: string[];
  visible: boolean;
  onApply: (ids: string[]) => void;
  onDismiss: () => void;
};

export function GoalAccountsSheet({
  accounts,
  selectedIds,
  visible,
  onApply,
  onDismiss,
}: Readonly<Props>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  useEffect(() => {
    if (visible) setDraftIds(selectedIds);
  }, [selectedIds, visible]);
  const selectedCurrency = accounts.find((account) =>
    draftIds.includes(account.id),
  )?.currency;

  function toggle(account: AccountDto) {
    if (draftIds.includes(account.id)) {
      setDraftIds((ids) => ids.filter((id) => id !== account.id));
      return;
    }
    if (selectedCurrency && account.currency !== selectedCurrency) return;
    setDraftIds((ids) => [...ids, account.id]);
  }

  return (
    <BottomSheet
      contentPadding={0}
      isOpen={visible}
      title="Linked accounts"
      showCloseIcon
      onClose={onDismiss}
      snapPoints={['full']}
    >
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.surface.background.primary },
        ]}
      >
        <Text
          style={{
            color: colors.text.secondary,
            padding: spacing.md,
            fontSize: typography.sizes.sm,
          }}
        >
          Choose one or more accounts in the same currency. Their balances
          determine goal progress.
        </Text>
        <ScrollView
          style={styles.list}
          contentContainerStyle={{ paddingHorizontal: spacing.md }}
        >
          {accounts.map((account) => {
            const checked = draftIds.includes(account.id);
            const disabled = Boolean(
              selectedCurrency &&
              account.currency !== selectedCurrency &&
              !checked,
            );
            return (
              <Pressable
                key={account.id}
                accessibilityLabel={`${account.name}, ${account.currency}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked, disabled }}
                disabled={disabled}
                onPress={() => toggle(account)}
                style={[
                  styles.row,
                  {
                    borderBottomColor: colors.surface.border.primary,
                    opacity: disabled ? 0.5 : 1,
                  },
                ]}
              >
                <View style={styles.rowText}>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.sizes.md,
                    }}
                  >
                    {account.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.sizes.sm,
                    }}
                  >
                    {formatMoney(account.balance.amount, account.currency, {
                      locale: 'en-GB',
                    })}{' '}
                    · {account.currency}
                  </Text>
                </View>
                <View
                  style={[
                    styles.check,
                    {
                      borderColor: checked
                        ? colors.accent.primary
                        : colors.surface.border.input,
                      backgroundColor: checked
                        ? colors.accent.primary
                        : colors.surface.background.primary,
                      borderRadius: borderRadius.sm,
                    },
                  ]}
                >
                  {checked && (
                    <CheckIcon size={16} color={colors.text.inverse} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <View
          style={[
            styles.footer,
            {
              borderTopColor: colors.surface.border.primary,
              padding: spacing.md,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Apply accounts"
            accessibilityState={{ disabled: draftIds.length === 0 }}
            disabled={draftIds.length === 0}
            onPress={() => onApply(draftIds)}
            style={[
              styles.apply,
              {
                backgroundColor:
                  draftIds.length === 0
                    ? colors.surface.background.disabled
                    : colors.button.primary.default,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={{ color: colors.text.inverse, fontWeight: '600' }}>
              Apply accounts
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  list: { flex: 1 },
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 66,
  },
  rowText: { flex: 1, gap: 3 },
  check: {
    alignItems: 'center',
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
  apply: { alignItems: 'center', justifyContent: 'center', minHeight: 48 },
});
