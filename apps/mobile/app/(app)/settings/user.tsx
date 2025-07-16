import { useAuth } from "@/auth/useAuth";
import { AppScreen } from "@/components/layout/AppScreen";
import {
  Column,
  DangerButton,
  EditableValueRow,
  SecondaryButton,
  Spacing,
  TextRow,
  ValueRow,
} from "@guallet/ui-react-native";
import { Image, View, Text, Button } from "react-native";

export default function UserScreen() {
  const { session, signOut } = useAuth();

  return (
    <AppScreen
      headerTitle="User settings"
      style={{ flex: 1, justifyContent: "center", alignItems: "stretch" }}
    >
      <Image
        source={{
          uri: session?.user.user_metadata.avatar_url,
        }}
        style={{
          alignSelf: "center",
          width: 150,
          height: 150,
          borderRadius: 150 / 2,
        }}
      />
      <View style={{ padding: Spacing.small }}>
        <EditableValueRow
          title="Name"
          value={session?.user.user_metadata.full_name ?? "Unknown"}
          onValueChange={(newValue) => {
            // TODO: Update the user profile with the new name
          }}
        />
        <EditableValueRow
          title="Email"
          value={session?.user.email ?? "Unknown"}
          onValueChange={(newValue) => {
            // TODO: Update email
          }}
        />
      </View>

      <View style={{ flex: 1 }} />

      <Column style={{ gap: Spacing.extraSmall, padding: Spacing.small }}>
        <SecondaryButton
          title="Sign Out"
          onPress={async () => {
            await signOut();
          }}
        />
        <DangerButton title="Delete account" onPress={() => {}} />
      </Column>
    </AppScreen>
  );

  // return (
  //   <View style={{ flex: 1, justifyContent: "center", alignItems: "stretch" }}>
  //     <Stack.Screen
  //       options={{
  //         title: "User settings",
  //       }}
  //     />
  //     <View>
  //       <Image
  //         source={{
  //           uri: session?.user.user_metadata.avatar_url,
  //         }}
  //         style={{
  //           alignSelf: "center",
  //           width: 150,
  //           height: 150,
  //           borderRadius: 150 / 2,
  //         }}
  //       />

  //       <Text style={{ color: "grey", fontSize: 12 }}>Name</Text>
  //       <Text>{session?.user.user_metadata.full_name}</Text>
  //       <Text style={{ color: "grey", fontSize: 12 }}>Email</Text>
  //       <Text>{session?.user.email}</Text>
  //     </View>

  //     <View style={{ flex: 1 }} />

  //     <View>
  //       <Button
  //         title="Sign Out"
  //         onPress={async () => {
  //           await signOut();
  //         }}
  //       />
  //       <Button title="Delete account" onPress={() => {}} />
  //     </View>
  //   </View>
  // );
}
