import { View } from 'react-native';
import { Stack, type NativeStackNavigationOptions } from 'expo-router';
import { ModalLoaderOverlay, useTheme } from '@guallet/ui-react-native';

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
  const { colors } = useTheme();
  const combinedHeaderOptions: NativeStackNavigationOptions = {
    headerTitleAlign: 'center',
    ...(headerTitle && headerTitle !== '' && { title: headerTitle }),
    headerShown: isHeaderVisible,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.surface.background.primary },
    headerTintColor: colors.text.primary,
    headerTitleStyle: { color: colors.text.primary },
    ...headerOptions,
  };

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.surface.background.page,
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
