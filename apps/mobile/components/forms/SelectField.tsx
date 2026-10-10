import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Button, useTheme } from '@guallet/luna-mobile';
import { useFieldContext } from './formContext';
import { fieldError } from './fieldError';

type PickerProps = {
  open: boolean;
  value: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

type SelectFieldProps = Readonly<{
  label: string;
  placeholder: string;
  formatValue: (value: string) => string;
  renderPicker: (props: PickerProps) => ReactNode;
  disabled?: boolean;
  onOpen?: () => void;
}>;

/** A string picker that keeps its selected value and errors in TanStack Form. */
export function SelectField({
  label,
  placeholder,
  formatValue,
  renderPicker,
  disabled = false,
  onOpen,
}: SelectFieldProps) {
  const field = useFieldContext<string>();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const error = fieldError(field.state.meta.errors);
  const valueLabel = field.state.value
    ? formatValue(field.state.value)
    : placeholder;

  function select(value: string) {
    field.handleChange(value);
    field.handleBlur();
  }

  return (
    <View style={{ gap: 6 }}>
      <Button
        variant="outline"
        accessibilityLabel={`${label}: ${valueLabel}`}
        accessibilityHint={error}
        disabled={disabled}
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
      >
        {valueLabel}
      </Button>
      {error && (
        <Text accessibilityRole="alert" style={{ color: colors.status.error }}>
          {error}
        </Text>
      )}
      {renderPicker({
        open,
        value: field.state.value,
        onClose: () => setOpen(false),
        onSelect: select,
      })}
    </View>
  );
}
