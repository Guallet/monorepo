import { View, StyleSheet } from 'react-native';
import { OtpNumberInput } from './OtpNumberInput';
import { useState } from 'react';

interface OtpInputProps extends React.ComponentProps<typeof View> {
  // Define any props you want to pass to the OtpInput component
  onCodeChanged: (value: string) => void;
  length?: number;
}

export function OtpInput({
  onCodeChanged,
  length = 6,
  ...props
}: Readonly<OtpInputProps>) {
  const [code, setCode] = useState(Array.from({ length }, () => ''));

  return (
    <View {...props} style={[styles.codeContainer, props.style]}>
      {Array.from({ length }).map((_, index) => (
        <OtpNumberInput
          key={index}
          value={code[index]}
          onChange={(newValue) => {
            const updatedValue = [...code];
            updatedValue[index] = newValue;
            setCode(updatedValue);
            if (updatedValue.every((val) => val !== '')) {
              onCodeChanged(updatedValue.join(''));
            }
          }}
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
