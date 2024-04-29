import { View } from "react-native";

interface VisibleViewProps extends React.ComponentProps<typeof View> {
  isVisible: boolean;
  children: React.ReactNode;
}

export function VisibleView({
  isVisible,
  children,
  ...props
}: VisibleViewProps) {
  if (isVisible) {
    return <View {...props}>{children}</View>;
  } else {
    return null;
  }
}
