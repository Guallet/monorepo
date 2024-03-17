import { Label, Spacing } from "@guallet/ui-react-native";
import React from "react";
import { TouchableWithoutFeedback, View } from "react-native";

interface DashboardWidgetProps extends React.ComponentProps<typeof View> {
  onClick?: () => void;
  title?: string;
  isEnabled?: boolean;
  children?: React.ReactNode;
}

export function WidgetCard({
  onClick,
  title,
  isEnabled = true,
  children,
  ...props
}: DashboardWidgetProps) {
  if (isEnabled === false) {
    return null;
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onClick?.();
      }}
    >
      <View
        style={[
          {
            marginTop: Spacing.small,
            padding: Spacing.small,
            backgroundColor: "white",
            borderRadius: 16,
          },
          props.style,
        ]}
      >
        {/* TITLE */}
        {title && <WidgetCardTitle title={title} />}

        {/*  MAIN CONTENT */}
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}

interface WidgetCardTitleProps {
  title: string;
}
function WidgetCardTitle({ title }: WidgetCardTitleProps) {
  return (
    <View
      style={{
        alignSelf: "center",
        marginTop: Spacing.small,
        paddingHorizontal: Spacing.medium,
      }}
    >
      <Label
        style={{
          fontWeight: "bold",
          fontSize: 18,
          marginBottom: Spacing.medium,
        }}
      >
        {title}
      </Label>
    </View>
  );
}
