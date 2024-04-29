import { ObConnection } from "@guallet/api-client";
import {
  useOpenBankingConnection,
  useOpenBankingConnections,
  useOpenBankingInstitution,
} from "@guallet/api-react";
import { Avatar } from "@guallet/ui-react-native";
import { Stack, router } from "expo-router";
import { Button, FlatList, Text, View } from "react-native";

export default function ConnectionsScreen() {
  const { connections } = useOpenBankingConnections();

  return (
    <View>
      <Stack.Screen
        options={{
          title: "Connections",
          headerTitleAlign: "center",
        }}
      />
      <Text>Connections</Text>
      <FlatList
        data={connections}
        keyExtractor={(connection) => connection.id}
        renderItem={({ item: connection }) => {
          return <ConnectionRow connection={connection} />;
        }}
      />
      <Button
        title="Add new connection"
        onPress={() => {
          router.navigate("connections/connect/country");
        }}
      />
    </View>
  );
}

function ConnectionRow({ connection }: { connection: ObConnection }) {
  const { connection: connectionData } = useOpenBankingConnection(
    connection.id
  );

  const { institution } = useOpenBankingInstitution(
    connectionData?.institution_id ?? ""
  );

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Avatar
        size={24}
        imageUrl={institution?.image_src ?? ""}
        alt={institution?.name}
      />
      <Text>{institution?.name}</Text>
      <Text>{connectionData?.status}</Text>
      <Text>{connectionData?.created_at}</Text>
      <Text>{connectionData?.updated_at}</Text>
    </View>
  );
}
