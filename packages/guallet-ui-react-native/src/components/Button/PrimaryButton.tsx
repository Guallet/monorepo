import { FontAwesome } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { BaseButton } from "./BaseButton";

export interface ButtonProps
  extends React.ComponentProps<typeof TouchableOpacity> {
  title: string;
  onClick: () => void;
  // style?: CSSProperties;
  // style: StyleProp<TouchableOpacity>;
  // fontStyle?: StyleProp<TextStyle>;
  tint?: string;
  leftIconName?: React.ComponentProps<typeof FontAwesome>["name"];
  rightIconName?: React.ComponentProps<typeof FontAwesome>["name"];
}

export function PrimaryButton({
  title,
  onClick,
  style,
  tint,
  leftIconName,
  rightIconName,
}: ButtonProps) {
  return (
    <BaseButton
      onClick={onClick}
      style={[
        {
          height: 48,
          backgroundColor: "blue",
          borderRadius: 20,
          borderColor: tint ?? "blue",
          borderWidth: 1,
        },
        style,
      ]}
    >
      <View
        style={{
          height: "100%",
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignContent: "space-between",
          alignItems: "center",
        }}
      >
        {leftIconName && (
          <FontAwesome
            name={leftIconName}
            size={24}
            color={tint ?? "white"}
            style={{
              marginStart: 24,
            }}
          />
        )}
        <Text
          numberOfLines={1}
          style={[
            {
              flex: 1,
              color: tint ?? "white",
              marginStart: 24,
              marginEnd: 24,
            },
          ]}
        >
          {title}
        </Text>
        {rightIconName && (
          <FontAwesome
            name={rightIconName}
            size={24}
            color={tint ?? "white"}
            style={{
              marginEnd: 24,
            }}
          />
        )}
      </View>
    </BaseButton>
  );
}
