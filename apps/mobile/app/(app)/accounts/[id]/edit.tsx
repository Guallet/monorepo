import { useAccount } from "@/features/accounts/useAccounts";
import { useInstitution } from "@/features/institutions/useInstitutions";
import { Icon, Label, PrimaryButton, Spacing } from "@guallet/ui-react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

export default function AccountEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { account, isLoading } = useAccount(id);
  const { institution } = useInstitution(account?.institutionId);

  if (isLoading) {
    return <Label>Loading...</Label>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          presentation: "modal",
          title: "Edit Account",
          // headerTitleAlign: "center",
          headerBackVisible: false,
          headerTitleAlign: "center",
          headerRight: () => {
            return (
              <TouchableOpacity
                onPress={() => {
                  router.back();
                }}
              >
                <Icon name="xmark" size={24} />
              </TouchableOpacity>
            );
          },
        }}
      />
      <ScrollView
        style={{
          flex: 1,
        }}
      >
        <Label>EDIT ACCOUNT PAGE</Label>
      </ScrollView>
      <View
        style={{
          justifyContent: "flex-end",
          padding: Spacing.medium,
        }}
      >
        <PrimaryButton
          title="Save changes"
          onPress={() => {
            router.back();
          }}
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
