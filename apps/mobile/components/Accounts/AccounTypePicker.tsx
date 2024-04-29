import { AccountTypeDto } from "@guallet/api-client";
import { Icon, Label, Spacing } from "@guallet/ui-react-native";
import { SelectInput } from "../SelectInput";
import { View } from "react-native";

interface AccountTypePickerProps {
  accountType: AccountTypeDto;
  onAccountTypeSelected: (accountType: AccountTypeDto) => void;
}

const availableAccountTypes = [
  AccountTypeDto.CURRENT_ACCOUNT,
  AccountTypeDto.CREDIT_CARD,
  AccountTypeDto.SAVINGS,
  AccountTypeDto.INVESTMENT,
  AccountTypeDto.MORTGAGE,
  AccountTypeDto.LOAN,
  AccountTypeDto.PENSION,
];

export function AccountTypePicker({
  accountType,
  onAccountTypeSelected,
}: AccountTypePickerProps) {
  return (
    <SelectInput
      label="Account type"
      placeholder="What is your account type?"
      required
      modalTitle="Select the account type"
      data={availableAccountTypes}
      value={accountType}
      displayValue={getAccountTypeTitleSingular(accountType)}
      itemTemplate={(item) => {
        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: Spacing.medium,
              gap: Spacing.medium,
            }}
          >
            <Icon name={getAccountTypeIconName(item)} size={24} />
            <Label>{getAccountTypeTitleSingular(item)}</Label>
          </View>
        );
      }}
      onItemSelected={(item) => {
        onAccountTypeSelected(item);
      }}
    />
  );
}

function getAccountTypeIconName(type: AccountTypeDto): string {
  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return "building-columns";
    case AccountTypeDto.CREDIT_CARD:
      return "credit-card";
    case AccountTypeDto.INVESTMENT:
      return "arrow-trend-up";
    case AccountTypeDto.LOAN:
      return "scale-unbalanced";
    case AccountTypeDto.MORTGAGE:
      return "house-chimney";
    case AccountTypeDto.PENSION:
      return "person-cane";
    case AccountTypeDto.SAVINGS:
      return "piggy-bank";

    default:
      return "building-columns";
  }
}

export function getAccountTypeTitleSingular(type: AccountTypeDto): string {
  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return "Current Account";
    case AccountTypeDto.CREDIT_CARD:
      return "Credit card";
    case AccountTypeDto.INVESTMENT:
      return "Investment account";
    case AccountTypeDto.LOAN:
      return "Loan";
    case AccountTypeDto.MORTGAGE:
      return "Mortgage";
    case AccountTypeDto.PENSION:
      return "Pension";
    case AccountTypeDto.SAVINGS:
      return "Saving account";

    default:
      return "Other";
  }
}
