import { EmptyState } from '@/components/EmptyState/EmptyState';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import {
  SubscriptionDto,
  RecurringPaymentType,
  RecurrenceCadence,
} from '@guallet/api-client';
import { useSubscriptions } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import {
  Stack,
  Button,
  Text,
  Card,
  Group,
  Badge,
  Avatar,
  NumberFormatter,
  Divider,
  Box,
  ThemeIcon,
} from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import {
  IconPlus,
  IconChevronRight,
  IconRepeat,
  IconArrowDownCircle,
  IconArrowUpCircle,
  IconCalendarDue,
} from '@tabler/icons-react';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

function getPaymentTypeColor(type: RecurringPaymentType, colors: ReturnType<typeof useTheme>['colors']): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return colors.primary;
    case RecurringPaymentType.REGULAR_PAYMENT:
      return colors.warning;
    case RecurringPaymentType.REGULAR_INCOME:
      return colors.support;
    default:
      return colors.midGrey;
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
  t: (key: string, options?: { count?: number }) => string,
): string {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return t('screens.subscriptions.list.cadence.weekly');
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

function getDaysUntilLabel(
  nextDate: Date | null,
  t: (key: string, options?: { count?: number }) => string,
): string | null {
  if (!nextDate) return null;

  const today = dayjs().startOf('day');
  const next = dayjs(nextDate).startOf('day');
  const daysUntil = next.diff(today, 'days');

  if (daysUntil === 0) return t('screens.subscriptions.list.nextPayment.today');
  if (daysUntil === 1) return t('screens.subscriptions.list.nextPayment.tomorrow');
  if (daysUntil > 1 && daysUntil <= 7) {
    return t('screens.subscriptions.list.nextPayment.inDays', { count: daysUntil });
  }

  return null;
}

function toMonthlyAmount(amount: number, cadence: RecurrenceCadence): number {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return (amount * 52) / 12;
    case RecurrenceCadence.BIWEEKLY:
      return (amount * 26) / 12;
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

interface SubscriptionRowProps {
  subscription: SubscriptionDto;
  onClick: () => void;
}

function SubscriptionRow({ subscription, onClick }: Readonly<SubscriptionRowProps>) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();

  const isIncome = subscription.type === RecurringPaymentType.REGULAR_INCOME;
  const amountColor = isIncome ? colors.support : colors.error;
  const amountPrefix = isIncome ? '+' : '−';

  const nextPaymentDate = useMemo(
    () =>
      subscription.startDate
        ? calculateNextPaymentDate(subscription.startDate, subscription.cadence)
        : null,
    [subscription.startDate, subscription.cadence],
  );

  const urgencyLabel = useMemo(
    () => getDaysUntilLabel(nextPaymentDate, t),
    [nextPaymentDate, t],
  );

  const typeColor = getPaymentTypeColor(subscription.type, colors);

  return (
    <Card
      withBorder
      shadow="sm"
      radius="lg"
      padding="md"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transition: 'transform 150ms cubic-bezier(0.2,0,0,1), box-shadow 150ms cubic-bezier(0.2,0,0,1)',
      }}
      styles={{
        root: {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 24px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04)',
          },
        },
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Avatar
            src={subscription.imageUrl}
            radius="xl"
            size={44}
            style={{ border: `2px solid ${typeColor}22`, flexShrink: 0 }}
          >
            <Text fw={700} size="sm" style={{ color: typeColor }}>
              {subscription.name.charAt(0).toUpperCase()}
            </Text>
          </Avatar>

          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text fw={600} size="sm" truncate>
              {subscription.name}
            </Text>
            <Group gap={spacing.xs} wrap="nowrap">
              <Badge
                size="xs"
                radius="sm"
                variant="light"
                style={{ backgroundColor: `${typeColor}18`, color: typeColor, flexShrink: 0 }}
              >
                {getPaymentTypeLabel(subscription.type, t)}
              </Badge>
              <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                {getCadenceLabel(subscription.cadence, t)}
              </Text>
            </Group>
            {nextPaymentDate && (
              <Group gap={4} wrap="nowrap">
                <IconCalendarDue size={12} style={{ color: colors.midGrey, flexShrink: 0 }} strokeWidth={1.5} />
                <Text size="xs" c="dimmed">
                  {dayjs(nextPaymentDate).format('DD MMM YYYY')}
                </Text>
                {urgencyLabel && (
                  <Badge size="xs" variant="light" color="blue" style={{ flexShrink: 0 }}>
                    {urgencyLabel}
                  </Badge>
                )}
              </Group>
            )}
          </Stack>
        </Group>

        <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
          <Text
            fw={700}
            size="sm"
            style={{
              color: amountColor,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}
          >
            {amountPrefix}
            <NumberFormatter
              value={subscription.amount}
              thousandSeparator
              decimalScale={2}
            />
            {' '}
            {subscription.currency}
          </Text>
          <IconChevronRight size={16} strokeWidth={1.5} style={{ color: colors.midGrey }} />
        </Group>
      </Group>
    </Card>
  );
}

interface SectionHeaderProps {
  label: string;
  count: number;
  icon: React.ReactNode;
}

function SectionHeader({ label, count, icon }: Readonly<SectionHeaderProps>) {
  const { colors, spacing } = useTheme();
  return (
    <Group gap={spacing.xs} mb={spacing.xs}>
      <Box style={{ color: colors.midGrey }}>{icon}</Box>
      <Text
        size="xs"
        fw={600}
        tt="uppercase"
        style={{ letterSpacing: '0.04em', color: colors.midGrey }}
      >
        {label}
      </Text>
      <Text size="xs" c="dimmed">
        ({count})
      </Text>
    </Group>
  );
}

export function SubscriptionListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigate();
  const { subscriptions, isLoading } = useSubscriptions();
  const defaultCurrency = useDefaultCurrency();
  const { colors, spacing } = useTheme();

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

  const monthlySummary = useMemo(() => {
    if (!subscriptions) return { outgoing: 0, income: 0, net: 0 };
    let outgoing = 0;
    let income = 0;
    for (const sub of subscriptions) {
      const monthly = toMonthlyAmount(sub.amount, sub.cadence);
      if (sub.type === RecurringPaymentType.REGULAR_INCOME) {
        income += monthly;
      } else {
        outgoing += monthly;
      }
    }
    return { outgoing, income, net: income - outgoing };
  }, [subscriptions]);

  const hasAny = subscriptions.length > 0;

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.subscriptions.list.title', 'Subscriptions')}
      actions={
        <Button
          leftSection={<IconPlus size={16} strokeWidth={1.5} />}
          onClick={() => navigation({ to: '/subscriptions/new' })}
        >
          {t('screens.subscriptions.list.addButton.label', 'Add new')}
        </Button>
      }
    >
      <Stack gap={spacing.lg}>
        {/* Monthly summary card */}
        {hasAny && (
          <Card withBorder shadow="sm" radius="lg" padding="lg">
            <Text
              size="xs"
              fw={600}
              tt="uppercase"
              style={{ letterSpacing: '0.04em', color: colors.midGrey }}
              mb={spacing.md}
            >
              {t('screens.subscriptions.list.monthlySummary.title', 'Monthly summary')}
            </Text>
            <Group grow>
              <Stack gap={2} align="center">
                <Text size="xs" c="dimmed">
                  {t('screens.subscriptions.list.monthlySummary.outgoing', 'Outgoing')}
                </Text>
                <Text
                  fw={700}
                  size="lg"
                  style={{ color: colors.error, fontVariantNumeric: 'tabular-nums' }}
                >
                  {Money.fromCurrencyCode({
                    currencyCode: defaultCurrency,
                    amount: monthlySummary.outgoing,
                  }).format()}
                </Text>
              </Stack>
              <Divider orientation="vertical" />
              <Stack gap={2} align="center">
                <Text size="xs" c="dimmed">
                  {t('screens.subscriptions.list.monthlySummary.income', 'Income')}
                </Text>
                <Text
                  fw={700}
                  size="lg"
                  style={{ color: colors.support, fontVariantNumeric: 'tabular-nums' }}
                >
                  {Money.fromCurrencyCode({
                    currencyCode: defaultCurrency,
                    amount: monthlySummary.income,
                  }).format()}
                </Text>
              </Stack>
              <Divider orientation="vertical" />
              <Stack gap={2} align="center">
                <Text size="xs" c="dimmed">
                  {t('screens.subscriptions.list.monthlySummary.net', 'Net')}
                </Text>
                <Text
                  fw={700}
                  size="lg"
                  style={{
                    color: monthlySummary.net >= 0 ? colors.support : colors.error,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Money.fromCurrencyCode({
                    currencyCode: defaultCurrency,
                    amount: Math.abs(monthlySummary.net),
                  }).format()}
                </Text>
              </Stack>
            </Group>
          </Card>
        )}

        {/* Empty state */}
        {!hasAny && !isLoading && (
          <EmptyState
            illustration={
              <ThemeIcon size={64} radius="xl" variant="light" color="blue">
                <IconRepeat size={32} strokeWidth={1.5} />
              </ThemeIcon>
            }
            title={t('screens.subscriptions.list.emptyState.title', 'No subscriptions yet')}
            description={t(
              'screens.subscriptions.list.emptyState.description',
              'Track your recurring payments, subscriptions, and regular income all in one place.',
            )}
            primaryAction={{
              label: t('screens.subscriptions.list.emptyState.button.label', 'Add subscription'),
              icon: <IconPlus size={16} strokeWidth={1.5} />,
              onClick: () => navigation({ to: '/subscriptions/new' }),
            }}
          />
        )}

        {/* Subscriptions section */}
        {groupedSubscriptions.subscriptions.length > 0 && (
          <Stack gap="xs">
            <SectionHeader
              label={t('screens.subscriptions.list.sections.subscriptions', 'Subscriptions')}
              count={groupedSubscriptions.subscriptions.length}
              icon={<IconRepeat size={14} strokeWidth={1.5} />}
            />
            {groupedSubscriptions.subscriptions.map((subscription) => (
              <SubscriptionRow
                key={subscription.id}
                subscription={subscription}
                onClick={() =>
                  navigation({ to: '/subscriptions/$id', params: { id: subscription.id } })
                }
              />
            ))}
          </Stack>
        )}

        {/* Regular payments section */}
        {groupedSubscriptions.regularPayments.length > 0 && (
          <Stack gap="xs">
            <SectionHeader
              label={t('screens.subscriptions.list.sections.regularPayments', 'Regular payments')}
              count={groupedSubscriptions.regularPayments.length}
              icon={<IconArrowDownCircle size={14} strokeWidth={1.5} />}
            />
            {groupedSubscriptions.regularPayments.map((subscription) => (
              <SubscriptionRow
                key={subscription.id}
                subscription={subscription}
                onClick={() =>
                  navigation({ to: '/subscriptions/$id', params: { id: subscription.id } })
                }
              />
            ))}
          </Stack>
        )}

        {/* Regular income section */}
        {groupedSubscriptions.regularIncome.length > 0 && (
          <Stack gap="xs">
            <SectionHeader
              label={t('screens.subscriptions.list.sections.regularIncome', 'Regular income')}
              count={groupedSubscriptions.regularIncome.length}
              icon={<IconArrowUpCircle size={14} strokeWidth={1.5} />}
            />
            {groupedSubscriptions.regularIncome.map((subscription) => (
              <SubscriptionRow
                key={subscription.id}
                subscription={subscription}
                onClick={() =>
                  navigation({ to: '/subscriptions/$id', params: { id: subscription.id } })
                }
              />
            ))}
          </Stack>
        )}
      </Stack>
    </BaseScreen>
  );
}
