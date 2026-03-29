import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useAccountMutations } from '@guallet/api-react';
import { AccountTypeDto, CreateAccountRequest } from '@guallet/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Section,
  TextInput,
  useTheme,
} from '@luna-ui/react-native';
import { useRouter } from 'expo-router';

const accountTypes: { label: string; value: AccountTypeDto }[] = [
  { label: 'Current Account', value: AccountTypeDto.CURRENT_ACCOUNT },
  { label: 'Credit Card', value: AccountTypeDto.CREDIT_CARD },
  { label: 'Savings', value: AccountTypeDto.SAVINGS },
  { label: 'Investment', value: AccountTypeDto.INVESTMENT },
  { label: 'Mortgage', value: AccountTypeDto.MORTGAGE },
  { label: 'Loan', value: AccountTypeDto.LOAN },
  { label: 'Pension', value: AccountTypeDto.PENSION },
];

export function AddAccountScreen() {
  const router = useRouter();
  const { createAccountMutation } = useAccountMutations();
  const { spacing } = useTheme();

  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<AccountTypeDto>(
    AccountTypeDto.CURRENT_ACCOUNT,
  );
  const [currency, setCurrency] = useState('GBP');
  const [balance, setBalance] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Account name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const request: CreateAccountRequest = {
        name: name.trim(),
        type: selectedType,
        currency,
        initial_balance: parseFloat(balance) || 0,
        create_balance_transaction: true,
      };

      await createAccountMutation.mutateAsync({ request });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen headerTitle="Add Account">
        <ScrollView
          contentContainerStyle={{ padding: spacing.md, gap: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Section title="Account Details">
            <View style={styles.formContent}>
              <TextInput
                label="Account Name"
                placeholder="Enter account name"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.fieldLabel}>Account Type</Text>
              <View style={styles.typeContainer}>
                {accountTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? 'filled' : 'outline'}
                    onClick={() => setSelectedType(type.value)}
                    style={styles.typeButton}
                  >
                    {type.label}
                  </Button>
                ))}
              </View>

              <TextInput
                label="Currency"
                placeholder="e.g., GBP, USD, EUR"
                value={currency}
                onChangeText={setCurrency}
                autoCapitalize="characters"
              />

              <TextInput
                label="Initial Balance"
                placeholder="0.00"
                value={balance}
                onChangeText={setBalance}
                keyboardType="decimal-pad"
              />
            </View>
          </Section>

          <View style={styles.actions}>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </View>
        </ScrollView>
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    height: 40,
    paddingHorizontal: 16,
  },
  actions: {
    gap: 12,
  },
});
