import { TransactionDto } from "@guallet/api-client";
import { Avatar, Label, Spacing } from "@guallet/ui-react-native";
import { BaseRow } from "@guallet/ui-react-native/src/components/Rows/BaseRow";
import { View } from "react-native";
import { Image } from "expo-image";
import { useAccount } from "@/features/accounts/useAccounts";
import { useInstitution } from "@/features/institutions/useInstitutions";

interface TransactionRowProps {
  // TODO: Replace this from the DTO to the domain model
  transaction: TransactionDto;
  onClick?: (transaction: TransactionDto) => void;
}

const blurHash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const { account } = useAccount(transaction.accountId);
  const { institution } = useInstitution(account?.institutionId);

  return (
    <BaseRow
      onClick={() => {
        onClick?.(transaction);
      }}
      showDivider={false}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Avatar imageUrl={institution?.image_src} size={40} />
        <Label
          style={{
            marginHorizontal: Spacing.small,
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
