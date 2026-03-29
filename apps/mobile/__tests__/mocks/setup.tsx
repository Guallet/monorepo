// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: 'Stack.Screen',
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    SafeAreaProvider: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock @/components/layout/AppScreen
jest.mock('@/components/layout/AppScreen', () => {
  const { View, Text } = require('react-native');
  return {
    AppScreen: ({ children, headerTitle, isLoading }: any) => (
      <View testID="app-screen">
        {headerTitle && <Text testID="header-title">{headerTitle}</Text>}
        {isLoading && <Text testID="loading">Loading</Text>}
        {children}
      </View>
    ),
  };
});

// Mock @luna-ui/react-native
jest.mock('@luna-ui/react-native', () => {
  const { View, Text, TouchableOpacity, TextInput: RNTextInput } = require('react-native');
  return {
    Button: ({ children, onClick, disabled, variant, style, ...props }: any) => (
      <TouchableOpacity
        onPress={onClick}
        disabled={disabled}
        testID={props.testID || `button-${variant || 'default'}`}
        accessibilityRole="button"
      >
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </TouchableOpacity>
    ),
    TextInput: ({ label, value, onChangeText, placeholder, ...props }: any) => (
      <View>
        {label && <Text>{label}</Text>}
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          testID={props.testID || `input-${label || 'default'}`}
          {...props}
        />
      </View>
    ),
    Section: ({ title, children }: any) => (
      <View testID={`section-${title}`}>
        <Text>{title}</Text>
        {children}
      </View>
    ),
    ListRow: ({ title, subtitle, value, onPress, right }: any) => (
      <TouchableOpacity onPress={onPress} testID={`listrow-${title}`}>
        <Text>{title}</Text>
        {subtitle && <Text>{subtitle}</Text>}
        {value && <Text>{value}</Text>}
        {right}
      </TouchableOpacity>
    ),
    Card: ({ children, style }: any) => <View>{children}</View>,
    EmptyState: ({ title, message }: any) => (
      <View testID="empty-state">
        <Text>{title}</Text>
        <Text>{message}</Text>
      </View>
    ),
    Label: ({ children, size, color }: any) => <Text>{children}</Text>,
    ProgressBar: ({ value, color }: any) => <View testID="progress-bar" />,
    Avatar: ({ size, color, label }: any) => <View testID="avatar" />,
    useTheme: () => ({
      colors: { text: '#000000', background: '#FFFFFF', primary: '#007AFF' },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    }),
  };
});

module.exports = { mockRouter };
