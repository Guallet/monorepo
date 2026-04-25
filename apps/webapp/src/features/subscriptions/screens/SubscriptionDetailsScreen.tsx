import { AppSection } from '@/components/Cards/AppSection';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { RecurringPaymentType, RecurrenceCadence } from '@guallet/api-client';
import { useSubscription, useSubscriptionsMutations } from '@guallet/api-react';
import {
  Stack,
  Group,
  Button,
  Text,
  Avatar,
  Badge,
  Loader,
  Modal,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SubscriptionDetailsScreenProps {
  subscriptionId: string;
}

function getPaymentTypeBadgeColor(type: RecurringPaymentType): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return 'blue';
    case RecurringPaymentType.REGULAR_PAYMENT:
      return 'orange';
    case RecurringPaymentType.REGULAR_INCOME:
      return 'green';
    default:
      return 'gray';
  }
}

function getPaymentTypeLabel(type: RecurringPaymentType): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return 'Subscription';
    case RecurringPaymentType.REGULAR_PAYMENT:
      return 'Regular Payment';
    case RecurringPaymentType.REGULAR_INCOME:
      return 'Regular Income';
    default:
      return 'Unknown';
  }
}

function getCadenceLabel(cadence: RecurrenceCadence): string {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return 'Weekly';
    case RecurrenceCadence.BIWEEKLY:
      return 'Bi-weekly';
    case RecurrenceCadence.MONTHLY:
      return 'Monthly';
    case RecurrenceCadence.QUARTERLY:
      return 'Quarterly';
    case RecurrenceCadence.YEARLY:
      return 'Yearly';
    default:
      return 'Unknown';
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
  const navigation = useNavigate();
  const { subscription, isLoading } = useSubscription(subscriptionId);
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
        title: 'Subscription deleted',
        message: 'The subscription has been deleted',
        color: 'green',
      });
      navigation({ to: '/subscriptions' });
    } catch (error) {
      console.error('Error deleting subscription', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete subscription',
        color: 'red',
      });
    }
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!subscription) {
    throw notFound();
  }

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
        title="Delete subscription"
        size="auto"
      >
        <Stack>
          <Text>Are you sure you want to delete this subscription?</Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={hideModal}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={deleteSubscriptionMutation.isPending}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Stack>
        {/* Header */}
        <Group>
          <Avatar src={subscription.imageUrl} radius="xl" size="xl">
            {subscription.name.charAt(0).toUpperCase()}
          </Avatar>
          <Stack gap={4}>
            <Text size="xl" fw={700}>
              {subscription.name}
            </Text>
            <Badge
              size="md"
              color={getPaymentTypeBadgeColor(subscription.type)}
            >
              {getPaymentTypeLabel(subscription.type)}
            </Badge>
          </Stack>
        </Group>

        {/* Details Section */}
        <AppSection title="Details">
          <Stack gap="md">
            <Group justify="space-between">
              <Text c="dimmed">Amount</Text>
              <Text fw={600} size="lg">
                {formatCurrency(subscription.amount, subscription.currency)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text c="dimmed">Frequency</Text>
              <Text fw={500}>{getCadenceLabel(subscription.cadence)}</Text>
            </Group>
            <Group justify="space-between">
              <Text c="dimmed">Start Date</Text>
              <Text fw={500}>
                {new Date(subscription.startDate).toLocaleDateString()}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text c="dimmed">Currency</Text>
              <Text fw={500}>{subscription.currency}</Text>
            </Group>
            <Group justify="space-between">
              <Text c="dimmed">Type</Text>
              <Text fw={500}>{getPaymentTypeLabel(subscription.type)}</Text>
            </Group>
          </Stack>
        </AppSection>

        {/* Cost Summary */}
        <AppSection title="Cost Summary">
          <Stack gap="md">
            <Group justify="space-between">
              <Text c="dimmed">Monthly estimate</Text>
              <Text fw={500}>
                {formatCurrency(
                  calculateMonthlyAmount(
                    subscription.amount,
                    subscription.cadence,
                  ),
                  subscription.currency,
                )}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text c="dimmed">Yearly estimate</Text>
              <Text fw={500}>
                {formatCurrency(
                  calculateYearlyAmount(
                    subscription.amount,
                    subscription.cadence,
                  ),
                  subscription.currency,
                )}
              </Text>
            </Group>
          </Stack>
        </AppSection>

        {/* Actions */}
        <Stack>
          <Button
            fullWidth
            onClick={() => {
              navigation({
                to: '/subscriptions/$id/edit',
                params: { id: subscription.id },
              });
            }}
          >
            Edit
          </Button>
          <Button
            fullWidth
            color="red"
            variant="outline"
            onClick={showDeleteModal}
          >
            Delete
          </Button>
          <Button
            fullWidth
            variant="subtle"
            onClick={() => {
              navigation({ to: '/subscriptions' });
            }}
          >
            Back to list
          </Button>
        </Stack>
      </Stack>
    </BaseScreen>
  );
}

function calculateMonthlyAmount(
  amount: number,
  cadence: RecurrenceCadence,
): number {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return amount * 4;
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
