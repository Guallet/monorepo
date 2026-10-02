import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../icons';
import { useTheme } from '../../../theme';
import { useDateRangeSheet } from '../DateRangePicker/DateRangeSheetProvider';
import {
  adjacentMonth,
  isMonthInBounds,
  yearHasSelectableMonth,
} from './monthDates';

export interface MonthSelectorProps {
  value: Date;
  onChange: (month: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  bottomSheetStyle?: StyleProp<ViewStyle>;
}

const MONTHS = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat(undefined, { month: 'short' }).format(
    new Date(2024, month, 1),
  ),
);

/** A controlled month selector. The host app supplies its native bottom sheet. */
export function MonthSelector({
  value,
  onChange,
  minDate,
  maxDate,
  style,
  buttonStyle,
  textStyle,
  bottomSheetStyle,
}: Readonly<MonthSelectorProps>) {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const renderSheet = useDateRangeSheet();
  if (!renderSheet) {
    throw new Error('MonthSelector requires DateRangeSheetProvider.');
  }
  const [visible, setVisible] = useState(false);
  const [displayYear, setDisplayYear] = useState(value.getFullYear());
  const label = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(value);
  const previousMonth = adjacentMonth(value, -1);
  const nextMonth = adjacentMonth(value, 1);
  const previousDisabled = !isMonthInBounds(previousMonth, minDate, maxDate);
  const nextDisabled = !isMonthInBounds(nextMonth, minDate, maxDate);

  function open() {
    setDisplayYear(value.getFullYear());
    setVisible(true);
  }

  function choose(month: number) {
    const selected = new Date(displayYear, month, 1);
    if (!isMonthInBounds(selected, minDate, maxDate)) return;
    setVisible(false);
    onChange(selected);
  }

  function move(offset: number) {
    const selected = adjacentMonth(value, offset);
    if (isMonthInBounds(selected, minDate, maxDate)) onChange(selected);
  }

  const sheet = renderSheet({
    visible,
    onDismiss: () => setVisible(false),
    children: (
      <View
        style={[
          {
            backgroundColor: colors.surface.background.primary,
            padding: spacing.md,
            gap: spacing.lg,
          },
          bottomSheetStyle,
        ]}
      >
        <View style={styles.sheetHeader}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '600',
            }}
          >
            Select month
          </Text>
          <Pressable
            onPress={() => setVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close month picker"
            style={styles.close}
          >
            <Text
              style={{
                color: colors.accent.primary,
                fontSize: typography.sizes.sm,
              }}
            >
              Close
            </Text>
          </Pressable>
        </View>
        <View style={styles.yearRow}>
          <Pressable
            onPress={() => setDisplayYear((year) => year - 1)}
            disabled={
              !yearHasSelectableMonth(displayYear - 1, minDate, maxDate)
            }
            accessibilityRole="button"
            accessibilityLabel="Previous year"
            accessibilityState={{
              disabled: !yearHasSelectableMonth(
                displayYear - 1,
                minDate,
                maxDate,
              ),
            }}
            style={styles.yearButton}
          >
            <ChevronLeftIcon
              size={24}
              color={
                yearHasSelectableMonth(displayYear - 1, minDate, maxDate)
                  ? colors.accent.primary
                  : colors.text.disabled
              }
            />
          </Pressable>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.md,
              fontWeight: '600',
            }}
          >
            {displayYear}
          </Text>
          <Pressable
            onPress={() => setDisplayYear((year) => year + 1)}
            disabled={
              !yearHasSelectableMonth(displayYear + 1, minDate, maxDate)
            }
            accessibilityRole="button"
            accessibilityLabel="Next year"
            accessibilityState={{
              disabled: !yearHasSelectableMonth(
                displayYear + 1,
                minDate,
                maxDate,
              ),
            }}
            style={styles.yearButton}
          >
            <ChevronRightIcon
              size={24}
              color={
                yearHasSelectableMonth(displayYear + 1, minDate, maxDate)
                  ? colors.accent.primary
                  : colors.text.disabled
              }
            />
          </Pressable>
        </View>
        <View style={[styles.monthGrid, { gap: spacing.sm }]}>
          {MONTHS.map((monthLabel, month) => {
            const date = new Date(displayYear, month, 1);
            const disabled = !isMonthInBounds(date, minDate, maxDate);
            const selected =
              displayYear === value.getFullYear() && month === value.getMonth();
            return (
              <Pressable
                key={month}
                onPress={() => choose(month)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={new Intl.DateTimeFormat(undefined, {
                  month: 'long',
                  year: 'numeric',
                }).format(date)}
                accessibilityState={{ disabled, selected }}
                style={[
                  styles.monthButton,
                  {
                    backgroundColor: selected
                      ? colors.button.primary.default
                      : colors.surface.background.secondary,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <Text
                  style={{
                    color: disabled
                      ? colors.text.disabled
                      : selected
                        ? colors.text.inverse
                        : colors.text.primary,
                    fontSize: typography.sizes.sm,
                    fontWeight: selected ? '600' : '400',
                  }}
                >
                  {monthLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    ),
  });

  return (
    <>
      <View style={[styles.row, { gap: spacing.sm }, style]}>
        <Pressable
          onPress={() => move(-1)}
          disabled={previousDisabled}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          accessibilityState={{ disabled: previousDisabled }}
          style={[
            styles.arrow,
            {
              borderColor: colors.button.outline.default,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface.background.primary,
            },
            buttonStyle,
          ]}
        >
          <ChevronLeftIcon
            size={24}
            color={
              previousDisabled ? colors.text.disabled : colors.accent.primary
            }
          />
        </Pressable>
        <Pressable
          onPress={open}
          accessibilityRole="button"
          accessibilityLabel={`Select month, ${label}`}
          accessibilityHint="Opens month and year picker"
          accessibilityState={{ expanded: visible }}
          style={[
            styles.labelButton,
            {
              borderColor: colors.button.outline.default,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface.background.primary,
              gap: spacing.xs,
              paddingHorizontal: spacing.sm,
            },
            buttonStyle,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              { color: colors.text.primary, fontSize: typography.sizes.md },
              textStyle,
            ]}
          >
            {label}
          </Text>
          <ChevronDownIcon size={20} color={colors.accent.primary} />
        </Pressable>
        <Pressable
          onPress={() => move(1)}
          disabled={nextDisabled}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          accessibilityState={{ disabled: nextDisabled }}
          style={[
            styles.arrow,
            {
              borderColor: colors.button.outline.default,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface.background.primary,
            },
            buttonStyle,
          ]}
        >
          <ChevronRightIcon
            size={24}
            color={nextDisabled ? colors.text.disabled : colors.accent.primary}
          />
        </Pressable>
      </View>
      {sheet}
    </>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row' },
  arrow: {
    alignItems: 'center',
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  labelButton: {
    alignItems: 'center',
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 44,
  },
  label: { flexShrink: 1, fontWeight: '600' },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  close: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  yearRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,
  },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '31%',
  },
});
