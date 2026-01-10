import { BaseScreen } from '@/components/Screens/BaseScreen';
import {
  SubscriptionDto,
  RecurringPaymentType,
  RecurrenceCadence,
} from '@guallet/api-client';
import { useSubscriptions } from '@guallet/api-react';
import {
  Stack,
  Button,
  Text,
  Card,
  Group,
  Badge,
  Avatar,
  ActionIcon,
} from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { IconPlus, IconChevronRight } from '@tabler/icons-react';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';

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

interface SubscriptionRowProps {
  subscription: SubscriptionDto;
  onClick: () => void;
}

function SubscriptionRow({
  subscription,
  onClick,
}: Readonly<SubscriptionRowProps>) {
  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      padding="md"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <Group justify="space-between">
        <Group>
          <Avatar src={subscription.imageUrl} radius="xl" size="md">
            {subscription.name.charAt(0).toUpperCase()}
          </Avatar>
          <Stack gap={2}>
            <Text fw={500}>{subscription.name}</Text>
            <Group gap="xs">
              <Badge
                size="sm"
                color={getPaymentTypeBadgeColor(subscription.type)}
              >
                {getPaymentTypeLabel(subscription.type)}
              </Badge>
              <Text size="xs" c="dimmed">
                {getCadenceLabel(subscription.cadence)}
              </Text>
            </Group>
          </Stack>
        </Group>
        <Group>
          <Text fw={600} size="lg">
            {formatCurrency(subscription.amount, subscription.currency)}
          </Text>
          <ActionIcon variant="subtle" color="gray">
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}

export function SubscriptionListScreen() {
  const navigation = useNavigate();
  const { subscriptions, isLoading } = useSubscriptions();
  const defaultCurrency = useDefaultCurrency();

  const groupedSubscriptions = useMemo(() => {
    if (isLoading || !subscriptions) {
      return { subscriptions: [], regularPayments: [], regularIncome: [] };
    }

    return {
      subscriptions: subscriptions.filter(
        (s) => s.type === RecurringPaymentType.SUBSCRIPTION,
      ),
      regularPayments: subscriptions.filter(
        (s) => s.type === RecurringPaymentType.REGULAR_PAYMENT,
      ),
      regularIncome: subscriptions.filter(
        (s) => s.type === RecurringPaymentType.REGULAR_INCOME,
      ),
    };
  }, [subscriptions, isLoading]);

  const totalMonthlyAmount = useMemo(() => {
    if (!subscriptions) return 0;

    return subscriptions.reduce((total, sub) => {
      let monthlyAmount = sub.amount;
      switch (sub.cadence) {
        case RecurrenceCadence.WEEKLY:
          monthlyAmount = (sub.amount * 52) / 12;
          break;
        case RecurrenceCadence.BIWEEKLY:
          monthlyAmount = (sub.amount * 26) / 12;
          break;
        case RecurrenceCadence.QUARTERLY:
          monthlyAmount = sub.amount / 3;
          break;
        case RecurrenceCadence.YEARLY:
          monthlyAmount = sub.amount / 12;
          break;
      }
      return total + monthlyAmount;
    }, 0);
  }, [subscriptions]);

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack>
        <Group justify="space-between">
          <Stack gap={0}>
            <Text size="xl" fw={700}>
              Subscriptions & Regular Payments
            </Text>
            <Text c="dimmed" size="sm">
              Estimated monthly:{' '}
              {formatCurrency(totalMonthlyAmount, defaultCurrency)}
            </Text>
          </Stack>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              navigation({ to: '/subscriptions/new' });
            }}
          >
            Add New
          </Button>
        </Group>

        {subscriptions.length === 0 && !isLoading && (
          <Card withBorder shadow="sm" radius="md" padding="xl">
            <Stack align="center" gap="md">
              <Text size="lg" c="dimmed">
                No subscriptions yet
              </Text>
              <Text size="sm" c="dimmed">
                Start tracking your recurring payments and subscriptions
              </Text>
              <Button
                onClick={() => {
                  navigation({ to: '/subscriptions/new' });
                }}
              >
                Add your first subscription
              </Button>
            </Stack>
          </Card>
        )}

        {groupedSubscriptions.subscriptions.length > 0 && (
          <Stack gap="xs">
            <Text fw={600} size="md">
              Subscriptions ({groupedSubscriptions.subscriptions.length})
            </Text>
            {groupedSubscriptions.subscriptions.map((subscription) => (
              <SubscriptionRow
                key={subscription.id}
                subscription={subscription}
                onClick={() => {
                  navigation({
                    to: '/subscriptions/$id',
                    params: { id: subscription.id },
                  });
                }}
              />
            ))}
          </Stack>
        )}

        {groupedSubscriptions.regularPayments.length > 0 && (
          <Stack gap="xs">
            <Text fw={600} size="md">
              Regular Payments ({groupedSubscriptions.regularPayments.length})
            </Text>
            {groupedSubscriptions.regularPayments.map((subscription) => (
              <SubscriptionRow
                key={subscription.id}
                subscription={subscription}
                onClick={() => {
                  navigation({
                    to: '/subscriptions/$id',
                    params: { id: subscription.id },
                  });
                }}
              />
            ))}
          </Stack>
        )}

        {groupedSubscriptions.regularIncome.length > 0 && (
          <Stack gap="xs">
            <Text fw={600} size="md">
              Regular Income ({groupedSubscriptions.regularIncome.length})
            </Text>
            {groupedSubscriptions.regularIncome.map((subscription) => (
              <SubscriptionRow
                key={subscription.id}
                subscription={subscription}
                onClick={() => {
                  navigation({
                    to: '/subscriptions/$id',
                    params: { id: subscription.id },
                  });
                }}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </BaseScreen>
  );
}
