import { ModalLoaderOverlay } from "@guallet/ui-react-native";
import { View } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Stack } from "expo-router";

interface AppScreenProps extends React.ComponentProps<typeof View> {
  isLoading?: boolean;
  loadingMessage?: string;
  headerTitle?: string;
  headerOptions?: NativeStackNavigationOptions;
}

export function AppScreen({
  isLoading = false,
  loadingMessage,
  children,
  headerOptions,
  headerTitle,
  ...props
}: AppScreenProps) {
  let combinedHeaderOptions: NativeStackNavigationOptions = {
    headerTitleAlign: "center",
  };

  if (headerTitle && headerTitle !== "") {
    combinedHeaderOptions = {
      ...combinedHeaderOptions,
      title: headerTitle,
    };
  }

  // Overrides all the header values with the one passed as parameter
  combinedHeaderOptions = {
    ...combinedHeaderOptions,
    ...headerOptions,
  };

  return (
    <View
      style={[
        {
          flex: 1,
        },
        props.style,
      ]}
    >
      <Stack.Screen options={combinedHeaderOptions} />
      <ModalLoaderOverlay
        isVisible={isLoading}
        loadingMessage={loadingMessage}
      />
      {children}
    </View>
  );
}
