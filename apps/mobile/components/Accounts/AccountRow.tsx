import { Money } from "@guallet/money";
import { AccountDto } from "@guallet/api-client";
import { View, TouchableOpacity, Button } from "react-native";
import { Avatar, Label, Spacing } from "@guallet/ui-react-native";

interface Props {
  account: AccountDto;
  onClick?: () => void;
}

export function AccountRow({ account, onClick }: Props) {
  const amount = Money.fromCurrencyCode({
    amount: account.balance,
    currencyCode: account.currency,
  });

  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={{
          height: 60,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Avatar
          size={40}
          imageUrl={account.institution?.image_src ?? ""}
          alt={account.institution?.name}
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
        <Label
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "black",
          }}
        >
          {amount.format()}
        </Label>
      </View>
    </TouchableOpacity>
  );
}
