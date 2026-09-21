import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccountMutations } from '@guallet/api-react';
import { Button, TextInput, useTheme } from '@guallet/luna-mobile';
import { AccountTypeIcon } from './AccountTypeIcon';
import { ACCOUNT_TYPE_OPTIONS, getAccountTypeLabel } from '../models/account';

interface AccountFormProps {
  account?: AccountDto | null;
  onCancel: () => void;
  onSaved: (account: AccountDto) => void;
}

export function AccountForm({
  account,
  onCancel,
  onSaved,
}: Readonly<AccountFormProps>) {
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { createAccountMutation, updateAccountMutation } =
    useAccountMutations();
  const [name, setName] = useState(account?.name ?? '');
  const [type, setType] = useState<AccountTypeDto>(
    account?.type ?? AccountTypeDto.CURRENT_ACCOUNT,
  );
  const [currency, setCurrency] = useState(account?.currency ?? 'GBP');
  const [balance, setBalance] = useState(
    account ? String(account.balance.amount) : '0',
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!account) return;
    setName(account.name);
    setType(account.type);
    setCurrency(account.currency);
    setBalance(String(account.balance.amount));
  }, [account]);

  const isPending =
    createAccountMutation.isPending || updateAccountMutation.isPending;

  async function handleSubmit() {
    const normalizedName = name.trim();
    const normalizedCurrency = currency.trim().toUpperCase();
    const parsedBalance = Number(balance.replace(',', '.'));

    if (!normalizedName) {
      setError('Enter an account name.');
      return;
    }
    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      setError('Use a three-letter currency code, such as GBP or EUR.');
      return;
    }
    if (!Number.isFinite(parsedBalance)) {
      setError('Enter a valid balance.');
      return;
    }

    setError(null);
    try {
      const savedAccount = account
        ? await updateAccountMutation.mutateAsync({
            id: account.id,
            request: {
              name: normalizedName,
              type,
              currency: normalizedCurrency,
              balance: parsedBalance,
              create_balance_transaction: true,
            },
          })
        : await createAccountMutation.mutateAsync({
            request: {
              name: normalizedName,
              type,
              currency: normalizedCurrency,
              initial_balance: parsedBalance,
              create_balance_transaction: true,
            },
          });
      onSaved(savedAccount);
    } catch {
      setError(
        `Couldn’t ${account ? 'update' : 'create'} this account. Please try again.`,
      );
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: spacing.lg, padding: spacing.md },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing.xs }}>
          <Text
            style={[
              styles.introTitle,
              { color: colors.text.primary, fontSize: typography.sizes.xl },
            ]}
          >
            {account ? 'Update your account' : 'Add a manual account'}
          </Text>
          <Text
            style={[
              styles.introBody,
              { color: colors.text.secondary, fontSize: typography.sizes.sm },
            ]}
          >
            Keep your balance and account details up to date. You can edit these
            later.
          </Text>
        </View>

        <View
          style={[
            styles.formCard,
            {
              backgroundColor: colors.surface.background.primary,
              borderColor: colors.surface.border.primary,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
            },
          ]}
        >
          <TextInput
            autoCapitalize="words"
            label="Account name"
            onChangeText={setName}
            placeholder="e.g. Everyday current account"
            value={name}
          />
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            label="Currency"
            maxLength={3}
            onChangeText={setCurrency}
            placeholder="GBP"
            value={currency}
          />
          <TextInput
            keyboardType="decimal-pad"
            label="Current balance"
            onChangeText={setBalance}
            placeholder="0.00"
            value={balance}
            description="Use a negative value for money you owe."
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, fontSize: typography.sizes.lg },
            ]}
          >
            Account type
          </Text>
          <View style={[styles.typeGrid, { gap: spacing.sm }]}>
            {ACCOUNT_TYPE_OPTIONS.map((option) => {
              const selected = type === option.type;
              return (
                <Pressable
                  key={option.type}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setType(option.type)}
                  style={({ pressed }) => [
                    styles.typeOption,
                    {
                      backgroundColor: selected
                        ? colors.button.secondary.default
                        : colors.surface.background.primary,
                      borderColor: selected
                        ? colors.accent.primary
                        : colors.surface.border.primary,
                      borderRadius: borderRadius.md,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <AccountTypeIcon
                    color={
                      selected ? colors.accent.primary : colors.text.secondary
                    }
                    size={18}
                    type={option.type}
                  />
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.typeLabel,
                      {
                        color: selected
                          ? colors.accent.primary
                          : colors.text.primary,
                        fontSize: typography.sizes.xs,
                      },
                    ]}
                  >
                    {getAccountTypeLabel(option.type)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error && (
          <Text
            style={[
              styles.error,
              { color: colors.status.error, fontSize: typography.sizes.sm },
            ]}
          >
            {error}
          </Text>
        )}

        <View style={[styles.actions, { gap: spacing.sm }]}>
          <Button
            disabled={isPending}
            onClick={onCancel}
            variant="outline"
            style={styles.actionButton}
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() => void handleSubmit()}
            style={styles.actionButton}
          >
            {isPending ? 'Saving…' : account ? 'Save changes' : 'Add account'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 28 },
  introTitle: { fontWeight: '700' },
  introBody: { lineHeight: 21 },
  formCard: { borderWidth: 1 },
  sectionTitle: { fontWeight: '700' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  typeOption: {
    alignItems: 'center',
    borderWidth: 1,
    gap: 7,
    justifyContent: 'center',
    minHeight: 82,
    padding: 8,
    width: '31.5%',
  },
  typeLabel: { fontWeight: '600', textAlign: 'center' },
  error: { fontWeight: '500', textAlign: 'center' },
  actions: { flexDirection: 'row', marginTop: 'auto' },
  actionButton: { flex: 1 },
});
