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
import { useForm, zodResolver } from "@mantine/form";
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
    initialValues: {
      name: account?.name ?? "",
      account_type: account?.type ?? AccountTypeDto.CURRENT_ACCOUNT,
      currency: account?.currency ?? "GBP",
      balance: account?.balance.amount ?? 0,
    },
    validate: zodResolver(editAccountFormDataSchema),
  });
  const { values } = form;
  const currency = Currency.fromISOCode(values.currency);

  useEffect(() => {
    if (account) {
      setAccountType(account.type as AccountTypeDto);
      form.setValues({
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
      <form onSubmit={form.onSubmit((values) => onFormSubmit(values))}>
        <Stack>
          <AppSection title="Account details">
            <Stack>
              <TextInput
                key={form.key("name")}
                {...form.getInputProps("name")}
                required
                label="Account name"
                placeholder="Enter account name"
                error={form.errors.name}
              />
              <NativeSelect
                key={form.key("account_type")}
                {...form.getInputProps("account_type")}
                required
                rightSection={
                  <IconChevronDown
                    style={{ width: rem(16), height: rem(16) }}
                  />
                }
                label="Account type"
                data={accountTypes}
              />
              <CurrencyPicker
                name="currency"
                required
                value={form.values.currency}
                onValueChanged={(newValue) => {
                  form.setFieldValue("currency", newValue);
                }}
              />
              <NumberInput
                key={form.key("balance")}
                {...form.getInputProps("balance", {
                  parser: (value: string) => {
                    return value ? parseFloat(value) : 0;
                  },
                  formatter: (value) => {
                    return value?.toString() || "";
                  },
                })}
                label="Balance"
                required
                description="Current balance of the account"
                leftSection={currency.symbol}
                decimalScale={currency.decimalPlaces}
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
    </AppScreen>
  );
}
