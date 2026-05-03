import { AccountAvatar } from '@/features/accounts/components/AccountAvatar';
import { CategoryAvatar } from '@/components/Categories/CategoryAvatar';
import { CategoryPickerModal } from '@/features/categories/components/CategoryPicker/CategoryPickerModal';
import { useLocale } from '@/i18n/useLocale';
import { CategoryDto, InboxTransactionDto } from '@guallet/api-client';
import {
  useAccount,
  useCategory,
  useTransactionMutations,
} from '@guallet/api-react';
import { Money } from '@guallet/money';
import { ResponsiveModal, useTheme } from '@guallet/ui-react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { InboxTransactionEditModal } from './InboxTransactionEditModal';

interface InboxTransactionCardProps {
  transaction: InboxTransactionDto;
  onSaveChanges?: () => void;
}

export function InboxTransactionCard({
  transaction,
  onSaveChanges,
}: Readonly<InboxTransactionCardProps>) {
  const { colors, spacing } = useTheme();
  const { locale } = useLocale();
  const { t } = useTranslation();

  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [
    categoryPickerOpened,
    { open: openCategoryPicker, close: closeCategoryPicker },
  ] = useDisclosure(false);

  const { account } = useAccount(transaction.accountId);
  const { updateTransactionCategoryMutation } = useTransactionMutations();

  const isAutoSuggested =
    transaction.processedCategoryId != null &&
    transaction.processedCategoryId !== transaction.categoryId;
  const displayCategoryId =
    transaction.processedCategoryId ?? transaction.categoryId;

  const { category } = useCategory(displayCategoryId);

  const amount = Number(transaction.amount);
  const money = Money.fromCurrencyCode({
    amount,
    currencyCode: transaction.currency,
  });
  const isExpense = amount < 0;

  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(transaction.date));

  function handleCategorySelected(selected: CategoryDto) {
    updateTransactionCategoryMutation.mutate(
      { id: transaction.id, categoryId: selected.id },
      {
        onSuccess: () => {
          notifications.show({
            message: t(
              'screens.transactions.inbox.card.categoryUpdated',
              'Category updated',
            ),
            color: 'green',
          });
        },
        onError: () => {
          notifications.show({
            title: t(
              'screens.transactions.inbox.card.categoryUpdateError.title',
              'Error',
            ),
            message: t(
              'screens.transactions.inbox.card.categoryUpdateError.message',
              'Failed to update category. Please try again.',
            ),
            color: 'red',
          });
        },
      },
    );
  }

  return (
    <>
      <Card withBorder shadow="sm" radius="lg" padding="lg">
        <Stack gap={spacing.sm}>
          {/* Row 1: Account identity + date */}
          <Group wrap="nowrap" gap="xs">
            <AccountAvatar accountId={transaction.accountId} size={28} />
            <Text size="sm" c="dimmed" style={{ flex: 1 }} truncate>
              {account?.name ?? '—'}
            </Text>
            <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
              {formattedDate}
            </Text>
          </Group>

          {/* Row 2: Description + coloured amount */}
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Text fw={600} style={{ flex: 1, minWidth: 0 }} lineClamp={2}>
              {transaction.description}
            </Text>
            <Text
              fw={700}
              style={{
                fontVariantNumeric: 'tabular-nums',
                color: isExpense ? colors.error : colors.support,
                flexShrink: 0,
                marginLeft: spacing.md,
              }}
            >
              {money.format()}
            </Text>
          </Group>

          {/* Row 3: Category (tappable → category picker) + actions */}
          <Group justify="space-between" wrap="nowrap">
            <UnstyledButton
              onClick={openCategoryPicker}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minWidth: 0,
              }}
            >
              <CategoryAvatar categoryId={displayCategoryId} size="sm" />
              <Text size="sm" c={displayCategoryId ? undefined : 'dimmed'}>
                {category?.name ??
                  t(
                    'screens.transactions.inbox.card.uncategorised',
                    'Uncategorised',
                  )}
              </Text>
              {isAutoSuggested && (
                <Badge size="xs" variant="light">
                  {t('screens.transactions.inbox.card.autoBadge', 'Suggested')}
                </Badge>
              )}
            </UnstyledButton>

            <Group gap="xs" style={{ flexShrink: 0 }}>
              <Tooltip
                label={t('screens.transactions.inbox.card.editTooltip', 'Edit')}
              >
                <ActionIcon variant="outline" size="lg" onClick={openEdit}>
                  <IconEdit size={18} strokeWidth={1.5} />
                </ActionIcon>
              </Tooltip>
              <Button
                size="sm"
                leftSection={<IconCheck size={14} strokeWidth={2} />}
                onClick={() => onSaveChanges?.()}
              >
                {t('screens.transactions.inbox.card.confirmButton', 'Confirm')}
              </Button>
            </Group>
          </Group>
        </Stack>
      </Card>

      {/* Category picker — direct tap shortcut */}
      <ResponsiveModal
        opened={categoryPickerOpened}
        onClose={closeCategoryPicker}
        title={t('components.categoryPicker.modal.title', 'Select category')}
        size="lg"
      >
        <CategoryPickerModal
          mode="single"
          selectedCategory={category ?? null}
          onSelectionChanged={handleCategorySelected}
          close={closeCategoryPicker}
        />
      </ResponsiveModal>

      {/* Full edit modal — notes + category */}
      <InboxTransactionEditModal
        transaction={transaction}
        opened={editOpened}
        onClose={closeEdit}
      />
    </>
  );
}
