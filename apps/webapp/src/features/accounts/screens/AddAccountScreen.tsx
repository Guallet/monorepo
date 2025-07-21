import { AppSection } from "@/components/Cards/AppSection";
import { CurrencyPicker } from "@/components/CurrencyPicker/CurrencyPicker";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { AccountTypeDto, CreateAccountRequest } from "@guallet/api-client";
import { useAccountMutations } from "@guallet/api-react";
import {
  Stack,
  TextInput,
  NativeSelect,
  rem,
  NumberInput,
  Group,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { IconChevronDown } from "@tabler/icons-react";
import { Route, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { getAccountTypeTitleSingular } from "../models/Account";
import { notifications } from "@mantine/notifications";
import { Currency } from "@guallet/money";

const accountFormDataSchema = z.object({
  name: z.string().min(1, { message: "Account name is required" }),
  currency: z.string().nullable().default(null),
  balance: z.number().default(0),
  account_type: z.enum(AccountTypeDto).catch(AccountTypeDto.UNKNOWN),
  credit_limit: z.string().nullable().optional(),
  interest_rate: z.string().nullable().optional(),
});
type AddAccountFormData = z.infer<typeof accountFormDataSchema>;

export function AddAccountScreen() {
  const navigate = useNavigate();
  const { createAccountMutation } = useAccountMutations();

  const [accountType, setAccountType] = useState<AccountTypeDto>(
    AccountTypeDto.CURRENT_ACCOUNT
  );

  const form = useForm<AddAccountFormData>({
    validate: zodResolver(accountFormDataSchema),
    initialValues: {
      name: "",
      account_type: AccountTypeDto.CURRENT_ACCOUNT,
      currency: null,
      balance: 0,
      credit_limit: null,
      interest_rate: null,
    },
  });
  const { values } = form;

  const currencyValue = values.currency;
  const currency = currencyValue ? Currency.fromISOCode(currencyValue) : null;

  async function onFormSubmit(data: AddAccountFormData): Promise<void> {
    console.log("onFormSubmit", data);
    if (data.currency === null) {
      notifications.show({
        title: "Currency is required",
        message: "Please select a currency for the account",
        color: "red",
      });
      return;
    }
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
        label: getAccountTypeTitleSingular(accountType),
        value: accountType,
      };
    }
  );

  return (
    <BaseScreen>
      <form onSubmit={form.onSubmit(onFormSubmit)}>
        <Stack>
          <AppSection title="Create new account">
            <Stack>
              <TextInput
                required
                label="Account name"
                placeholder="Enter account name"
                {...form.getInputProps("name")}
                error={form.errors.name}
              />
              <NativeSelect
                required
                rightSection={
                  <IconChevronDown
                    style={{ width: rem(16), height: rem(16) }}
                  />
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
                leftSection={currency?.symbol}
                decimalScale={currency?.decimalPlaces}
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
    </BaseScreen>
  );
}
