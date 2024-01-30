import {
  TextInput,
  Button,
  Group,
  NativeSelect,
  rem,
  NumberInput,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { AccountType } from "@accounts/models/Account";
import { useState } from "react";
import { CurrencyPicker } from "@/components/CurrencyPicker/CurrencyPicker";

import { FileRoute, useNavigate } from "@tanstack/react-router";
import { AccountMetadataForm } from "@/features/accounts/AddAccount/components/AccountMetadataForm";
import {
  CreateAccountRequest,
  createAccount,
} from "@/features/accounts/api/accounts.api";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Currency } from "@guallet/money";
import { notifications } from "@mantine/notifications";

export const Route = new FileRoute("/_app/accounts/add").createRoute({
  component: AddAccountPage,
});

const accountFormDataSchema = z.object({
  name: z.string().min(1, { message: "Account name is required" }),
  currency: z.string().default("GBP"),
  balance: z.number().default(0),
  account_type: z.nativeEnum(AccountType).catch(AccountType.UNKNOWN),
  credit_limit: z.string().nullable().optional(),
  interest_rate: z.string().nullable().optional(),
});
type AddAccountFormData = z.infer<typeof accountFormDataSchema>;

function getLocalizedType(name: AccountType): string {
  // TODO: Localize this
  switch (name) {
    case AccountType.CREDIT_CARD:
      return "Credit Card";
    case AccountType.CURRENT_ACCOUNT:
      return "Current account";
    case AccountType.INVESTMENT:
      return "Investment";
    case AccountType.LOAN:
      return "Loan";
    case AccountType.MORTGAGE:
      return "Mortgage";
    case AccountType.PENSION:
      return "Pension";
    case AccountType.SAVINGS:
      return "Savings account";
    case AccountType.UNKNOWN:
      return "Other";
    default:
      return "Other";
  }
}

export function AddAccountPage() {
  const navigate = useNavigate({ from: Route.fullPath });

  const [accountType, setAccountType] = useState<AccountType>(
    AccountType.CURRENT_ACCOUNT
  );

  const form = useForm<AddAccountFormData>({
    defaultValues: {
      account_type: AccountType.CURRENT_ACCOUNT,
      currency: "GBP", // Get this from user settings
      balance: 0,
      credit_limit: null,
      interest_rate: null,
    },
    resolver: zodResolver(accountFormDataSchema),
  });
  const { watch } = form;
  const currencyValue = watch("currency");
  const currency = Currency.fromISOCode(currencyValue);

  async function onFormSubmit(data: AddAccountFormData) {
    console.log("onFormSubmit", data);
    const accountRequest: CreateAccountRequest = {
      name: data.name,
      type: data.account_type,
      currency: data.currency,
      initial_balance: data.balance,
    };
    try {
      const newAccount = await createAccount(accountRequest);
      notifications.show({
        title: "Account created",
        message: `Account ${newAccount.name} created`,
        color: "blue",
      });
      navigate({
        to: "/accounts/$id",
        params: {
          id: newAccount.id,
        },
      });
    } catch (error) {
      console.error("Error creating the account", error);
    }
  }

  const accountTypes = Object.entries(AccountType).map(
    ({ "0": name, "1": accountType }) => {
      return {
        label: getLocalizedType(accountType),
        value: accountType,
      };
    }
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        Errors:{" "}
        {JSON.stringify({
          name: form.formState.errors.name?.message,
          currency: form.formState.errors.currency?.message,
          balance: form.formState.errors.balance?.message,
          account_type: form.formState.errors.account_type?.message,
          credit_limit: form.formState.errors.credit_limit?.message,
          interest_rate: form.formState.errors.interest_rate?.message,
        })}
        <Controller
          name="name"
          control={form.control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Account name"
              placeholder="Enter account name"
              error={form.formState.errors.name?.message}
            />
          )}
        />
        <Controller
          name="account_type"
          control={form.control}
          render={({ field }) => (
            <NativeSelect
              {...field}
              required
              rightSection={
                <IconChevronDown style={{ width: rem(16), height: rem(16) }} />
              }
              label="Account type"
              data={accountTypes}
              mt="md"
              value={field.value}
              onChange={(event) => {
                const type = event.currentTarget.value as AccountType;
                setAccountType(type);
                field.onChange(type);
              }}
            />
          )}
        />
        <Controller
          name="currency"
          control={form.control}
          render={({ field }) => (
            <CurrencyPicker
              {...field}
              name="currency"
              required
              value={field.value}
              onValueChanged={(newValue) => {
                field.onChange(newValue);
              }}
            />
          )}
        />
        <Controller
          name="balance"
          control={form.control}
          render={({ field }) => {
            return (
              <NumberInput
                {...field}
                label="Initial balance"
                required
                description="Initial balance of the account"
                defaultValue={field.value}
                onChange={(newValue) => {
                  field.onChange(newValue);
                }}
                leftSection={currency.symbol}
                decimalScale={currency.decimalPlaces}
              />
            );
          }}
        />
        {accountType && <AccountMetadataForm accountType={accountType} />}
        <Group>
          <Button type="submit">Save</Button>
          <Button
            variant="outline"
            onClick={() => {
              navigate({ to: "/accounts" });
            }}
          >
            Cancel
          </Button>
        </Group>
      </form>
    </FormProvider>
  );
}
