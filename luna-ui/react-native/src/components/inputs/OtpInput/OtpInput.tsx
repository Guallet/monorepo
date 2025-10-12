import { View, StyleSheet, TextInput } from "react-native";
import { OtpNumberInput } from "./OtpNumberInput";
import { useRef, useState } from "react";

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
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <View {...props} style={[styles.codeContainer, props.style]}>
      {Array.from({ length }).map((_, index) => (
        <OtpNumberInput
          key={index}
          value={code[index]}
          onChange={(newValue) => {
            const updatedValue = [...code];
            updatedValue[index] = newValue;
            // TODO: Move the focus to the next input if a digit is entered
            // call onCodeChanged with the updated value only if all inputs are filled
            if (updatedValue.every((val) => val !== "")) {
              onCodeChanged(updatedValue.join(""));
            }
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
