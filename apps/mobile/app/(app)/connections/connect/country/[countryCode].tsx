import { gualletClient } from "@/api/gualletClient";
import { InstitutionRow } from "@/components/Rows/InstitutionRow";
import { SearchBoxInput } from "@/components/SearchBoxInput";
import { Divider, Spacing } from "@guallet/ui-react-native";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, FlatList, Alert } from "react-native";
import * as Linking from "expo-linking";

export default function SelectCountryInstitutionScreen() {
  const { countryCode } = useLocalSearchParams<{ countryCode: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["connections", "countries", countryCode],
    queryFn: async () => {
      return await gualletClient.connections.getInstitutionsForCountry(
        countryCode
      );
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (query === "") {
      setFilteredData(data);
    } else {
      setFilteredData(
        data?.filter((institution) => {
          return institution.name.toLowerCase().includes(query.toLowerCase());
        })
      );
    }
  }, [query, data]);

  const onCreateConnection = async (institutionId: string) => {
    try {
      const redirectUrl = Linking.createURL(
        "connections/connect/callback"
        //  {
        // queryParams: { hello: "world" },
        // }
      );

      console.log("Redirect URL", redirectUrl);
      const response =
        await gualletClient.connections.createOpenBankingConnection({
          institutionId: institutionId,
          redirectTo: redirectUrl,
        });

      if (response.link) {
        Linking.openURL(response.link);
      } else {
        // TODO: Show error message
        Alert.alert("Error", "No link returned");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Select institution",
          headerTitleAlign: "center",
        }}
      />
      <SearchBoxInput
        style={{ marginHorizontal: Spacing.medium }}
        query={query}
        onSearchQueryChanged={(newQuery) => {
          setQuery(newQuery);
        }}
      />
      <Divider
        style={{
          marginTop: 10,
        }}
      />
      <View style={{ flex: 1 }}>
        {/* <FlashList
          data={DATA}
          renderItem={({ item }) => <Text>{item.title}</Text>}
          estimatedItemSize={DATA.length}
        /> */}
        {filteredData?.length === 0 && (
          <Text style={{ textAlign: "center" }}>No results found</Text>
        )}

        <FlatList
          data={filteredData}
          renderItem={({ item }) => (
            <InstitutionRow
              institution={item}
              onClick={(institution) => {
                onCreateConnection(institution.id);
                // router.navigate({
                //   pathname: `/(app)/connections/connect/country/[countryCode]`,
                //   params: { countryCode },
                // });
              }}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: "white",
  },
});
