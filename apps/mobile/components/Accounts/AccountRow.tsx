import { Money } from "@guallet/money";
import { AccountDto } from "@guallet/api-client";
import { View, TouchableOpacity, Button } from "react-native";
import { Avatar, Label, Spacing } from "@guallet/ui-react-native";
import { useInstitution } from "@/features/institutions/useInstitutions";

interface Props {
  account: AccountDto;
  onClick?: () => void;
  displayBalance?: boolean;
}
export function AccountRow(props: Props) {
  if (props.onClick) {
    return <ClickableAccountRow {...props} />;
  } else {
    return <BaseAccountRow {...props} />;
  }
}

export function ClickableAccountRow({
  account,
  onClick,
  displayBalance = true,
}: Props) {
  return (
    <TouchableOpacity onPress={onClick}>
      <BaseAccountRow account={account} displayBalance={displayBalance} />
    </TouchableOpacity>
  );
}

function BaseAccountRow({ account, displayBalance = true }: Props) {
  const { institution } = useInstitution(account.institutionId);

  const amount = Money.fromCurrencyCode({
    amount: account.balance.amount,
    currencyCode: account.currency,
  });

  return (
    <View
      style={{
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "white",
        paddingHorizontal: Spacing.small,
      }}
    >
      <Avatar
        size={40}
        imageUrl={institution?.image_src ?? ""}
        alt={institution?.name ?? account.name}
      />
      <Label
        style={{
          flex: 1,
          marginHorizontal: Spacing.small,
        }}
        numberOfLines={1}
      >
        {account.name}
      </Label>
      {displayBalance && (
        <Label
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "black",
          }}
        >
          {amount.format()}
        </Label>
      )}
    </View>
  );
}
