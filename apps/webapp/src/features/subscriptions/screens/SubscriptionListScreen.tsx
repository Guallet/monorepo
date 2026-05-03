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
  Box,
  SimpleGrid,
  ThemeIcon,
} from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import {
  IconCalendarRepeat,
  IconChevronRight,
  IconPlus,
  IconWallet,
} from '@tabler/icons-react';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useTheme } from '@guallet/ui-react';

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
      return t('screens.subscriptions.list.types.subscription', 'Subscription');
    case RecurringPaymentType.REGULAR_PAYMENT:
      return t(
        'screens.subscriptions.list.types.regularPayment',
        'Regular payment',
      );
    case RecurringPaymentType.REGULAR_INCOME:
      return t('screens.subscriptions.list.types.regularIncome', 'Regular income');
    default:
      return t('screens.subscriptions.list.types.unknown', 'Unknown');
  }
}

function getCadenceLabel(
  cadence: RecurrenceCadence,
  t: (key: string, defaultValue: string) => string,
): string {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return t('screens.subscriptions.list.cadence.weekly', 'Weekly');
    case RecurrenceCadence.BIWEEKLY:
      return t('screens.subscriptions.list.cadence.biweekly', 'Bi-weekly');
    case RecurrenceCadence.MONTHLY:
      return t('screens.subscriptions.list.cadence.monthly', 'Monthly');
    case RecurrenceCadence.QUARTERLY:
      return t('screens.subscriptions.list.cadence.quarterly', 'Quarterly');
    case RecurrenceCadence.YEARLY:
      return t('screens.subscriptions.list.cadence.yearly', 'Yearly');
    default:
      return t('screens.subscriptions.list.cadence.unknown', 'Unknown');
  }
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

function calculateNextPaymentDate(
  startDate: string | undefined,
  cadence: RecurrenceCadence,
): Date | null {
  if (!startDate) return null;

  const start = dayjs(startDate);
  const today = dayjs().startOf('day');

  if (start.isAfter(today)) {
    return start.toDate();
  }

  let next = start;
  while (next.isBefore(today) || next.isSame(today, 'day')) {
    switch (cadence) {
      case RecurrenceCadence.WEEKLY:
        next = next.add(1, 'week');
        break;
      case RecurrenceCadence.BIWEEKLY:
        next = next.add(2, 'weeks');
        break;
      case RecurrenceCadence.MONTHLY:
        next = next.add(1, 'month');
        break;
      case RecurrenceCadence.QUARTERLY:
        next = next.add(3, 'months');
        break;
      case RecurrenceCadence.YEARLY:
        next = next.add(1, 'year');
        break;
    }
  }

  return next.toDate();
}

function formatNextPaymentDate(
  nextDate: Date | null,
  t: (
    key: string,
    defaultValue: string,
    options?: { count?: number },
  ) => string,
): {
  formatted: string;
  message: string | null;
} {
  if (!nextDate) {
    return { formatted: '', message: null };
  }

  const today = dayjs().startOf('day');
  const next = dayjs(nextDate).startOf('day');
  const daysUntil = next.diff(today, 'days');

  let message: string | null = null;

  if (daysUntil === 0) {
    message = t('screens.subscriptions.list.nextPayment.today', 'Today');
  } else if (daysUntil === 1) {
    message = t('screens.subscriptions.list.nextPayment.tomorrow', 'Tomorrow');
  } else if (daysUntil > 1 && daysUntil <= 7) {
    message = t('screens.subscriptions.list.nextPayment.inDays', 'In {{count}} days', {
      count: daysUntil,
    });
  }

  const formatted = next.format('DD-MM-YYYY');

  return { formatted, message };
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
  const { colors, spacing } = useTheme();
  const isIncome = subscription.type === RecurringPaymentType.REGULAR_INCOME;

  const nextPaymentDate = useMemo(
    () =>
      subscription.startDate
        ? calculateNextPaymentDate(subscription.startDate, subscription.cadence)
        : null,
    [subscription.startDate, subscription.cadence],
  );

  const { formatted, message } = useMemo(
    () => formatNextPaymentDate(nextPaymentDate, t),
    [nextPaymentDate, t],
  );

  return (
    <Card
      withBorder
      shadow="sm"
      radius="lg"
      padding={spacing.md}
      onClick={onClick}
      style={{
        cursor: 'pointer',
      }}
    >
      <Group justify="space-between" gap={spacing.md} wrap="nowrap">
        <Group gap={spacing.md} wrap="nowrap">
          <Avatar src={subscription.imageUrl} radius="xl" size="md">
            {subscription.name.charAt(0).toUpperCase()}
          </Avatar>
          <Stack gap={spacing.xs}>
            <Text fw={500}>{subscription.name}</Text>
            <Group gap={spacing.xs}>
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
            {nextPaymentDate && (
              <Group gap={spacing.xs}>
                <Text size="xs">
                  {t(
                    'screens.subscriptions.list.nextPayment.label',
                    'Next payment',
                  )}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatted}
                </Text>
                {message && (
                  <Badge size="sm" variant="light" color="blue">
                    {message}
                  </Badge>
                )}
              </Group>
            )}
          </Stack>
        </Group>
        <Group gap={spacing.sm} wrap="nowrap">
          <Text
            fw={700}
            size="lg"
            style={{
              color: isIncome ? colors.support : colors.error,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatCurrency(subscription.amount, subscription.currency)}
          </Text>
          <ActionIcon variant="subtle" color="gray">
            <IconChevronRight size={16} strokeWidth={1.5} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}

export function SubscriptionListScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
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
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.subscriptions.list.title', 'Subscriptions')}
      actions={
        <Button
          leftSection={<IconPlus size={16} strokeWidth={1.5} />}
          onClick={() => {
            navigation({ to: '/subscriptions/new' });
          }}
        >
          {t('screens.subscriptions.list.addButton.label', 'Add subscription')}
        </Button>
      }
    >
      <Stack gap={spacing.md}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={spacing.md}>
          <Card withBorder shadow="sm" radius="lg" padding={spacing.lg}>
            <Group gap={spacing.md} align="flex-start" wrap="nowrap">
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <IconWallet size={24} strokeWidth={1.5} />
              </ThemeIcon>
              <Box>
                <Text c="dimmed" size="sm">
                  {t(
                    'screens.subscriptions.list.summary.monthly.label',
                    'Estimated monthly',
                  )}
                </Text>
                <Text fw={700} size="xl">
                  {formatCurrency(totalMonthlyAmount, defaultCurrency)}
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
                    'screens.subscriptions.list.summary.total.label',
                    'Tracked items',
                  )}
                </Text>
                <Text fw={700} size="xl">
                  {subscriptions.length}
                </Text>
              </Box>
            </Group>
          </Card>
        </SimpleGrid>

        {subscriptions.length === 0 && !isLoading && (
          <Card withBorder shadow="sm" radius="lg" padding={spacing.xl}>
            <Stack align="center" gap={spacing.md}>
              <Text size="lg" c="dimmed">
                {t(
                  'screens.subscriptions.list.emptyState.title',
                  'No subscriptions yet',
                )}
              </Text>
              <Text size="sm" c="dimmed">
                {t(
                  'screens.subscriptions.list.emptyState.description',
                  'Add recurring payments and income to keep your forecasts up to date.',
                )}
              </Text>
              <Button
                leftSection={<IconPlus size={16} strokeWidth={1.5} />}
                onClick={() => {
                  navigation({ to: '/subscriptions/new' });
                }}
              >
                {t(
                  'screens.subscriptions.list.emptyState.button.label',
                  'Add subscription',
                )}
              </Button>
            </Stack>
          </Card>
        )}

        {groupedSubscriptions.subscriptions.length > 0 && (
          <Stack gap={spacing.xs}>
            <Text fw={600} size="md">
              {t(
                'screens.subscriptions.list.sections.subscriptions',
                'Subscriptions',
              )}{' '}
              ({groupedSubscriptions.subscriptions.length})
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
          <Stack gap={spacing.xs}>
            <Text fw={600} size="md">
              {t(
                'screens.subscriptions.list.sections.regularPayments',
                'Regular payments',
              )}{' '}
              ({groupedSubscriptions.regularPayments.length})
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
          <Stack gap={spacing.xs}>
            <Text fw={600} size="md">
              {t(
                'screens.subscriptions.list.sections.regularIncome',
                'Regular income',
              )}{' '}
              ({groupedSubscriptions.regularIncome.length})
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
