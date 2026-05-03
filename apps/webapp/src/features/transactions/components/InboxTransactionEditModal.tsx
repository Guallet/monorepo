import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
import { useLocale } from '@/i18n/useLocale';
import {
  InboxTransactionDto,
  CategoryDto,
  UpdateTransactionRequest,
} from '@guallet/api-client';
import { useCategory, useTransactionMutations } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { ResponsiveModal, useTheme } from '@guallet/ui-react';
import { Button, Divider, Group, Stack, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface InboxTransactionEditModalProps {
  transaction: InboxTransactionDto;
  opened: boolean;
  onClose: () => void;
}

interface EditFormValues {
  notes: string;
}

export function InboxTransactionEditModal({
  transaction,
  opened,
  onClose,
}: Readonly<InboxTransactionEditModalProps>) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { locale } = useLocale();
  const { updateTransactionMutation } = useTransactionMutations();

  const initialCategoryId =
    transaction.processedCategoryId ?? transaction.categoryId;
  const { category: loadedCategory } = useCategory(initialCategoryId);
  // undefined = no user override yet; fall through to loadedCategory
  const [categoryOverride, setCategoryOverride] = useState<
    CategoryDto | null | undefined
  >(undefined);
  const selectedCategory =
    categoryOverride === undefined
      ? (loadedCategory ?? null)
      : categoryOverride;

  const form = useForm<EditFormValues>({
    initialValues: { notes: transaction.notes ?? '' },
  });

  const { setValues } = form;
  useEffect(() => {
    if (opened) {
      setValues({ notes: transaction.notes ?? '' });
    }
  }, [opened, transaction.id, transaction.notes, setValues]);

  const amount = Number(transaction.amount);
  const money = Money.fromCurrencyCode({
    amount,
    currencyCode: transaction.currency,
  });
  const isExpense = amount < 0;

  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(transaction.date));

  function handleClose() {
    setCategoryOverride(undefined);
    onClose();
  }

  async function handleSave() {
    const request: UpdateTransactionRequest = {
      description: transaction.description,
      notes: form.values.notes || null,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      date: new Date(transaction.date),
      categoryId: selectedCategory?.id ?? null,
    };

    try {
      await updateTransactionMutation.mutateAsync({
        id: transaction.id,
        request,
      });
      notifications.show({
        message: t(
          'screens.transactions.inbox.edit.notifications.success',
          'Transaction updated',
        ),
        color: 'green',
      });
      onClose();
    } catch {
      notifications.show({
        title: t(
          'screens.transactions.inbox.edit.notifications.error.title',
          'Error',
        ),
        message: t(
          'screens.transactions.inbox.edit.notifications.error.message',
          'Failed to update transaction. Please try again.',
        ),
        color: 'red',
      });
    }
  }

  return (
    <ResponsiveModal
      opened={opened}
      onClose={handleClose}
      title={t('screens.transactions.inbox.edit.title', 'Edit transaction')}
      size="md"
    >
      <Stack gap={spacing.md}>
        {/* Read-only context: what the user is editing */}
        <Stack gap={4}>
          <Text fw={600} lineClamp={2}>
            {transaction.description}
          </Text>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {formattedDate}
            </Text>
            <Text
              fw={700}
              style={{
                fontVariantNumeric: 'tabular-nums',
                color: isExpense ? colors.error : colors.support,
              }}
            >
              {money.format()}
            </Text>
          </Group>
        </Stack>

        <Divider />

        {/* Category picker */}
        <CategoryPicker
          mode="single"
          label={t(
            'screens.transactions.inbox.edit.form.category.label',
            'Category',
          )}
          placeholder={t(
            'screens.transactions.inbox.edit.form.category.placeholder',
            'Select a category',
          )}
          selectedCategory={selectedCategory}
          onSelectionChanged={(cat) => setCategoryOverride(cat)}
        />

        {/* Notes */}
        <Textarea
          label={t('screens.transactions.inbox.edit.form.notes.label', 'Notes')}
          placeholder={t(
            'screens.transactions.inbox.edit.form.notes.placeholder',
            'Add a note…',
          )}
          resize="vertical"
          minRows={3}
          {...form.getInputProps('notes')}
        />

        {/* Actions */}
        <Group justify="flex-end" gap="xs">
          <Button variant="outline" onClick={onClose}>
            {t('screens.transactions.inbox.edit.form.cancelButton', 'Cancel')}
          </Button>
          <Button
            onClick={handleSave}
            loading={updateTransactionMutation.isPending}
          >
            {t('screens.transactions.inbox.edit.form.saveButton', 'Save')}
          </Button>
        </Group>
      </Stack>
    </ResponsiveModal>
  );
}
