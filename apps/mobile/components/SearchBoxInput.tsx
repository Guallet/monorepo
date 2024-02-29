import { Icon, Spacing } from "@guallet/ui-react-native";
import { View, TextInput } from "react-native";

interface SearchBoxInputProps extends React.ComponentProps<typeof View> {
  label?: string;
  query: string;
  disabled?: boolean;
  description?: string;
  placeholder?: string;
  onSearchQueryChanged?: (newSearchQuery: string) => void;
}

export function SearchBoxInput({
  label,
  query,
  description,
  disabled,
  placeholder,
  onSearchQueryChanged,
}: SearchBoxInputProps) {
  return (
    <View
      style={[
        {
          height: 48,
          borderWidth: 1,
          borderRadius: 20,
          borderColor: disabled ? "grey" : "blue",
          padding: 8,
          flexDirection: "row",
          //   alignContent: "center",
          alignItems: "center",
          //   justifyContent: "center",
        },
        disabled && { backgroundColor: "#F8F8F8" },
      ]}
    >
      <Icon
        name="magnifying-glass"
        size={16}
        style={{
          marginStart: Spacing.small,
          marginEnd: Spacing.small,
        }}
      />
      <TextInput
        readOnly={disabled === true}
        style={{
          flexGrow: 1,
          marginEnd: Spacing.small,
        }}
        numberOfLines={1}
        placeholder={placeholder ?? "Search..."}
        value={query}
        onChangeText={(input) => {
          onSearchQueryChanged?.(input);
        }}
      />
      {query !== "" && (
        <Icon
          name="circle-xmark"
          size={24}
          style={{
            marginEnd: Spacing.small,
          }}
          onPress={() => {
            onSearchQueryChanged?.("");
          }}
        />
      )}
    </View>
  );
}
