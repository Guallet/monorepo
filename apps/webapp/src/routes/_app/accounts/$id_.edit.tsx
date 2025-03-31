import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  TextInput,
  Button,
  Group,
  NativeSelect,
  rem,
  Stack,
  NumberInput,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { AccountTypeDto, UpdateAccountRequest } from "@guallet/api-client";
import { useEffect, useState } from "react";
import { useAccount, useAccountMutations } from "@guallet/api-react";
import { z } from "zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Currency } from "@guallet/money";
import { notifications } from "@mantine/notifications";
import { CurrencyPicker } from "@/components/CurrencyPicker/CurrencyPicker";
import { AppSection } from "@/components/Cards/AppSection";
import { AppScreen } from "@/components/Layout/AppScreen";

const editAccountFormDataSchema = z.object({
  name: z.string().min(1, { message: "Account name is required" }),
  currency: z.string().default("GBP"),
  balance: z.number().default(0),
  account_type: z.nativeEnum(AccountTypeDto).catch(AccountTypeDto.UNKNOWN),
});
type EditAccountFormData = z.infer<typeof editAccountFormDataSchema>;

export const Route = createFileRoute("/_app/accounts/$id_/edit")({
  component: EditAccountPage,
});

function getLocalizedType(name: AccountTypeDto): string {
  // TODO: Localize this
  switch (name) {
    case AccountTypeDto.CREDIT_CARD:
      return "Credit Card";
    case AccountTypeDto.CURRENT_ACCOUNT:
      return "Current account";
    case AccountTypeDto.INVESTMENT:
      return "Investment";
    case AccountTypeDto.LOAN:
      return "Loan";
    case AccountTypeDto.MORTGAGE:
      return "Mortgage";
    case AccountTypeDto.PENSION:
      return "Pension";
    case AccountTypeDto.SAVINGS:
      return "Savings account";
    case AccountTypeDto.UNKNOWN:
    default:
      return "Other";
  }
}

function EditAccountPage() {
  const { id } = Route.useParams();
  const { account, isLoading } = useAccount(id);
  const navigate = useNavigate();

  const { updateAccountMutation } = useAccountMutations();

  const [accountType, setAccountType] = useState<AccountTypeDto>(
    (account?.type as AccountTypeDto) ?? AccountTypeDto.CURRENT_ACCOUNT
  );

  const form = useForm<EditAccountFormData>({
    defaultValues: {
      name: account?.name ?? "",
      account_type: account?.type ?? AccountTypeDto.CURRENT_ACCOUNT,
      currency: account?.currency ?? "GBP",
      balance: account?.balance.amount ?? 0,
    },
    resolver: zodResolver(editAccountFormDataSchema),
  });
  const { watch } = form;
  const currencyValue = watch("currency");
  const currency = Currency.fromISOCode(currencyValue);

  useEffect(() => {
    if (account) {
      setAccountType(account.type as AccountTypeDto);
      form.reset({
        name: account.name,
        account_type: account.type,
        currency: account.currency,
        balance: account.balance.amount,
      });
    }
  }, [account]);

  const accountTypes = Object.entries(AccountTypeDto).map(
    ({ "0": name, "1": accountType }) => {
      return {
        label: getLocalizedType(accountType),
        value: accountType,
      };
    }
  );

  async function onFormSubmit(data: EditAccountFormData) {
    console.log("onFormSubmit", data);
    const accountRequest: UpdateAccountRequest = {
      name: data.name,
      type: data.account_type,
      currency: data.currency,
      balance: data.balance,
    };
    try {
      const updatedAccount = await updateAccountMutation.mutateAsync({
        id: id,
        request: accountRequest,
      });
      notifications.show({
        title: "Account updated",
        message: `Account ${updatedAccount.name} updated`,
        color: "green",
      });
      navigate({
        to: "/accounts/$id",
        params: {
          id: updatedAccount.id,
        },
      });
    } catch (error) {
      console.error("Error creating the account", error);
    }
  }

  return (
    <AppScreen isLoading={isLoading}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
          <Stack>
            <AppSection title="Account details">
              <Stack>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      required
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
                        <IconChevronDown
                          style={{ width: rem(16), height: rem(16) }}
                        />
                      }
                      label="Account type"
                      data={accountTypes}
                      value={field.value}
                      onChange={(event) => {
                        const type = event.currentTarget
                          .value as AccountTypeDto;
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
                        label="Balance"
                        required
                        description="Current balance of the account"
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
              </Stack>
            </AppSection>
            <Group>
              <Button type="submit">Update account</Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Go back
                  navigate({
                    from: Route.fullPath,
                    to: `/accounts/$id`,
                    params: { id: id },
                  });
                }}
              >
                Cancel
              </Button>
            </Group>
          </Stack>
        </form>
      </FormProvider>
    </AppScreen>
  );
}
