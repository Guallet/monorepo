import { InstitutionDto } from "@guallet/api-client";
import { Spacing } from "@guallet/ui-react-native";
import { BaseRow } from "@guallet/ui-react-native/src/components/Rows/BaseRow";
import { Text, View } from "react-native";
import { Image } from "expo-image";

interface InstitutionRowProps {
  // TODO: Replace this from the DTO to the domain model
  institution: InstitutionDto;
  onClick?: (institution: InstitutionDto) => void;
}

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export function InstitutionRow({ institution, onClick }: InstitutionRowProps) {
  return (
    <BaseRow
      onClick={() => {
        onClick?.(institution);
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
            uri: institution.logo,
          }}
          placeholder={blurhash}
          contentFit="contain"
          transition={1000}
        />
        <Text
          style={{
            marginHorizontal: Spacing.small,
          }}
        >
          {institution.name}
        </Text>
      </View>
    </BaseRow>
  );
}
