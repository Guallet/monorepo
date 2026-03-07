import { AppSection } from '@/components/Cards/AppSection';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { RecurringPaymentType, RecurrenceCadence } from '@guallet/api-client';
import { useSubscription, useSubscriptionsMutations } from '@guallet/api-react';
import { notifications } from '@/lib/notifications';
import { useNavigate, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { ResponsiveModal } from '@guallet/ui-react';

interface SubscriptionDetailsScreenProps {
  subscriptionId: string;
}

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
    return (
      <BaseScreen isLoading>
        <div className="min-h-24" />
      </BaseScreen>
    );
  }

  if (!subscription) {
    throw notFound();
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <ResponsiveModal
        opened={isDeleteModalOpen}
        onClose={hideModal}
        title="Delete subscription"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p>Are you sure you want to delete this subscription?</p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={hideModal}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteSubscriptionMutation.isPending}
            >
              {deleteSubscriptionMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-semibold">
            {subscription.imageUrl ? (
              <img
                alt={subscription.name}
                className="h-full w-full object-cover"
                src={subscription.imageUrl}
              />
            ) : (
              subscription.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{subscription.name}</h1>
            <span
              className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentTypeBadgeClass(subscription.type)}`}
            >
              {getPaymentTypeLabel(subscription.type)}
            </span>
          </div>
        </div>

        <AppSection title="Details">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">
                {formatCurrency(subscription.amount, subscription.currency)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground">Frequency</p>
              <p className="font-medium">
                {getCadenceLabel(subscription.cadence)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {new Date(subscription.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground">Currency</p>
              <p className="font-medium">{subscription.currency}</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">
                {getPaymentTypeLabel(subscription.type)}
              </p>
            </div>
          </div>
        </AppSection>

        <AppSection title="Cost Summary">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground">Monthly estimate</p>
              <p className="font-medium">
                {formatCurrency(
                  calculateMonthlyAmount(
                    subscription.amount,
                    subscription.cadence,
                  ),
                  subscription.currency,
                )}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground">Yearly estimate</p>
              <p className="font-medium">
                {formatCurrency(
                  calculateYearlyAmount(
                    subscription.amount,
                    subscription.cadence,
                  ),
                  subscription.currency,
                )}
              </p>
            </div>
          </div>
        </AppSection>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            className="w-full"
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
            type="button"
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={showDeleteModal}
          >
            Delete
          </Button>
          <Button
            type="button"
            className="w-full"
            variant="ghost"
            onClick={() => {
              navigation({ to: '/subscriptions' });
            }}
          >
            Back to list
          </Button>
        </div>
      </div>
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
