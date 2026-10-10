import { View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { Stack, type NativeStackNavigationOptions } from 'expo-router';
import { ModalLoaderOverlay, useTheme } from '@guallet/luna-mobile';

interface AppScreenProps extends React.ComponentProps<typeof View> {
  safeAreaEdges?: Edge[];
  isLoading?: boolean;
  loadingMessage?: string;
  headerTitle?: string;
  isHeaderVisible?: boolean;
  headerOptions?: NativeStackNavigationOptions;
}

export function AppScreen({
  safeAreaEdges = [],
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
    <SafeAreaView
      edges={safeAreaEdges}
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
    </SafeAreaView>
  );
}
