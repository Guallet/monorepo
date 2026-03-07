import { AppSection } from '@/components/Cards/AppSection';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import {
  CreateSubscriptionRequest,
  RecurringPaymentType,
  RecurrenceCadence,
} from '@guallet/api-client';
import { useSubscriptionsMutations } from '@guallet/api-react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Group,
  NativeSelect,
  NumberInput,
  Stack,
  TextInput,
  rem,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { notifications } from '@/lib/notifications';
import { Currency } from '@guallet/money';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  cadenceOptions,
  getSubscriptionFormDefaultValues,
  paymentTypeOptions,
  subscriptionFormSchema,
  type SubscriptionFormData,
} from '../models/SubscriptionForm';

export function AddSubscriptionScreen() {
  const navigate = useNavigate();
  const { createSubscriptionMutation } = useSubscriptionsMutations();
  const defaultCurrency = useDefaultCurrency();

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: getSubscriptionFormDefaultValues(defaultCurrency),
  });
  const {
    control,
    formState: { errors },
  } = form;

  const currencyValue = useWatch({
    control,
    name: 'currency',
  });

  const currency = currencyValue
    ? Currency.fromISOCode(currencyValue)
    : Currency.fromISOCode(defaultCurrency);

  async function onFormSubmit(data: SubscriptionFormData): Promise<void> {
    console.log('Submitting form data', data);
    if (data.currency === null) {
      notifications.show({
        title: 'Currency is required',
        message: 'Please select a currency for the subscription',
        color: 'red',
      });
      return;
    }

    const request: CreateSubscriptionRequest = {
      name: data.name,
      amount: data.amount,
      currency: data.currency ?? defaultCurrency,
      cadence: data.cadence,
      type: data.type,
      startDate: data.startDate.toISOString().split('T')[0],
      imageUrl: data.imageUrl || undefined,
    };

    try {
      const newSubscription = await createSubscriptionMutation.mutateAsync({
        request,
      });
      notifications.show({
        title: 'Subscription created',
        message: `${newSubscription.name} has been created`,
        color: 'green',
      });
      navigate({
        to: '/subscriptions/$id',
        params: {
          id: newSubscription.id,
        },
      });
    } catch (error) {
      console.error('Error creating subscription', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create subscription',
        color: 'red',
      });
    }
  }

  return (
    <BaseScreen>
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <Stack>
          <AppSection title="Create new subscription">
            <Stack>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextInput
                    required
                    label="Name"
                    placeholder="e.g., Netflix, Spotify, Gym membership"
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.currentTarget.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    error={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <NativeSelect
                    required
                    rightSection={
                      <IconChevronDown
                        style={{ width: rem(16), height: rem(16) }}
                      />
                    }
                    label="Type"
                    data={paymentTypeOptions}
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(
                        event.currentTarget.value as RecurringPaymentType,
                      );
                    }}
                    error={errors.type?.message}
                  />
                )}
              />
              <Controller
                name="cadence"
                control={control}
                render={({ field }) => (
                  <NativeSelect
                    required
                    rightSection={
                      <IconChevronDown
                        style={{ width: rem(16), height: rem(16) }}
                      />
                    }
                    label="Frequency"
                    data={cadenceOptions}
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(
                        event.currentTarget.value as RecurrenceCadence,
                      );
                    }}
                    error={errors.cadence?.message}
                  />
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
                    onValueChanged={field.onChange}
                    error={errors.currency?.message}
                  />
                )}
              />
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label="Amount"
                    required
                    description="The recurring payment amount"
                    value={field.value}
                    onChange={(value) => {
                      const parsedValue =
                        typeof value === 'number' ? value : Number(value || 0);
                      field.onChange(
                        Number.isNaN(parsedValue) ? 0 : parsedValue,
                      );
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.amount?.message}
                    leftSection={currency.symbol}
                    decimalScale={currency.decimalPlaces ?? 2}
                    min={0}
                  />
                )}
              />
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DateInput
                    label="Start Date"
                    required
                    description="The date when this payment starts or first occurs"
                    placeholder="Select a date"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value ?? new Date());
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.startDate?.message}
                  />
                )}
              />
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Image URL (optional)"
                    placeholder="https://example.com/logo.png"
                    value={field.value ?? ''}
                    onChange={(event) => {
                      field.onChange(event.currentTarget.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    error={errors.imageUrl?.message}
                  />
                )}
              />
            </Stack>
          </AppSection>
          <Group>
            <Button
              type="submit"
              loading={createSubscriptionMutation.isPending}
            >
              Create subscription
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                navigate({ to: '/subscriptions' });
              }}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </form>
    </BaseScreen>
  );
}
