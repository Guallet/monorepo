import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { IconCalendar, IconX } from '@tabler/icons-react-native';
import { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme';
import { getPickerInitialDate, isDateWithinBounds } from './dateInputDates';
import { IOSDatePickerModal } from './IOSDatePickerModal';

export interface DateInputProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function DateInput({
  value,
  onChange,
  minDate,
  maxDate,
  label,
  placeholder = 'Select date',
  disabled = false,
  error,
  onFocus,
  onBlur,
  style,
  inputStyle,
  textStyle,
}: Readonly<DateInputProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => new Date());
  const activeRef = useRef(false);
  const hasError = Boolean(error);
  const displayValue = value
    ? new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(value)
    : placeholder;

  function endInteraction() {
    if (!activeRef.current) return;
    activeRef.current = false;
    setActive(false);
    setPickerVisible(false);
    onBlur?.();
  }

  function openPicker() {
    if (disabled || activeRef.current) return;
    if (
      minDate &&
      maxDate &&
      !isDateWithinBounds(minDate, undefined, maxDate)
    ) {
      return;
    }

    const initialDate = getPickerInitialDate(value, minDate, maxDate);
    activeRef.current = true;
    setActive(true);
    onFocus?.();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: 'date',
        minimumDate: minDate,
        maximumDate: maxDate,
        onValueChange: (_event, date) => {
          if (isDateWithinBounds(date, minDate, maxDate)) onChange(date);
          endInteraction();
        },
        onDismiss: endInteraction,
        onError: endInteraction,
      });
      return;
    }

    setPickerDate(initialDate);
    setPickerVisible(true);
  }

  function confirmDate() {
    if (!isDateWithinBounds(pickerDate, minDate, maxDate)) return;
    onChange(pickerDate);
    endInteraction();
  }

  let fieldBackground = colors.surface.background.input;
  let fieldBorder = colors.surface.border.input;
  if (active) fieldBorder = colors.accent.bright;
  if (hasError) {
    fieldBackground = colors.surface.background.error;
    fieldBorder = colors.status.error;
  }
  if (disabled) {
    fieldBackground = colors.surface.background.disabled;
    fieldBorder = colors.surface.border.disabled;
  }
  const fieldText = disabled ? colors.text.disabled : colors.text.primary;

  return (
    <View style={[styles.container, { marginBottom: spacing.md }, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.text.primary,
              fontSize: typography.sizes.md,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.field,
          {
            backgroundColor: fieldBackground,
            borderColor: fieldBorder,
            borderWidth: active ? 2 : 1,
            borderRadius: borderRadius.lg,
            paddingLeft: spacing.md,
            paddingRight: spacing.sm,
          },
          inputStyle,
        ]}
      >
        <Pressable
          style={styles.fieldAction}
          onPress={openPicker}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`${label ?? 'Date'}, ${displayValue}${error ? `, ${error}` : ''}`}
          accessibilityHint="Opens date picker"
          accessibilityState={{ disabled }}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.value,
              {
                color: disabled || value ? fieldText : colors.text.placeholder,
                fontSize: typography.sizes.md,
              },
              textStyle,
            ]}
          >
            {displayValue}
          </Text>
          <IconCalendar
            size={24}
            strokeWidth={1.5}
            color={disabled ? colors.text.disabled : colors.text.secondary}
          />
        </Pressable>
        {value && !disabled && (
          <Pressable
            style={styles.clearAction}
            onPress={() => onChange(null)}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label?.toLowerCase() ?? 'date'}`}
          >
            <IconX size={20} strokeWidth={1.5} color={colors.text.secondary} />
          </Pressable>
        )}
      </View>
      {error && (
        <Text
          style={{
            color: colors.status.error,
            fontSize: typography.sizes.sm,
            marginTop: spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
      {Platform.OS === 'ios' && (
        <IOSDatePickerModal
          visible={pickerVisible}
          value={pickerDate}
          minDate={minDate}
          maxDate={maxDate}
          onValueChange={setPickerDate}
          onCancel={endInteraction}
          onConfirm={confirmDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: { fontWeight: '500' },
  field: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
  },
  fieldAction: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minHeight: 54,
  },
  value: { flex: 1 },
  clearAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
});
