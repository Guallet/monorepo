import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useBudgetMutations, useCategories } from '@guallet/api-react';
import { CreateBudgetRequest } from '@guallet/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  ListRow,
  Section,
  TextInput,
  useTheme,
} from '@luna-ui/react-native';
import { useRouter } from 'expo-router';

export function CreateBudgetScreen() {
  const router = useRouter();
  const { createBudgetMutation } = useBudgetMutations();
  const { categories } = useCategories();
  const { spacing } = useTheme();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  }

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Budget name is required.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid budget amount.');
      return;
    }
    if (selectedCategoryIds.length === 0) {
      Alert.alert(
        'Validation Error',
        'Please select at least one category for the budget.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const request: CreateBudgetRequest = {
        name: name.trim(),
        amount: parsedAmount,
        currency,
        categories: selectedCategoryIds,
      };

      await createBudgetMutation.mutateAsync({ request });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create budget. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen headerTitle="Create Budget">
        <ScrollView
          contentContainerStyle={{ padding: spacing.md, gap: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Section title="Budget Details">
            <View style={styles.formContent}>
              <TextInput
                label="Budget Name"
                placeholder="Enter budget name"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                label="Amount"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />

              <TextInput
                label="Currency"
                placeholder="e.g., GBP, USD, EUR"
                value={currency}
                onChangeText={setCurrency}
                autoCapitalize="characters"
              />
            </View>
          </Section>

          <Section title="Categories">
            {categories.length === 0 ? (
              <View style={styles.emptyHint}>
                <Text style={styles.emptyHintText}>
                  No categories available. Create categories first.
                </Text>
              </View>
            ) : (
              categories.map((category) => (
                <ListRow
                  key={category.id}
                  title={category.name}
                  onPress={() => toggleCategory(category.id)}
                  right={
                    selectedCategoryIds.includes(category.id) ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : null
                  }
                />
              ))
            )}
          </Section>

          <View style={styles.actions}>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Budget'}
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
