import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react-native';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme';
import { compareCalendarDays, sameCalendarDay } from './dateRangePresets';

interface RangeCalendarProps {
  month: Date;
  range: { startDate: Date | null; endDate: Date | null };
  onMonthChange: (month: Date) => void;
  onDatePress: (date: Date) => void;
  style?: StyleProp<ViewStyle>;
}

const weekdayNames = Array.from({ length: 7 }, (_, index) =>
  new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(
    new Date(2023, 0, index + 2),
  ),
);

function calendarDays(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysBeforeMonday = (first.getDay() + 6) % 7;
  return Array.from(
    { length: 42 },
    (_, index) =>
      new Date(
        month.getFullYear(),
        month.getMonth(),
        index + 1 - daysBeforeMonday,
      ),
  );
}

function selectedState(
  date: Date,
  range: { startDate: Date | null; endDate: Date | null },
): 'start' | 'end' | 'inside' | 'single' | null {
  const { startDate, endDate } = range;
  if (!startDate) return null;
  if (sameCalendarDay(date, startDate)) {
    return endDate && !sameCalendarDay(startDate, endDate) ? 'start' : 'single';
  }
  if (endDate && sameCalendarDay(date, endDate)) return 'end';
  if (
    endDate &&
    compareCalendarDays(date, startDate) > 0 &&
    compareCalendarDays(date, endDate) < 0
  ) {
    return 'inside';
  }
  return null;
}

function selectionDescription(state: ReturnType<typeof selectedState>): string {
  switch (state) {
    case 'start':
      return ', start date';
    case 'end':
      return ', end date';
    case 'single':
      return ', selected date';
    case 'inside':
      return ', in selected range';
    default:
      return '';
  }
}

export function RangeCalendar({
  month,
  range,
  onMonthChange,
  onDatePress,
  style,
}: Readonly<RangeCalendarProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(month);
  const fullDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const days = calendarDays(month);

  function moveMonth(offset: number) {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  }

  return (
    <View
      style={[
        styles.container,
        {
          padding: spacing.sm,
          borderColor: colors.surface.border.primary,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            fontWeight: '600',
          }}
        >
          {monthLabel}
        </Text>
        <View style={styles.monthActions}>
          <Pressable
            style={styles.monthAction}
            onPress={() => moveMonth(-1)}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
          >
            <IconChevronLeft size={20} color={colors.accent.primary} />
          </Pressable>
          <Pressable
            style={styles.monthAction}
            onPress={() => moveMonth(1)}
            accessibilityRole="button"
            accessibilityLabel="Next month"
          >
            <IconChevronRight size={20} color={colors.accent.primary} />
          </Pressable>
        </View>
      </View>
      <View style={styles.grid}>
        {weekdayNames.map((name, index) => (
          <Text
            key={`${name}-${index}`}
            style={[
              styles.weekday,
              { color: colors.text.secondary, fontSize: typography.sizes.xs },
            ]}
          >
            {name}
          </Text>
        ))}
        {days.map((date) => {
          const state = selectedState(date, range);
          const isCurrentMonth = date.getMonth() === month.getMonth();
          const isEndpoint =
            state === 'start' || state === 'end' || state === 'single';
          const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          let selectionStyle: ViewStyle = {};
          if (state === 'inside') {
            selectionStyle = {
              backgroundColor: colors.button.secondary.default,
            };
          }
          if (isEndpoint) {
            selectionStyle = {
              backgroundColor: colors.accent.primary,
              borderRadius: borderRadius.xl,
            };
          }
          let textColor = colors.text.primary;
          if (!isCurrentMonth) textColor = colors.text.secondary;
          if (isEndpoint) textColor = colors.text.inverse;
          return (
            <Pressable
              key={dateKey}
              style={[styles.day, selectionStyle]}
              onPress={() => onDatePress(date)}
              accessibilityRole="button"
              accessibilityLabel={`${fullDate.format(date)}${selectionDescription(state)}`}
              accessibilityState={{ selected: Boolean(state) }}
            >
              <Text
                style={{
                  color: textColor,
                  fontSize: typography.sizes.sm,
                  fontWeight: isEndpoint ? '700' : '400',
                }}
              >
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  monthActions: { flexDirection: 'row' },
  monthAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.2857%', textAlign: 'center', paddingVertical: 8 },
  day: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '14.2857%',
    height: 44,
  },
});
