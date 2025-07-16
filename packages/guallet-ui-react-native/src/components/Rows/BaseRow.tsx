import { View } from "react-native";
import { TouchableRow } from "./TouchableRow";
import { Icon } from "../Icon/Icon";
import { Spacing } from "./../../theme/spacing";

export interface BaseRowProps extends React.ComponentProps<typeof View> {
  children?: React.ReactNode;
  onClick?: () => void;
  showDivider?: boolean;
  leftIconName?: React.ComponentProps<typeof Icon>["name"];
  rightIconName?: React.ComponentProps<typeof Icon>["name"];
}

export function BaseRow({
  children,
  onClick,
  showDivider = true,
  leftIconName,
  rightIconName = "chevron-right",
  ...props
}: Readonly<BaseRowProps>) {
  return (
    <View
      style={[
        {
          height: 50,
          flexDirection: "column",
          alignItems: "stretch",
          alignContent: "center",
          justifyContent: "flex-start",
        },
        showDivider && {
          borderBottomWidth: 1,
          // borderBottomColor: "grey",
        },
        props.style,
      ]}
    >
      <TouchableRow onClick={onClick}>
        <View
          style={{
            flexGrow: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {leftIconName && (
            <Icon
              name={leftIconName}
              size={24}
              style={{ marginStart: Spacing.small }}
            />
          )}

          <View
            style={{
              flexGrow: 1,
              marginStart: leftIconName ? Spacing.medium : Spacing.small,
            }}
          >
            {children}
          </View>

          {onClick && (
            <Icon
              name={rightIconName}
              size={20}
              style={{ marginHorizontal: Spacing.small }}
            />
          )}
        </View>
      </TouchableRow>
    </View>
  );
}
