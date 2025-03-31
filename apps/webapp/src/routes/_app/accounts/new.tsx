import {
  TextInput,
  Button,
  Group,
  NativeSelect,
  rem,
  NumberInput,
  Stack,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
import { CurrencyPicker } from "@/components/CurrencyPicker/CurrencyPicker";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@mantine/form";
import { z } from "zod";
import { Currency } from "@guallet/money";
import { notifications } from "@mantine/notifications";
import { useAccountMutations } from "@guallet/api-react";
import { AccountTypeDto, CreateAccountRequest } from "@guallet/api-client";
import { AppSection } from "@/components/Cards/AppSection";
import { zodResolver } from "@mantine/form";

export const Route = createFileRoute("/_app/accounts/new")({
  component: AddAccountPage,
});

const accountFormDataSchema = z.object({
  name: z.string().min(1, { message: "Account name is required" }),
  currency: z.string().default("GBP"),
  balance: z.number().default(0),
  account_type: z.nativeEnum(AccountTypeDto).catch(AccountTypeDto.UNKNOWN),
  credit_limit: z.string().nullable().optional(),
  interest_rate: z.string().nullable().optional(),
});
type AddAccountFormData = z.infer<typeof accountFormDataSchema>;

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
      return "Other";
    default:
      return "Other";
  }
}

export function AddAccountPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { createAccountMutation } = useAccountMutations();

  const [accountType, setAccountType] = useState<AccountTypeDto>(
    AccountTypeDto.CURRENT_ACCOUNT
  );

  const form = useForm<AddAccountFormData>({
    validate: zodResolver(accountFormDataSchema),
    initialValues: {
      name: "",
      account_type: AccountTypeDto.CURRENT_ACCOUNT,
      currency: "GBP", // Get this from user settings
      balance: 0,
      credit_limit: null,
      interest_rate: null,
    },
  });
  const { values } = form;
  const currencyValue = values.currency;
  const currency = Currency.fromISOCode(currencyValue);

  async function onFormSubmit(data: AddAccountFormData): Promise<void> {
    console.log("onFormSubmit", data);
    const accountRequest: CreateAccountRequest = {
      name: data.name,
      type: data.account_type,
      currency: data.currency,
      initial_balance: data.balance,
    };
    try {
      const newAccount = await createAccountMutation.mutateAsync({
        request: accountRequest,
      });
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

  const accountTypes = Object.entries(AccountTypeDto).map(
    ({ "0": name, "1": accountType }) => {
      return {
        label: getLocalizedType(accountType),
        value: accountType,
      };
    }
  );

  return (
    // TODOL: Restore the form state from the parent form
    // <FormProvider {...form}>
    <form onSubmit={form.onSubmit(onFormSubmit)}>
      <Stack>
        <AppSection title="Create new account">
          <Stack
            style={{
              margin: "auto",
            }}
          >
            <TextInput
              label="Account name"
              placeholder="Enter account name"
              {...form.getInputProps("name")}
              error={form.errors.name}
            />
            <NativeSelect
              required
              rightSection={
                <IconChevronDown style={{ width: rem(16), height: rem(16) }} />
              }
              label="Account type"
              data={accountTypes}
              {...form.getInputProps("account_type")}
              onChange={(event) => {
                const type = event.currentTarget.value as AccountTypeDto;
                setAccountType(type);
                form.setFieldValue("account_type", type);
              }}
            />
            <CurrencyPicker
              name="currency"
              required
              value={values.currency}
              onValueChanged={(newValue) => {
                form.setFieldValue("currency", newValue);
              }}
            />
            <NumberInput
              label="Initial balance"
              required
              description="Initial balance of the account"
              {...form.getInputProps("balance", {
                parser: (value: string) => parseFloat(value),
              })}
              leftSection={currency.symbol}
              decimalScale={currency.decimalPlaces}
            />
          </Stack>
        </AppSection>
        <Group>
          <Button type="submit">Create account</Button>
          <Button
            variant="outline"
            onClick={() => {
              navigate({ to: "/accounts" });
            }}
          >
            Cancel
          </Button>
        </Group>
      </Stack>
    </form>
    // </FormProvider>
  );
}
