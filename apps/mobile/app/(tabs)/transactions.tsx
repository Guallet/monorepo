import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@guallet/luna-ui';

export default function TransactionsScreen() {
  const { colors, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface.background.page },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: colors.text.primary, fontSize: typography.sizes.lg },
        ]}
      >
        Transactions
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
});
