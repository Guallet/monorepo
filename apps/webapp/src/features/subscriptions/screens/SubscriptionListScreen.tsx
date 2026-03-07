import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  SubscriptionDto,
  RecurringPaymentType,
  RecurrenceCadence,
} from '@guallet/api-client';
import { useSubscriptions } from '@guallet/api-react';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { IconPlus, IconChevronRight } from '@tabler/icons-react';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

function getPaymentTypeBadgeClass(type: RecurringPaymentType): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return 'bg-blue-100 text-blue-800';
    case RecurringPaymentType.REGULAR_PAYMENT:
      return 'bg-orange-100 text-orange-800';
    case RecurringPaymentType.REGULAR_INCOME:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-muted text-muted-foreground';
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
  t: (key: string, options?: { count?: number }) => string,
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
    message = t('screens.subscriptions.list.nextPayment.today');
  } else if (daysUntil === 1) {
    message = t('screens.subscriptions.list.nextPayment.tomorrow');
  } else if (daysUntil > 1 && daysUntil <= 7) {
    message = t('screens.subscriptions.list.nextPayment.inDays', {
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
  const initials = subscription.name.charAt(0).toUpperCase();

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
    <button type="button" className="w-full text-left" onClick={onClick}>
      <Card className="cursor-pointer border shadow-sm transition-colors hover:bg-accent/30">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold">
              {subscription.imageUrl ? (
                <img
                  alt={subscription.name}
                  className="h-full w-full object-cover"
                  src={subscription.imageUrl}
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="truncate font-medium">{subscription.name}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentTypeBadgeClass(subscription.type)}`}
                >
                  {getPaymentTypeLabel(subscription.type, t)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getCadenceLabel(subscription.cadence, t)}
                </span>
              </div>
              {nextPaymentDate ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs">
                    {t('screens.subscriptions.list.nextPayment.label')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatted}
                  </span>
                  {message ? (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {message}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <p className="text-lg font-semibold">
              {formatCurrency(subscription.amount, subscription.currency)}
            </p>
            <IconChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </Card>
    </button>
  );
}

export function SubscriptionListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigate();
  const { subscriptions, isLoading } = useSubscriptions();
  const defaultCurrency = useDefaultCurrency();
  const safeSubscriptions = useMemo(() => subscriptions ?? [], [subscriptions]);

  const groupedSubscriptions = useMemo(() => {
    if (isLoading || safeSubscriptions.length === 0) {
      return { subscriptions: [], regularPayments: [], regularIncome: [] };
    }

    return {
      subscriptions: safeSubscriptions.filter(
        (s) => s.type === RecurringPaymentType.SUBSCRIPTION,
      ),
      regularPayments: safeSubscriptions.filter(
        (s) => s.type === RecurringPaymentType.REGULAR_PAYMENT,
      ),
      regularIncome: safeSubscriptions.filter(
        (s) => s.type === RecurringPaymentType.REGULAR_INCOME,
      ),
    };
  }, [safeSubscriptions, isLoading]);

  const totalMonthlyAmount = useMemo(() => {
    return safeSubscriptions.reduce((total, sub) => {
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
  }, [safeSubscriptions]);

  return (
    <BaseScreen isLoading={isLoading}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">
              {t('screens.subscriptions.list.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('screens.subscriptions.list.estimatedMonthly')}{' '}
              {formatCurrency(totalMonthlyAmount, defaultCurrency)}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              navigation({ to: '/subscriptions/new' });
            }}
          >
            <IconPlus className="h-4 w-4" />
            {t('screens.subscriptions.list.addButton.label')}
          </Button>
        </div>

        {safeSubscriptions.length === 0 && !isLoading ? (
          <Card className="border p-6 shadow-sm">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-lg text-muted-foreground">
                {t('screens.subscriptions.list.emptyState.title')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('screens.subscriptions.list.emptyState.description')}
              </p>
              <Button
                type="button"
                onClick={() => {
                  navigation({ to: '/subscriptions/new' });
                }}
              >
                {t('screens.subscriptions.list.emptyState.button.label')}
              </Button>
            </div>
          </Card>
        ) : null}

        {groupedSubscriptions.subscriptions.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-base font-semibold">
              {t('screens.subscriptions.list.sections.subscriptions')} (
              {groupedSubscriptions.subscriptions.length})
            </h2>
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
          </section>
        ) : null}

        {groupedSubscriptions.regularPayments.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-base font-semibold">
              {t('screens.subscriptions.list.sections.regularPayments')} (
              {groupedSubscriptions.regularPayments.length})
            </h2>
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
          </section>
        ) : null}

        {groupedSubscriptions.regularIncome.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-base font-semibold">
              {t('screens.subscriptions.list.sections.regularIncome')} (
              {groupedSubscriptions.regularIncome.length})
            </h2>
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
          </section>
        ) : null}
      </div>
    </BaseScreen>
  );
}
