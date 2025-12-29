import { View } from 'react-native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Stack } from 'expo-router';
import { ModalLoaderOverlay } from '@luna-ui/react-native';

interface AppScreenProps extends React.ComponentProps<typeof View> {
  isLoading?: boolean;
  loadingMessage?: string;
  headerTitle?: string;
  isHeaderVisible?: boolean;
  headerOptions?: NativeStackNavigationOptions;
}

export function AppScreen({
  isLoading = false,
  loadingMessage,
  children,
  headerOptions,
  headerTitle,
  isHeaderVisible = true,
  ...props
}: Readonly<AppScreenProps>) {
  const combinedHeaderOptions: NativeStackNavigationOptions = {
    headerTitleAlign: 'center',
    ...(headerTitle && headerTitle !== '' && { title: headerTitle }),
    headerShown: isHeaderVisible,
    headerShadowVisible: false,
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
