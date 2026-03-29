import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { OtpNumberInput } from './OtpNumberInput';

interface OtpInputProps extends React.ComponentProps<typeof View> {
  onCodeChanged: (value: string) => void;
  length?: number;
}

export function OtpInput({
  onCodeChanged,
  length = 6,
  ...props
}: Readonly<OtpInputProps>) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [code, setCode] = useState<string[]>(() => new Array(length).fill(''));

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((val) => val !== '')) {
      onCodeChanged(newCode.join(''));
    }
  };

  return (
    <View {...props} style={[styles.codeContainer, props.style]}>
      {Array.from({ length }).map((_, index) => (
        <OtpNumberInput
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          value={code[index] ?? ''}
          onChange={(newValue) => handleCodeChange(newValue, index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
