import { AppSection } from '@/components/Cards/AppSection';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  UpdateSubscriptionRequest,
  RecurringPaymentType,
  RecurrenceCadence,
} from '@guallet/api-client';
import { useSubscription, useSubscriptionsMutations } from '@guallet/api-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Currency } from '@guallet/money';
import { notifications } from '@/lib/notifications';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  cadenceOptions,
  getSubscriptionFormDefaultValues,
  mapSubscriptionToFormValues,
  paymentTypeOptions,
  subscriptionFormSchema,
  type SubscriptionFormData,
} from '../models/SubscriptionForm';

const selectClassName =
  'h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): Date | null {
  if (value.trim() === '') {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function getStepForCurrency(decimalPlaces: number | undefined): number {
  if (!decimalPlaces || decimalPlaces <= 0) {
    return 1;
  }

  return 1 / 10 ** decimalPlaces;
}

interface EditSubscriptionScreenProps {
  subscriptionId: string;
}

export function EditSubscriptionScreen({
  subscriptionId,
}: Readonly<EditSubscriptionScreenProps>) {
  const { subscription, isLoading } = useSubscription(subscriptionId);
  const defaultCurrency = useDefaultCurrency();
  const navigate = useNavigate();

  const { updateSubscriptionMutation } = useSubscriptionsMutations();

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: getSubscriptionFormDefaultValues(defaultCurrency),
  });
  const {
    control,
    formState: { errors },
  } = form;

  const selectedCurrency = useWatch({
    control,
    name: 'currency',
  });

  const currency = Currency.fromISOCode(selectedCurrency ?? defaultCurrency);

  useEffect(() => {
    if (subscription) {
      form.reset(mapSubscriptionToFormValues(subscription));
    }
  }, [defaultCurrency, form, subscription]);

  async function onFormSubmit(data: SubscriptionFormData) {
    console.log('Submitting form data', data);
    const request: UpdateSubscriptionRequest = {
      name: data.name,
      amount: data.amount,
      currency: data.currency,
      cadence: data.cadence,
      type: data.type,
      startDate: data.startDate.toISOString().split('T')[0],
      imageUrl: data.imageUrl || undefined,
    };

    try {
      const updatedSubscription = await updateSubscriptionMutation.mutateAsync({
        id: subscriptionId,
        request,
      });
      notifications.show({
        title: 'Subscription updated',
        message: `${updatedSubscription.name} has been updated`,
        color: 'green',
      });
      navigate({
        to: '/subscriptions/$id',
        params: {
          id: updatedSubscription.id,
        },
      });
    } catch (error) {
      console.error('Error updating subscription', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update subscription',
        color: 'red',
      });
    }
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <div className="flex flex-col gap-4">
          <AppSection title="Edit subscription">
            <div className="flex flex-col gap-4">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="subscription-edit-name">Name</Label>
                    <Input
                      id="subscription-edit-name"
                      required
                      placeholder="e.g., Netflix, Spotify, Gym membership"
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                    {errors.name?.message ? (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="subscription-edit-type">Type</Label>
                    <select
                      id="subscription-edit-type"
                      className={selectClassName}
                      required
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(
                          event.target.value as RecurringPaymentType,
                        );
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    >
                      {paymentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.type?.message ? (
                      <p className="text-sm text-destructive">
                        {errors.type.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                name="cadence"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="subscription-edit-cadence">Frequency</Label>
                    <select
                      id="subscription-edit-cadence"
                      className={selectClassName}
                      required
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.target.value as RecurrenceCadence);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    >
                      {cadenceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.cadence?.message ? (
                      <p className="text-sm text-destructive">
                        {errors.cadence.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <CurrencyPicker
                    name={field.name}
                    required
                    value={field.value}
                    onValueChanged={(newValue) => {
                      field.onChange(newValue ?? defaultCurrency);
                    }}
                    error={errors.currency?.message}
                  />
                )}
              />
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="subscription-edit-amount">Amount</Label>
                    <p className="text-sm text-muted-foreground">
                      The recurring payment amount
                    </p>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {currency.symbol}
                      </span>
                      <Input
                        id="subscription-edit-amount"
                        type="number"
                        required
                        min={0}
                        step={getStepForCurrency(currency.decimalPlaces)}
                        className="pl-8"
                        value={field.value}
                        onChange={(event) => {
                          const parsedValue = Number(event.target.value);
                          field.onChange(
                            Number.isNaN(parsedValue) ? 0 : parsedValue,
                          );
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </div>
                    {errors.amount?.message ? (
                      <p className="text-sm text-destructive">
                        {errors.amount.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="subscription-edit-start-date">
                      Start Date
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      The date when this payment starts or first occurs
                    </p>
                    <Input
                      id="subscription-edit-start-date"
                      type="date"
                      required
                      value={formatDateForInput(field.value)}
                      onChange={(event) => {
                        const nextDate = parseDateInput(event.target.value);
                        field.onChange(nextDate ?? new Date());
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                    {errors.startDate?.message ? (
                      <p className="text-sm text-destructive">
                        {errors.startDate.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="subscription-edit-image-url">
                      Image URL (optional)
                    </Label>
                    <Input
                      id="subscription-edit-image-url"
                      placeholder="https://example.com/logo.png"
                      value={field.value ?? ''}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                    {errors.imageUrl?.message ? (
                      <p className="text-sm text-destructive">
                        {errors.imageUrl.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            </div>
          </AppSection>
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={updateSubscriptionMutation.isPending}
            >
              {updateSubscriptionMutation.isPending
                ? 'Updating subscription...'
                : 'Update subscription'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                navigate({
                  to: '/subscriptions/$id',
                  params: { id: subscriptionId },
                });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </BaseScreen>
  );
}
