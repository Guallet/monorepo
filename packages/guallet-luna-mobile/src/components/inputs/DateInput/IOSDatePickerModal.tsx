import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemeMode } from '../../../theme';

interface IOSDatePickerModalProps {
  visible: boolean;
  value: Date;
  minDate?: Date;
  maxDate?: Date;
  onValueChange: (date: Date) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function IOSDatePickerModal({
  visible,
  value,
  minDate,
  maxDate,
  onValueChange,
  onCancel,
  onConfirm,
}: Readonly<IOSDatePickerModalProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const themeMode = useThemeMode();

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View
        style={[
          styles.backdrop,
          { backgroundColor: colors.surface.overlay, padding: spacing.md },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityLabel="Cancel date selection"
        />
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface.background.primary,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
            },
          ]}
        >
          <View style={styles.header}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.lg,
                fontWeight: '700',
              }}
            >
              Select date
            </Text>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel date selection"
            >
              <Text
                style={{
                  color: colors.accent.primary,
                  fontSize: typography.sizes.md,
                  fontWeight: '600',
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={value}
            mode="date"
            display="spinner"
            minimumDate={minDate}
            maximumDate={maxDate}
            themeVariant={themeMode}
            onValueChange={(_event, date) => onValueChange(date)}
            style={styles.picker}
          />
          <Pressable
            onPress={onConfirm}
            accessibilityRole="button"
            style={[
              styles.confirmButton,
              {
                backgroundColor: colors.button.primary.default,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text
              style={{
                color: colors.button.onPrimary.default,
                fontSize: typography.sizes.md,
                fontWeight: '600',
              }}
            >
              Done
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  card: { width: '100%', maxWidth: 400 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: { height: 200, width: '100%' },
  confirmButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
