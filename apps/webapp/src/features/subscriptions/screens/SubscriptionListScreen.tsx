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
import { useTranslation } from 'react-i18next';

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

function getPaymentTypeLabel(
  type: RecurringPaymentType,
  t: (key: string) => string,
): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return t('screens.subscriptions.list.types.subscription');
    case RecurringPaymentType.REGULAR_PAYMENT:
      return t('screens.subscriptions.list.types.regularPayment');
    case RecurringPaymentType.REGULAR_INCOME:
      return t('screens.subscriptions.list.types.regularIncome');
    default:
      return t('screens.subscriptions.list.types.unknown');
  }
}

function getCadenceLabel(
  cadence: RecurrenceCadence,
  t: (key: string) => string,
): string {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return t('screens.subscriptions.list.cadence.weekly') ?? '';
    case RecurrenceCadence.BIWEEKLY:
      return t('screens.subscriptions.list.cadence.biweekly');
    case RecurrenceCadence.MONTHLY:
      return t('screens.subscriptions.list.cadence.monthly');
    case RecurrenceCadence.QUARTERLY:
      return t('screens.subscriptions.list.cadence.quarterly');
    case RecurrenceCadence.YEARLY:
      return t('screens.subscriptions.list.cadence.yearly');
    default:
      return t('screens.subscriptions.list.cadence.unknown');
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
  const { t } = useTranslation();
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
                {getPaymentTypeLabel(subscription.type, t)}
              </Badge>
              <Text size="xs" c="dimmed">
                {getCadenceLabel(subscription.cadence, t)}
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
  const { t } = useTranslation();
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
              {t('screens.subscriptions.list.title')}
            </Text>
            <Text c="dimmed" size="sm">
              {t('screens.subscriptions.list.estimatedMonthly')}{' '}
              {formatCurrency(totalMonthlyAmount, defaultCurrency)}
            </Text>
          </Stack>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              navigation({ to: '/subscriptions/new' });
            }}
          >
            {t('screens.subscriptions.list.addButton.label')}
          </Button>
        </Group>

        {subscriptions.length === 0 && !isLoading && (
          <Card withBorder shadow="sm" radius="md" padding="xl">
            <Stack align="center" gap="md">
              <Text size="lg" c="dimmed">
                {t('screens.subscriptions.list.emptyState.title')}
              </Text>
              <Text size="sm" c="dimmed">
                {t('screens.subscriptions.list.emptyState.description')}
              </Text>
              <Button
                onClick={() => {
                  navigation({ to: '/subscriptions/new' });
                }}
              >
                {t('screens.subscriptions.list.emptyState.button.label')}
              </Button>
            </Stack>
          </Card>
        )}

        {groupedSubscriptions.subscriptions.length > 0 && (
          <Stack gap="xs">
            <Text fw={600} size="md">
              {t('screens.subscriptions.list.sections.subscriptions')} (
              {groupedSubscriptions.subscriptions.length})
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
              {t('screens.subscriptions.list.sections.regularPayments')} (
              {groupedSubscriptions.regularPayments.length})
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
              {t('screens.subscriptions.list.sections.regularIncome')} (
              {groupedSubscriptions.regularIncome.length})
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
