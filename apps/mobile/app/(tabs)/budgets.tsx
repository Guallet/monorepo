import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@guallet/ui-react-native';

export default function BudgetsScreen() {
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
        Budgets
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
