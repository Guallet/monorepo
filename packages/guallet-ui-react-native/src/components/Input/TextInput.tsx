import { TextInput as RNTextInput, View, Text } from "react-native";

interface TextInputProps extends React.ComponentProps<typeof RNTextInput> {
  label?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  // style?: React.ComponentProps<typeof View>["style"];
}

export function TextInput({
  label,
  description,
  error,
  disabled,
  style,
  required,
  ...props
}: TextInputProps) {
  return (
    <View style={style}>
      {label && (
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <Text>{label}</Text>
          {required && <Text style={{ color: "red" }}>*</Text>}
        </View>
      )}
      {description && <Text>{description}</Text>}
      <View
        style={[
          {
            height: 48,
            borderWidth: 1,
            borderColor: error ? "red" : disabled ? "grey" : "blue",
            padding: 8,
            backgroundColor: "white",
          },
          disabled && { backgroundColor: "#F8F8F8" },
        ]}
      >
        <RNTextInput
          readOnly={disabled === true}
          style={[
            { flex: 1, color: error ? "red" : "black" },
            disabled && { color: "black" },
          ]}
          placeholderTextColor={error ? "red" : disabled ? "black" : "grey"}
          {...props}
        />
      </View>
      {error && (
        <Text
          style={{
            color: "red",
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
