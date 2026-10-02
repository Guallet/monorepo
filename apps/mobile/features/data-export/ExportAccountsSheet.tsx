import type { AccountDto } from '@guallet/api-client';
import { useTheme } from '@guallet/luna-mobile';
import { CheckIcon } from '@guallet/luna-mobile/icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useTranslation } from 'react-i18next';

interface ExportAccountsSheetProps {
  accounts: AccountDto[];
  onApply: (ids: string[]) => void;
  onDismiss: () => void;
  selectedIds: string[];
  visible: boolean;
}

export function ExportAccountsSheet({
  accounts,
  onApply,
  onDismiss,
  selectedIds,
  visible,
}: Readonly<ExportAccountsSheetProps>) {
  const { t } = useTranslation();
  const { borderRadius, colors, spacing, typography } = useTheme();
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (visible) setDraftIds(selectedIds);
  }, [selectedIds, visible]);

  function toggle(id: string) {
    setDraftIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
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
            {t('copy_1djdds4')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onDismiss}
            style={styles.cancel}
          >
            <Text
              style={{
                color: colors.accent.primary,
                fontSize: typography.sizes.sm,
                fontWeight: '600',
              }}
            >
              {t('copy_ew9em3')}
            </Text>
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.md }}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        >
          <AccountChoice
            checked={draftIds.length === 0}
            label={t('copy_uclrhs')}
            onPress={() => setDraftIds([])}
          />
          {accounts.map((account) => (
            <AccountChoice
              key={account.id}
              checked={draftIds.includes(account.id)}
              label={account.name}
              onPress={() => toggle(account.id)}
            />
          ))}
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
            onPress={() => onApply(draftIds)}
            style={[
              styles.apply,
              {
                backgroundColor: colors.button.primary.default,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text
              style={{
                color: colors.text.inverse,
                fontSize: typography.sizes.md,
                fontWeight: '600',
              }}
            >
              {t('copy_pgvpm1')}
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

function AccountChoice({
  checked,
  label,
  onPress,
}: Readonly<{ checked: boolean; label: string; onPress: () => void }>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[
        styles.row,
        {
          borderBottomColor: colors.surface.border.primary,
          paddingVertical: spacing.sm,
        },
      ]}
    >
      <Text
        style={[
          styles.rowLabel,
          { color: colors.text.primary, fontSize: typography.sizes.md },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: checked
              ? colors.accent.primary
              : colors.surface.background.primary,
            borderColor: checked
              ? colors.accent.primary
              : colors.surface.border.input,
            borderRadius: borderRadius.sm,
          },
        ]}
      >
        {checked && <CheckIcon size={16} color={colors.text.inverse} />}
      </View>
    </Pressable>
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
    minHeight: 56,
  },
  rowLabel: { flex: 1 },
  checkbox: {
    alignItems: 'center',
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
  apply: { alignItems: 'center', justifyContent: 'center', minHeight: 48 },
});
