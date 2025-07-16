import { View, Text, TouchableOpacity } from "react-native";
import { BaseButton } from "./BaseButton";
import { Icon } from "../Icon/Icon";

export interface ButtonProps
  extends React.ComponentProps<typeof TouchableOpacity> {
  title: string;
  onClick?: () => void;
  // style?: CSSProperties;
  // style: StyleProp<TouchableOpacity>;
  // fontStyle?: StyleProp<TextStyle>;
  tint?: string;
  leftIconName?: React.ComponentProps<typeof Icon>["name"];
  rightIconName?: React.ComponentProps<typeof Icon>["name"];
}

export function PrimaryButton({
  title,
  onClick,
  style,
  tint,
  leftIconName,
  rightIconName,
  disabled = false,
}: Readonly<ButtonProps>) {
  return (
    <BaseButton
      onClick={onClick}
      style={[
        {
          height: 48,
          backgroundColor: disabled ? "grey" : "blue",
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
          <Icon
            name={leftIconName}
            size={24}
            color={tint ?? "white"}
            style={{
              marginStart: 16,
            }}
          />
        )}
        <Text
          numberOfLines={1}
          style={[
            {
              flex: 1,
              color: tint ?? "white",
              // marginStart: leftIconName ? 8 : 24,
              // marginEnd: rightIconName ? 8 : 24,
              marginStart: leftIconName ? 8 : 48,
              marginEnd: rightIconName ? 8 : 48,
              textAlign: "center",
            },
          ]}
        >
          {title}
        </Text>
        {rightIconName && (
          <Icon
            name={rightIconName}
            size={24}
            color={tint ?? "white"}
            style={{
              marginEnd: 16,
            }}
          />
        )}
      </View>
    </BaseButton>
  );
}
