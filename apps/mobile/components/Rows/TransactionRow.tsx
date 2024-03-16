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
      style={[
        {
          // height: 64,
        },
        props.style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Avatar imageUrl={institution?.image_src} size={32} />
        <View
          style={{
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            alignContent: "center",
            alignSelf: "center",
            marginHorizontal: Spacing.small,
          }}
        >
          <Label numberOfLines={1}>{transaction.description}</Label>
          {transaction.notes && (
            <Label numberOfLines={1} style={{ fontWeight: "300" }}>
              {transaction.notes}
            </Label>
          )}
        </View>
        <Label style={{ fontWeight: "bold" }}>{transaction.amount}</Label>
      </View>
    </BaseRow>
  );
}
