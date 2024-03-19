import { ModalLoaderOverlay } from "@guallet/ui-react-native";
import { View } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Stack } from "expo-router";

interface AppScreenProps extends React.ComponentProps<typeof View> {
  isLoading?: boolean;
  loadingMessage?: string;
  headerOptions?: NativeStackNavigationOptions;
}

export function AppScreen({
  isLoading = false,
  loadingMessage,
  children,
  headerOptions,
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
      {headerOptions && <Stack.Screen options={headerOptions} />}
      <ModalLoaderOverlay
        isVisible={isLoading}
        loadingMessage={loadingMessage}
      />
      {children}
    </View>
  );
}
