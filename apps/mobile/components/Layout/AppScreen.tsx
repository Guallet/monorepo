import { ModalLoaderOverlay } from "@guallet/ui-react-native";
import { View } from "react-native";

interface AppScreenProps {
  isLoading?: boolean;
  loadingMessage?: string;
  children: React.ReactNode;
}

export function AppScreen({
  isLoading = false,
  loadingMessage,
  children,
}: AppScreenProps) {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ModalLoaderOverlay
        isVisible={isLoading}
        loadingMessage={loadingMessage}
      />
      {children}
    </View>
  );
}
