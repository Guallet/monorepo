import { SearchBoxInput } from "@/components/SearchBoxInput";
import { Stack, router } from "expo-router";
import { Text, View, StyleSheet, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { gualletClient } from "@/api/gualletClient";
import { CountryRow } from "@/components/Rows/CountryRow";
import { Divider, Spacing } from "@guallet/ui-react-native";
import { useEffect, useState } from "react";

export default function SelectCountryScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["connections", "countries"],
    queryFn: async () => {
      return await gualletClient.connections.getSupportedCountries();
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
        data?.filter((country) => {
          return country.name.toLowerCase().includes(query.toLowerCase());
        })
      );
    }
  }, [query, data]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Select country",
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
          renderItem={({ item: country }) => (
            <CountryRow
              code={country.code}
              name={country.name}
              onClick={(countryCode) => {
                console.log("countryCode", countryCode);
                router.navigate({
                  pathname: `/(app)/connections/connect/country/[countryCode]`,
                  params: { countryCode },
                });
              }}
            />
          )}
          keyExtractor={(item) => item.code}
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
