import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import {
  useAccounts,
  useCategories,
  useTransactionMutations,
} from '@guallet/api-react';
import { CreateTransactionRequest } from '@guallet/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  ListRow,
  Section,
  TextInput,
  useTheme,
} from '@luna-ui/react-native';
import { useRouter } from 'expo-router';

type TransactionType = 'expense' | 'income';

export function AddTransactionScreen() {
  const router = useRouter();
  const { createTransactionMutation } = useTransactionMutations();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { spacing } = useTheme();

  const [transactionType, setTransactionType] =
    useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  async function handleSubmit() {
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Description is required.');
      return;
    }
    if (!selectedAccountId) {
      Alert.alert('Validation Error', 'Please select an account.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const request: CreateTransactionRequest = {
        accountId: selectedAccountId,
        description: description.trim(),
        notes: notes.trim() || null,
        amount: transactionType === 'income' ? parsedAmount : -parsedAmount,
        date: new Date(),
        categoryId: selectedCategoryId,
      };

      await createTransactionMutation.mutateAsync(request);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen headerTitle="Add Transaction">
        <ScrollView
          contentContainerStyle={{ padding: spacing.md, gap: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Section title="Type">
            <View style={styles.typeRow}>
              <Button
                variant={transactionType === 'expense' ? 'filled' : 'outline'}
                onClick={() => setTransactionType('expense')}
                style={styles.typeButton}
              >
                Expense
              </Button>
              <Button
                variant={transactionType === 'income' ? 'filled' : 'outline'}
                onClick={() => setTransactionType('income')}
                style={styles.typeButton}
              >
                Income
              </Button>
            </View>
          </Section>

          <Section title="Details">
            <View style={styles.formContent}>
              <TextInput
                label="Description"
                placeholder="Enter description"
                value={description}
                onChangeText={setDescription}
              />

              <TextInput
                label="Amount"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />

              <TextInput
                label="Notes (optional)"
                placeholder="Add notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>
          </Section>

          <Section title="Account">
            {accounts.length === 0 ? (
              <View style={styles.emptyHint}>
                <Text style={styles.emptyHintText}>
                  No accounts available. Create an account first.
                </Text>
              </View>
            ) : (
              accounts.map((account) => (
                <ListRow
                  key={account.id}
                  title={account.name}
                  value={account.currency}
                  onPress={() => setSelectedAccountId(account.id)}
                  right={
                    selectedAccountId === account.id ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : null
                  }
                />
              ))
            )}
          </Section>

          <Section title="Category (optional)">
            <ListRow
              title="No category"
              onPress={() => setSelectedCategoryId(null)}
              right={
                selectedCategoryId === null ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : null
              }
            />
            {categories.map((category) => (
              <ListRow
                key={category.id}
                title={category.name}
                onPress={() => setSelectedCategoryId(category.id)}
                right={
                  selectedCategoryId === category.id ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : null
                }
              />
            ))}
          </Section>

          <View style={styles.actions}>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Add Transaction'}
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
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  typeButton: {
    flex: 1,
    height: 44,
  },
  formContent: {
    padding: 16,
    gap: 4,
  },
  emptyHint: {
    padding: 16,
  },
  emptyHintText: {
    color: '#6B7280',
    fontSize: 14,
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
});
