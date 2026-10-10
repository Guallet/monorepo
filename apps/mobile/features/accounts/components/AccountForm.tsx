import {
  Button,
  BottomSheet,
  KeyboardAwareScrollView,
  TextInput,
  useTheme,
} from '@guallet/luna-mobile';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccountMutations, useInstitutions } from '@guallet/api-react';
import { AccountTypeIcon } from './AccountTypeIcon';
import { CurrencyInput } from '@/components/CurrencyInput';
import { ACCOUNT_TYPE_OPTIONS, getAccountTypeLabel } from '../models/account';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';

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
  const { defaultCurrency } = useMobileUserPreferences();
  const { createAccountMutation, updateAccountMutation } =
    useAccountMutations();
  const institutionsQuery = useInstitutions({ enabled: Boolean(account) });
  const [name, setName] = useState(account?.name ?? '');
  const [type, setType] = useState<AccountTypeDto>(
    account?.type ?? AccountTypeDto.CURRENT_ACCOUNT,
  );
  const [currency, setCurrency] = useState(
    account?.currency ?? defaultCurrency,
  );
  const hasSelectedCurrency = useRef(Boolean(account));
  const [balance, setBalance] = useState(
    account ? String(account.balance.amount) : '0',
  );
  const [institutionId, setInstitutionId] = useState<string | null>(
    account?.institutionId ?? null,
  );
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!account) return;
    setName(account.name);
    setType(account.type);
    setCurrency(account.currency);
    setBalance(String(account.balance.amount));
    setInstitutionId(account.institutionId ?? null);
  }, [account]);

  useEffect(() => {
    if (!account && !hasSelectedCurrency.current) {
      setCurrency(defaultCurrency);
    }
  }, [account, defaultCurrency]);

  const isPending =
    createAccountMutation.isPending || updateAccountMutation.isPending;
  const institutions = [...institutionsQuery.institutions].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  let institutionLabel = 'No institution';
  if (institutionId) {
    institutionLabel =
      institutions.find((institution) => institution.id === institutionId)
        ?.name ?? 'Current institution';
  }

  function selectInstitution(id: string | null) {
    setInstitutionId(id);
    setError(null);
    setShowInstitutionPicker(false);
  }

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
              institution_id: institutionId,
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
    <View style={styles.flex}>
      <KeyboardAwareScrollView
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
          {account && (
            <View style={{ gap: spacing.xs }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.sizes.sm,
                  fontWeight: '600',
                }}
              >
                Institution
              </Text>
              <Button
                accessibilityLabel={`Institution: ${institutionLabel}`}
                accessibilityHint="Choose another institution or remove the institution from this account."
                disabled={isPending}
                onClick={() => setShowInstitutionPicker(true)}
                variant="outline"
              >
                {institutionLabel}
              </Button>
            </View>
          )}
          <CurrencyInput
            onValueChanged={(selectedCurrency) => {
              hasSelectedCurrency.current = true;
              setCurrency(selectedCurrency ?? '');
            }}
            placeholder="Select a currency"
            value={currency}
          />
          <TextInput
            keyboardType={
              Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'decimal-pad'
            }
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
      </KeyboardAwareScrollView>
      {account && (
        <BottomSheet
          isOpen={showInstitutionPicker}
          title="Choose an institution"
          showCloseIcon
          onClose={() => setShowInstitutionPicker(false)}
        >
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: institutionId === null }}
            disabled={isPending}
            onPress={() => selectInstitution(null)}
            style={[
              styles.institutionOption,
              { borderColor: colors.surface.border.primary },
            ]}
          >
            <Text style={{ color: colors.text.primary }}>No institution</Text>
            {institutionId === null && (
              <Text style={{ color: colors.accent.primary }}>Selected</Text>
            )}
          </Pressable>
          <FlatList
            data={institutions}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text
                style={{
                  color: colors.text.secondary,
                  padding: spacing.md,
                  textAlign: 'center',
                }}
              >
                {institutionsQuery.isLoading
                  ? 'Loading institutions…'
                  : 'No institutions available'}
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: institutionId === item.id }}
                accessibilityLabel={item.name}
                disabled={isPending}
                onPress={() => selectInstitution(item.id)}
                style={[
                  styles.institutionOption,
                  { borderColor: colors.surface.border.primary },
                ]}
              >
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <Text style={{ color: colors.text.primary }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: colors.text.secondary }}>
                    {item.user_id === null ? 'Shared' : 'Custom'}
                  </Text>
                </View>
                {institutionId === item.id && (
                  <Text style={{ color: colors.accent.primary }}>Selected</Text>
                )}
              </Pressable>
            )}
            style={{ flex: 1 }}
          />
          {institutionsQuery.isError && (
            <Button
              onClick={() => void institutionsQuery.refetch()}
              variant="outline"
            >
              Retry loading institutions
            </Button>
          )}
        </BottomSheet>
      )}
    </View>
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
  institutionOption: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 8,
  },
  typeLabel: { fontWeight: '600', textAlign: 'center' },
  error: { fontWeight: '500', textAlign: 'center' },
  actions: { flexDirection: 'row', marginTop: 'auto' },
  actionButton: { flex: 1 },
});
