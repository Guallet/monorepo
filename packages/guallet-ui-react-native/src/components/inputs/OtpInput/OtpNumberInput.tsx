import { TextInput, StyleSheet } from "react-native";

interface OtpNumberInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function OtpNumberInput({
  value,
  onChange,
}: Readonly<OtpNumberInputProps>) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      keyboardType="numeric"
      maxLength={1}
      textAlign="center"
      style={styles.codeInput}
    />
  );
}

const styles = StyleSheet.create({
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
});
