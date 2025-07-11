import { AccountTypeDto } from "@guallet/api-client";
import { Icon, Label, Row, Spacing } from "@guallet/ui-react-native";

interface AccountTypeRowProps {
  type: AccountTypeDto;
  isSelected: boolean;
}
export function AccountTypeRow({ type, isSelected }: AccountTypeRowProps) {
  return (
    <Row
      style={{
        paddingHorizontal: Spacing.medium,
        gap: Spacing.medium,
        backgroundColor: isSelected ? "rgba(0, 0, 255, 0.1)" : "transparent",
        borderColor: isSelected ? "blue" : "transparent",
        borderWidth: 2,
        borderRadius: 16,
        height: 60,
      }}
    >
      <Icon name={getAccountTypeIconName(type)} size={30} />
      <Label>{getAccountTypeTitleSingular(type)}</Label>
    </Row>
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
