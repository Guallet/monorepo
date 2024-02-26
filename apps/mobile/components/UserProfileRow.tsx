import { useAuth } from "@/auth/useAuth";
import Icon from "@guallet/ui-react-native/src/components/Icon/Icon";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface UserProfileRowProps {
  onClick: () => void;
}

export function UserProfileRow({ onClick }: UserProfileRowProps) {
  const { session } = useAuth();

  const user = session?.user;

  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={{
            uri: user?.user_metadata.avatar_url,
          }}
          style={{ width: 50, height: 50, borderRadius: 50 / 2 }}
        />

        <View
          style={{
            flexDirection: "column",
          }}
        >
          <Text>{user?.user_metadata.full_name}</Text>
          <Text>{user?.email}</Text>
        </View>

        <Icon style={{ marginHorizontal: 10 }} name="chevron-right" size={20} />
      </View>
    </TouchableOpacity>
  );
}
