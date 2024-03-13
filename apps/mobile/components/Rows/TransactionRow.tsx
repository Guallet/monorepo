import { TransactionDto } from "@guallet/api-client";
import { Avatar, Label, Spacing } from "@guallet/ui-react-native";
import { BaseRow } from "@guallet/ui-react-native/src/components/Rows/BaseRow";
import { View } from "react-native";
import { useAccount } from "@/features/accounts/useAccounts";
import { useInstitution } from "@/features/institutions/useInstitutions";

interface TransactionRowProps extends React.ComponentProps<typeof View> {
  // TODO: Replace this from the DTO to the domain model
  transaction: TransactionDto;
  onClick?: (transaction: TransactionDto) => void;
}

export function TransactionRow({
  transaction,
  onClick,
  ...props
}: TransactionRowProps) {
  const { account } = useAccount(transaction.accountId);
  const { institution } = useInstitution(account?.institutionId);

  return (
    <BaseRow
      onClick={() => {
        onClick?.(transaction);
      }}
      showDivider={false}
      style={[props.style]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Avatar imageUrl={institution?.image_src} size={32} />
        <Label
          style={{
            marginHorizontal: Spacing.small,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {transaction.description}
        </Label>
        <Label>{transaction.notes}</Label>
      </View>
    </BaseRow>
  );
}
