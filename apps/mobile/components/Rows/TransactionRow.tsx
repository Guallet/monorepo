import { TransactionDto } from "@guallet/api-client";
import { Label, Spacing } from "@guallet/ui-react-native";
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
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Image
          style={{
            backgroundColor: "#0553", // TODO: Replace with a theme color
            width: 40,
            height: 40,
            alignSelf: "center",
            borderRadius: 40 / 2,
          }}
          source={{
            uri: institution?.image_src,
          }}
          placeholder={blurHash}
          contentFit="contain"
          transition={1000}
        />
        <Label
          style={{
            marginHorizontal: Spacing.small,
          }}
        >
          {transaction.description}
        </Label>
        <Label>{transaction.notes}</Label>
      </View>
    </BaseRow>
  );
}
