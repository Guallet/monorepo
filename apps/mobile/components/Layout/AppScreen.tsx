import { ModalLoaderOverlay } from "@guallet/ui-react-native";
import { View } from "react-native";

interface AppScreenProps extends React.ComponentProps<typeof View> {
  isLoading?: boolean;
  loadingMessage?: string;
}

export function AppScreen({
  isLoading = false,
  loadingMessage,
  children,
  ...props
}: AppScreenProps) {
  return (
    <View
      style={[
        {
          flex: 1,
        },
        props.style,
      ]}
    >
      <ModalLoaderOverlay
        isVisible={isLoading}
        loadingMessage={loadingMessage}
      />
      {children}
    </View>
  );
}
