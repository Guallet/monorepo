import {
  IconCalendar,
  IconChevronDown,
  IconChevronLeft,
} from '@tabler/icons-react-native';
import { useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme';
import {
  useDateRangeSheet,
  type DateRangeSheetRenderer,
} from './DateRangeSheetProvider';
import { RangeCalendar } from './RangeCalendar';
import {
  compareCalendarDays,
  DEFAULT_DATE_RANGE_PRESETS,
  endOfDay,
  matchingPreset,
  selectDraftDate,
  startOfDay,
  type DateRange,
  type DateRangePreset,
  type DraftDateRange,
} from './dateRangePresets';

export interface DateRangePickerProps {
  value: DateRange | null;
  onApply: (range: DateRange) => void;
  presets?: DateRangePreset[];
  onCancel?: () => void;
  style?: StyleProp<ViewStyle>;
  bottomSheetStyle?: StyleProp<ViewStyle>;
  calendarStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

type Endpoint = 'from' | 'to';

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function rangeLabel(
  value: DateRange | null,
  presets: DateRangePreset[],
): string {
  if (!value) return 'Select range';
  const preset = matchingPreset(value, presets, new Date());
  if (preset) return preset.label;
  return `${formatDate(value.startDate)} – ${formatDate(value.endDate)}`;
}

/** A Monzo-style range control. The host app supplies its native sheet via DateRangeSheetProvider. */
export function DateRangePicker({
  value,
  onApply,
  presets = DEFAULT_DATE_RANGE_PRESETS,
  onCancel,
  style,
  bottomSheetStyle,
  calendarStyle,
  textStyle,
}: Readonly<DateRangePickerProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const renderSheet = useDateRangeSheet();
  const openRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<DraftDateRange>({
    startDate: value?.startDate ?? null,
    endDate: value?.endDate ?? null,
  });
  const [activeEndpoint, setActiveEndpoint] = useState<Endpoint | null>(null);
  const [month, setMonth] = useState(
    () => new Date(value?.startDate ?? new Date()),
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const quickIds = ['today', 'last-7-days', 'last-30-days', 'month-to-date'];
  const quickPresets = quickIds
    .map((id) => presets.find((preset) => preset.id === id))
    .filter((preset): preset is DateRangePreset => Boolean(preset));
  const displayedQuickPresets = quickPresets.length
    ? quickPresets
    : presets.slice(0, 4);
  const canApply = Boolean(
    draft.startDate &&
    draft.endDate &&
    compareCalendarDays(draft.startDate, draft.endDate) <= 0,
  );

  function open() {
    if (!renderSheet) {
      throw new Error('DateRangePicker requires DateRangeSheetProvider.');
    }
    const today = new Date();
    setDraft({
      startDate: value?.startDate ?? null,
      endDate: value?.endDate ?? null,
    });
    setSelectedPresetId(matchingPreset(value, presets, today)?.id ?? null);
    setMonth(
      new Date(
        (value?.startDate ?? today).getFullYear(),
        (value?.startDate ?? today).getMonth(),
        1,
      ),
    );
    setActiveEndpoint(null);
    setShowAll(false);
    openRef.current = true;
    setVisible(true);
  }

  function cancel() {
    if (!openRef.current) return;
    openRef.current = false;
    setVisible(false);
    onCancel?.();
  }

  function apply() {
    if (!draft.startDate || !draft.endDate || !canApply) return;
    openRef.current = false;
    setVisible(false);
    onApply({
      startDate: startOfDay(draft.startDate),
      endDate: endOfDay(draft.endDate),
    });
  }

  function choosePreset(preset: DateRangePreset) {
    const next = preset.getRange(new Date());
    if (!next) {
      const date = draft.startDate ?? new Date();
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      setActiveEndpoint('from');
      setSelectedPresetId(null);
      setShowAll(false);
      return;
    }
    setDraft(next);
    setSelectedPresetId(preset.id);
    setActiveEndpoint(null);
    setMonth(
      new Date(next.startDate.getFullYear(), next.startDate.getMonth(), 1),
    );
    setShowAll(false);
  }

  function chooseDate(date: Date) {
    if (!activeEndpoint) return;
    setDraft((current) => selectDraftDate(current, activeEndpoint, date));
    if (
      date.getMonth() !== month.getMonth() ||
      date.getFullYear() !== month.getFullYear()
    ) {
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setSelectedPresetId(null);
  }

  function toggleEndpoint(endpoint: Endpoint) {
    const date =
      endpoint === 'from'
        ? draft.startDate
        : (draft.endDate ?? draft.startDate);
    setMonth(
      new Date(
        (date ?? new Date()).getFullYear(),
        (date ?? new Date()).getMonth(),
        1,
      ),
    );
    setActiveEndpoint((current) => (current === endpoint ? null : endpoint));
  }

  const triggerLabel = rangeLabel(value, presets);

  return (
    <>
      <Pressable
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface.background.input,
            borderColor: colors.surface.border.input,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
          },
          style,
        ]}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`Date range, ${triggerLabel}`}
        accessibilityHint="Opens date range picker"
      >
        <IconCalendar
          size={24}
          strokeWidth={1.5}
          color={colors.accent.primary}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            {
              color: value ? colors.text.primary : colors.text.placeholder,
              fontSize: typography.sizes.md,
            },
            textStyle,
          ]}
        >
          {triggerLabel}
        </Text>
        <IconChevronDown
          size={20}
          strokeWidth={1.5}
          color={colors.accent.primary}
        />
      </Pressable>
      {renderSheet && (
        <DateRangeSheetFrame
          renderSheet={renderSheet}
          visible={visible}
          onDismiss={cancel}
        >
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.surface.background.page },
              bottomSheetStyle,
            ]}
          >
            <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
              <Pressable
                style={styles.back}
                onPress={cancel}
                accessibilityRole="button"
                accessibilityLabel="Cancel date range selection"
              >
                <IconChevronLeft size={24} color={colors.accent.primary} />
              </Pressable>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.sizes.lg,
                  fontWeight: '600',
                }}
              >
                Date range
              </Text>
              <View style={styles.back} />
            </View>
            <ScrollView
              style={styles.content}
              contentContainerStyle={{ padding: spacing.md }}
            >
              <View
                style={{
                  backgroundColor: colors.surface.background.primary,
                  borderColor: colors.surface.border.input,
                  borderWidth: 1,
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                }}
              >
                <EndpointRow
                  label="From"
                  value={draft.startDate}
                  active={activeEndpoint === 'from'}
                  onPress={() => toggleEndpoint('from')}
                />
                {activeEndpoint === 'from' && (
                  <RangeCalendar
                    month={month}
                    range={draft}
                    onMonthChange={setMonth}
                    onDatePress={chooseDate}
                    style={calendarStyle}
                  />
                )}
                <EndpointRow
                  label="To"
                  value={draft.endDate}
                  active={activeEndpoint === 'to'}
                  onPress={() => toggleEndpoint('to')}
                />
                {activeEndpoint === 'to' && (
                  <RangeCalendar
                    month={month}
                    range={draft}
                    onMonthChange={setMonth}
                    onDatePress={chooseDate}
                    style={calendarStyle}
                  />
                )}
              </View>
              <View style={[styles.railHeader, { marginTop: spacing.md }]}>
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.sizes.sm,
                  }}
                >
                  Quick ranges
                </Text>
                <Pressable
                  onPress={() => setShowAll((current) => !current)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showAll ? 'Hide all presets' : 'See all presets'
                  }
                >
                  <Text
                    style={{
                      color: colors.accent.primary,
                      fontSize: typography.sizes.sm,
                    }}
                  >
                    {showAll ? 'Hide all' : 'See all'}
                  </Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: spacing.sm,
                  paddingVertical: spacing.sm,
                }}
              >
                {displayedQuickPresets.map((preset) => (
                  <PresetChip
                    key={preset.id}
                    preset={preset}
                    selected={selectedPresetId === preset.id}
                    onPress={() => choosePreset(preset)}
                  />
                ))}
              </ScrollView>
              {showAll && (
                <View
                  style={[
                    styles.allPresets,
                    {
                      backgroundColor: colors.surface.background.primary,
                      borderColor: colors.surface.border.input,
                      borderRadius: borderRadius.lg,
                      marginTop: spacing.sm,
                    },
                  ]}
                >
                  {presets.map((preset) => (
                    <Pressable
                      key={preset.id}
                      style={[
                        styles.presetRow,
                        {
                          borderBottomColor: colors.surface.border.primary,
                          paddingHorizontal: spacing.md,
                        },
                      ]}
                      onPress={() => choosePreset(preset)}
                      accessibilityRole="button"
                      accessibilityLabel={preset.label}
                      accessibilityState={{
                        selected: selectedPresetId === preset.id,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            selectedPresetId === preset.id
                              ? colors.accent.primary
                              : colors.text.primary,
                          fontSize: typography.sizes.sm,
                        }}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
            <View
              style={[
                styles.footer,
                {
                  paddingHorizontal: spacing.md,
                  paddingTop: spacing.sm,
                  paddingBottom: spacing.xl,
                  borderTopColor: colors.surface.border.primary,
                },
              ]}
            >
              <Pressable
                style={[
                  styles.done,
                  {
                    backgroundColor: canApply
                      ? colors.button.primary.default
                      : colors.button.primary.disabled,
                    borderRadius: borderRadius.xl,
                  },
                ]}
                onPress={apply}
                disabled={!canApply}
                accessibilityRole="button"
                accessibilityLabel="Done"
                accessibilityState={{ disabled: !canApply }}
              >
                <Text
                  style={{
                    color: canApply
                      ? colors.text.inverse
                      : colors.text.disabled,
                    fontSize: typography.sizes.md,
                    fontWeight: '600',
                  }}
                >
                  Done
                </Text>
              </Pressable>
            </View>
          </View>
        </DateRangeSheetFrame>
      )}
    </>
  );
}

function DateRangeSheetFrame({
  renderSheet,
  visible,
  onDismiss,
  children,
}: Readonly<{
  renderSheet: DateRangeSheetRenderer;
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}>) {
  return renderSheet({ visible, onDismiss, children });
}

function EndpointRow({
  label,
  value,
  active,
  onPress,
}: Readonly<{
  label: string;
  value: Date | null;
  active: boolean;
  onPress: () => void;
}>) {
  const { colors, spacing, typography } = useTheme();
  const display = value ? formatDate(value) : 'Not selected';
  return (
    <Pressable
      style={[
        styles.endpoint,
        {
          backgroundColor: active
            ? colors.surface.background.input
            : colors.surface.background.primary,
          paddingHorizontal: spacing.md,
          borderBottomColor: colors.surface.border.primary,
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${display}`}
      accessibilityState={{ expanded: active }}
    >
      <Text
        style={{ color: colors.text.primary, fontSize: typography.sizes.md }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: value ? colors.accent.primary : colors.text.placeholder,
          fontSize: typography.sizes.sm,
        }}
      >
        {display}
      </Text>
    </Pressable>
  );
}

function PresetChip({
  preset,
  selected,
  onPress,
}: Readonly<{
  preset: DateRangePreset;
  selected: boolean;
  onPress: () => void;
}>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  return (
    <Pressable
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? colors.button.secondary.default
            : colors.surface.background.primary,
          borderColor: selected
            ? colors.accent.primary
            : colors.surface.border.input,
          borderRadius: borderRadius.xl,
          paddingHorizontal: spacing.md,
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={preset.label}
      accessibilityState={{ selected }}
    >
      <Text
        style={{
          color: selected ? colors.accent.primary : colors.text.secondary,
          fontSize: typography.sizes.sm,
          fontWeight: selected ? '600' : '400',
        }}
      >
        {preset.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
  },
  triggerText: { flex: 1 },
  sheet: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  back: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  content: { flex: 1 },
  endpoint: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
  },
  railHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  allPresets: { borderWidth: 1, overflow: 'hidden' },
  presetRow: { borderBottomWidth: 1, justifyContent: 'center', minHeight: 46 },
  footer: { borderTopWidth: 1 },
  done: { alignItems: 'center', justifyContent: 'center', minHeight: 50 },
});
