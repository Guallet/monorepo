import { BaseScreen } from '@/components/Screens/BaseScreen';
import { RecurringPaymentType, RecurrenceCadence } from '@guallet/api-client';
import {
  useAccount,
  useSubscription,
  useSubscriptionsMutations,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconArrowLeft,
  IconCalendarRepeat,
  IconEdit,
  IconTrash,
  IconWallet,
} from '@tabler/icons-react';

interface SubscriptionDetailsScreenProps {
  subscriptionId: string;
}

function getPaymentTypeBadgeColor(type: RecurringPaymentType): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return 'blue';
    case RecurringPaymentType.REGULAR_PAYMENT:
      return 'red';
    case RecurringPaymentType.REGULAR_INCOME:
      return 'green';
    default:
      return 'gray';
  }
}

function getPaymentTypeLabel(
  type: RecurringPaymentType,
  t: (key: string, defaultValue: string) => string,
): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return t('screens.subscriptions.details.types.subscription', 'Subscription');
    case RecurringPaymentType.REGULAR_PAYMENT:
      return t(
        'screens.subscriptions.details.types.regularPayment',
        'Regular payment',
      );
    case RecurringPaymentType.REGULAR_INCOME:
      return t(
        'screens.subscriptions.details.types.regularIncome',
        'Regular income',
      );
    default:
      return t('screens.subscriptions.details.types.unknown', 'Unknown');
  }
}

function getCadenceLabel(
  cadence: RecurrenceCadence,
  t: (key: string, defaultValue: string) => string,
): string {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return t('screens.subscriptions.details.cadence.weekly', 'Weekly');
    case RecurrenceCadence.BIWEEKLY:
      return t('screens.subscriptions.details.cadence.biweekly', 'Bi-weekly');
    case RecurrenceCadence.MONTHLY:
      return t('screens.subscriptions.details.cadence.monthly', 'Monthly');
    case RecurrenceCadence.QUARTERLY:
      return t('screens.subscriptions.details.cadence.quarterly', 'Quarterly');
    case RecurrenceCadence.YEARLY:
      return t('screens.subscriptions.details.cadence.yearly', 'Yearly');
    default:
      return t('screens.subscriptions.details.cadence.unknown', 'Unknown');
  }
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function SubscriptionDetailsScreen({
  subscriptionId,
}: Readonly<SubscriptionDetailsScreenProps>) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const navigation = useNavigate();
  const { subscription, isLoading } = useSubscription(subscriptionId);
  const { account } = useAccount(subscription?.accountId);
  const { deleteSubscriptionMutation } = useSubscriptionsMutations();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  function showDeleteModal() {
    setIsDeleteModalOpen(true);
  }

  function hideModal() {
    setIsDeleteModalOpen(false);
  }

  async function handleDelete() {
    try {
      await deleteSubscriptionMutation.mutateAsync({ id: subscriptionId });
      notifications.show({
        title: t(
          'screens.subscriptions.details.notifications.deleteSuccess.title',
          'Subscription deleted',
        ),
        message: t(
          'screens.subscriptions.details.notifications.deleteSuccess.message',
          'The subscription has been deleted.',
        ),
        color: 'green',
      });
      navigation({ to: '/subscriptions' });
    } catch (error) {
      console.error('Error deleting subscription', error);
      notifications.show({
        title: t(
          'screens.subscriptions.details.notifications.deleteError.title',
          'Could not delete subscription',
        ),
        message: t(
          'screens.subscriptions.details.notifications.deleteError.message',
          'A network or server error occurred. Please try again.',
        ),
        color: 'red',
      });
    }
  }

  if (!subscription) {
    if (isLoading) {
      return (
        <BaseScreen
          isLoading
          title={t('screens.subscriptions.details.title', 'Subscription')}
        >
          <Box />
        </BaseScreen>
      );
    }

    throw notFound();
  }

  const typeLabel = getPaymentTypeLabel(subscription.type, t);
  const cadenceLabel = getCadenceLabel(subscription.cadence, t);
  const monthlyAmount = calculateMonthlyAmount(
    subscription.amount,
    subscription.cadence,
  );
  const yearlyAmount = calculateYearlyAmount(
    subscription.amount,
    subscription.cadence,
  );

  return (
    <BaseScreen
      isLoading={isLoading}
      title={
        subscription?.name ??
        t('screens.subscriptions.details.title', 'Subscription')
      }
    >
      <Modal
        centered
        opened={isDeleteModalOpen}
        onClose={hideModal}
        title={
          <Text fw={700} size="lg">
            {t(
              'screens.subscriptions.details.deleteModal.title',
              'Delete subscription',
            )}
          </Text>
        }
        radius="lg"
        size="md"
      >
        <Stack gap={spacing.md}>
          <Text>
            {t(
              'screens.subscriptions.details.deleteModal.message',
              'Are you sure you want to delete this subscription?',
            )}
          </Text>
          <Text size="sm" c="dimmed">
            {t(
              'screens.subscriptions.details.deleteModal.description',
              'This action cannot be undone.',
            )}
          </Text>
          <Group justify="flex-end" gap={spacing.sm}>
            <Button variant="default" onClick={hideModal}>
              {t('screens.subscriptions.details.deleteModal.cancel', 'Cancel')}
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={16} strokeWidth={1.5} />}
              onClick={handleDelete}
              loading={deleteSubscriptionMutation.isPending}
            >
              {t('screens.subscriptions.details.deleteModal.confirm', 'Delete')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Stack gap={spacing.md}>
        <Card withBorder shadow="sm" radius="lg" padding={spacing.lg}>
          <Group justify="space-between" align="flex-start" gap={spacing.md}>
            <Group gap={spacing.md} align="flex-start" wrap="nowrap">
              <Avatar src={subscription.imageUrl} radius="xl" size="xl">
                {subscription.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Group gap={spacing.sm} align="center">
                  <Text size="xl" fw={700}>
                    {subscription.name}
                  </Text>
                  <Badge
                    size="md"
                    color={getPaymentTypeBadgeColor(subscription.type)}
                  >
                    {typeLabel}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed" mt={spacing.xs}>
                  {t(
                    'screens.subscriptions.details.header.description',
                    '{{cadence}} recurring item in {{currency}}',
                    {
                      cadence: cadenceLabel,
                      currency: subscription.currency,
                    },
                  )}
                </Text>
              </Box>
            </Group>

            <Group gap={spacing.sm}>
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} strokeWidth={1.5} />}
                onClick={() => {
                  navigation({ to: '/subscriptions' });
                }}
              >
                {t('screens.subscriptions.details.backButton', 'Back')}
              </Button>
              <Button
                leftSection={<IconEdit size={16} strokeWidth={1.5} />}
                onClick={() => {
                  navigation({
                    to: '/subscriptions/$id/edit',
                    params: { id: subscription.id },
                  });
                }}
              >
                {t('screens.subscriptions.details.editButton', 'Edit')}
              </Button>
            </Group>
          </Group>
        </Card>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={spacing.md}>
          <Card withBorder shadow="sm" radius="lg" padding={spacing.lg}>
            <Group gap={spacing.md} align="flex-start" wrap="nowrap">
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <IconWallet size={24} strokeWidth={1.5} />
              </ThemeIcon>
              <Box>
                <Text c="dimmed" size="sm">
                  {t('screens.subscriptions.details.amount.label', 'Amount')}
                </Text>
                <Text
                  fw={700}
                  size="xl"
                  style={{
                    color:
                      subscription.type === RecurringPaymentType.REGULAR_INCOME
                        ? colors.support
                        : colors.error,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatCurrency(subscription.amount, subscription.currency)}
                </Text>
              </Box>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="lg" padding={spacing.lg}>
            <Group gap={spacing.md} align="flex-start" wrap="nowrap">
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <IconCalendarRepeat size={24} strokeWidth={1.5} />
              </ThemeIcon>
              <Box>
                <Text c="dimmed" size="sm">
                  {t(
                    'screens.subscriptions.details.frequency.label',
                    'Frequency',
                  )}
                </Text>
                <Text fw={700} size="xl">
                  {cadenceLabel}
                </Text>
              </Box>
            </Group>
          </Card>
        </SimpleGrid>

        <Card withBorder shadow="sm" radius="lg" padding={spacing.lg}>
          <Stack gap={spacing.md}>
            <Text fw={600}>
              {t('screens.subscriptions.details.details.title', 'Details')}
            </Text>
            <DetailRow
              label={t(
                'screens.subscriptions.details.details.startDate',
                'Start date',
              )}
              value={
                subscription.startDate
                  ? new Date(subscription.startDate).toLocaleDateString()
                  : t('common.notAvailable', 'Not available')
              }
            />
            <DetailRow
              label={t('screens.subscriptions.details.details.currency', 'Currency')}
              value={subscription.currency}
            />
            <DetailRow
              label={t('screens.subscriptions.details.details.account', 'Account')}
              value={account?.name ?? t('common.notAvailable', 'Not available')}
            />
            <DetailRow
              label={t('screens.subscriptions.details.details.type', 'Type')}
              value={typeLabel}
            />
          </Stack>
        </Card>

        <Card withBorder shadow="sm" radius="lg" padding={spacing.lg}>
          <Stack gap={spacing.md}>
            <Text fw={600}>
              {t(
                'screens.subscriptions.details.costSummary.title',
                'Cost summary',
              )}
            </Text>
            <DetailRow
              label={t(
                'screens.subscriptions.details.costSummary.monthly',
                'Monthly estimate',
              )}
              value={formatCurrency(monthlyAmount, subscription.currency)}
            />
            <DetailRow
              label={t(
                'screens.subscriptions.details.costSummary.yearly',
                'Yearly estimate',
              )}
              value={formatCurrency(yearlyAmount, subscription.currency)}
            />
          </Stack>
        </Card>

        <Card withBorder shadow="sm" radius="lg" padding={spacing.lg}>
          <Group justify="space-between" gap={spacing.md}>
            <Box>
              <Text fw={600}>
                {t(
                  'screens.subscriptions.details.danger.title',
                  'Danger zone',
                )}
              </Text>
              <Text c="dimmed" size="sm" mt={spacing.xs}>
                {t(
                  'screens.subscriptions.details.danger.description',
                  'Remove this recurring item from your account.',
                )}
              </Text>
            </Box>
            <Button
              color="red"
              variant="outline"
              leftSection={<IconTrash size={16} strokeWidth={1.5} />}
              onClick={showDeleteModal}
            >
              {t('screens.subscriptions.details.deleteButton', 'Delete')}
            </Button>
          </Group>
        </Card>
      </Stack>
    </BaseScreen>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: Readonly<DetailRowProps>) {
  const { spacing } = useTheme();

  return (
    <Group justify="space-between" gap={spacing.md} wrap="nowrap">
      <Text c="dimmed">{label}</Text>
      <Text fw={600} ta="right">
        {value}
      </Text>
    </Group>
  );
}

function calculateMonthlyAmount(
  amount: number,
  cadence: RecurrenceCadence,
): number {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return (amount * 52) / 12;
    case RecurrenceCadence.BIWEEKLY:
      return amount * 2;
    case RecurrenceCadence.MONTHLY:
      return amount;
    case RecurrenceCadence.QUARTERLY:
      return amount / 3;
    case RecurrenceCadence.YEARLY:
      return amount / 12;
    default:
      return amount;
  }
}

function calculateYearlyAmount(
  amount: number,
  cadence: RecurrenceCadence,
): number {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return amount * 52;
    case RecurrenceCadence.BIWEEKLY:
      return amount * 26;
    case RecurrenceCadence.MONTHLY:
      return amount * 12;
    case RecurrenceCadence.QUARTERLY:
      return amount * 4;
    case RecurrenceCadence.YEARLY:
      return amount;
    default:
      return amount;
  }
}
