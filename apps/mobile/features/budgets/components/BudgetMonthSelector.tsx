import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@guallet/luna-mobile';
import {
  canMoveToNextMonth,
  canMoveToPreviousMonth,
  formatMonth,
  shiftBudgetMonth,
} from '../models';

interface BudgetMonthSelectorProps {
  date: Date;
  onChange: (date: Date) => void;
}

export function BudgetMonthSelector({
  date,
  onChange,
}: Readonly<BudgetMonthSelectorProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const previousDisabled = !canMoveToPreviousMonth(date);
  const nextDisabled = !canMoveToNextMonth(date);

  return (
    <View style={[styles.container, { gap: spacing.sm }]}>
      <Pressable
        accessibilityLabel="Previous month"
        accessibilityRole="button"
        accessibilityState={{ disabled: previousDisabled }}
        disabled={previousDisabled}
        onPress={() => onChange(shiftBudgetMonth(date, -1))}
        style={({ pressed }) => [
          styles.arrow,
          {
            backgroundColor: colors.surface.background.primary,
            borderColor: colors.surface.border.primary,
            borderRadius: borderRadius.md,
            opacity: getArrowOpacity(previousDisabled, pressed),
          },
        ]}
      >
        <Ionicons color={colors.text.primary} name="chevron-back" size={20} />
      </Pressable>

      <View
        style={[
          styles.label,
          {
            backgroundColor: colors.surface.background.primary,
            borderColor: colors.surface.border.primary,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            fontWeight: '600',
          }}
        >
          {formatMonth(date)}
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Next month"
        accessibilityRole="button"
        accessibilityState={{ disabled: nextDisabled }}
        disabled={nextDisabled}
        onPress={() => onChange(shiftBudgetMonth(date, 1))}
        style={({ pressed }) => [
          styles.arrow,
          {
            backgroundColor: colors.surface.background.primary,
            borderColor: colors.surface.border.primary,
            borderRadius: borderRadius.md,
            opacity: getArrowOpacity(nextDisabled, pressed),
          },
        ]}
      >
        <Ionicons
          color={colors.text.primary}
          name="chevron-forward"
          size={20}
        />
      </Pressable>
    </View>
  );
}

function getArrowOpacity(disabled: boolean, pressed: boolean): number {
  if (disabled) return 0.4;
  if (pressed) return 0.65;
  return 1;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  arrow: {
    alignItems: 'center',
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  label: {
    alignItems: 'center',
    borderWidth: 1,
    flex: 1,
  },
});
