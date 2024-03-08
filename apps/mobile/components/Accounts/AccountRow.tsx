import { Money } from "@guallet/money";
import { AccountDto } from "@guallet/api-client";
import { View, TouchableOpacity, Button } from "react-native";
import { Avatar, Label, Spacing } from "@guallet/ui-react-native";
import { useInstitution } from "@/features/institutions/useInstitutions";

interface Props {
  account: AccountDto;
  onClick?: () => void;
}

export function AccountRow({ account, onClick }: Props) {
  const { institution } = useInstitution(account.institutionId);

  const amount = Money.fromCurrencyCode({
    amount: account.balance.amount,
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
