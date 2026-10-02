import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AccountDto } from '@guallet/api-client';
import { useTheme } from '@guallet/luna-mobile';
import { CheckIcon } from '@guallet/luna-mobile/icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { formatAccountCurrency } from '@/features/accounts/models/account';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      isPresented={visible}
      onDismiss={onDismiss}
      snapPoints={['full']}
    >
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.surface.background.primary },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              borderBottomColor: colors.surface.border.primary,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <Text
            accessibilityRole="header"
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '700',
            }}
          >
            {t('copy_19vosec')}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('copy_1ullyfi')}
            onPress={onDismiss}
            style={styles.cancel}
          >
            <Text style={{ color: colors.accent.primary }}>
              {t('copy_ew9em3')}
            </Text>
          </Pressable>
        </View>
        <Text
          style={{
            color: colors.text.secondary,
            padding: spacing.md,
            fontSize: typography.sizes.sm,
          }}
        >
          {t('copy_18dm8k3')}
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
                accessibilityLabel={t('{{name}}, {{currency}}', {
                  name: account.name,
                  currency: account.currency,
                })}
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
                    {formatAccountCurrency(
                      account.balance.amount,
                      account.currency,
                    )}{' '}
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
            accessibilityLabel={t('copy_pgvpm1')}
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
              {t('copy_pgvpm1')}
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 62,
  },
  cancel: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
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
