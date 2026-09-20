import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';

interface OtpNumberInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function OtpNumberInput({
  value,
  onChange,
}: Readonly<OtpNumberInputProps>) {
  const { colors, borderRadius, typography } = useTheme();

  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      keyboardType="numeric"
      maxLength={1}
      textAlign="center"
      style={[
        styles.codeInput,
        {
          backgroundColor: colors.surface.background.input,
          borderColor: colors.surface.border.input,
          borderRadius: borderRadius.lg,
          color: colors.text.primary,
          fontSize: typography.sizes.xl,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  codeInput: {
    width: 48,
    height: 56,
    fontWeight: '600',
    borderWidth: 1,
  },
});
