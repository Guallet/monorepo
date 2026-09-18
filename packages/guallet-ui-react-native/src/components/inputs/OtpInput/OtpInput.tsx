import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRef, useState } from 'react';
import { useTheme } from '../../../theme';

interface OtpInputProps extends React.ComponentProps<typeof View> {
  onCodeChanged: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  hasError?: boolean;
  value?: string;
}

export function OtpInput({
  onCodeChanged,
  length = 6,
  autoFocus = false,
  hasError = false,
  value,
  ...props
}: Readonly<OtpInputProps>) {
  const { borderRadius, colors, typography } = useTheme();
  const [internalCode, setInternalCode] = useState('');
  const inputRef = useRef<TextInput>(null);
  const code = value ?? internalCode;

  const handleChange = (input: string) => {
    const nextCode = input.replace(/\D/g, '').slice(0, length);
    if (value === undefined) {
      setInternalCode(nextCode);
    }
    onCodeChanged(nextCode);
  };

  return (
    <Pressable
      {...props}
      accessibilityRole="none"
      onPress={() => inputRef.current?.focus()}
      style={[styles.codeContainer, props.style]}
    >
      <View accessible={false} style={styles.codeRow}>
        {Array.from({ length }).map((_, index) => {
          const isActive =
            code.length === index ||
            (code.length === length && index === length - 1);

          return (
            <View
              key={index}
              style={[
                styles.codeInput,
                {
                  backgroundColor: colors.surface.background.input,
                  borderColor: hasError
                    ? colors.status.error
                    : isActive
                      ? colors.accent.primary
                      : colors.surface.border.input,
                  borderRadius: borderRadius.lg,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.sizes.xl,
                  fontWeight: '600',
                }}
              >
                {code[index] ?? ''}
              </Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        accessibilityLabel={`${length}-digit verification code`}
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        caretHidden
        contextMenuHidden={false}
        keyboardType="number-pad"
        maxLength={length}
        onChangeText={handleChange}
        style={styles.hiddenInput}
        textContentType="oneTimeCode"
        value={code}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  codeContainer: {
    position: 'relative',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  codeInput: {
    alignItems: 'center',
    aspectRatio: 0.86,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    maxWidth: 56,
    minWidth: 40,
  },
  hiddenInput: {
    bottom: 0,
    left: 0,
    opacity: 0.01,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
