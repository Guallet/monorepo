import { TextInput } from "@mantine/core";
import { IconSearch, IconSquareRoundedXFilled } from "@tabler/icons-react";

interface SearchBoxInputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  query: string;
  description?: string;
  placeholder?: string;
  onSearchQueryChanged?: (newSearchQuery: string) => void;
}

export function SearchBoxInput({
  label,
  query,
  description,
  placeholder,
  onSearchQueryChanged,
  ...props
}: Readonly<SearchBoxInputProps>) {
  return (
    <TextInput
      placeholder={placeholder ?? "Search..."}
      label={label}
      description={description}
      leftSection={<IconSearch />}
      rightSection={
        query !== "" && (
          <IconSquareRoundedXFilled
            onClick={() => {
              onSearchQueryChanged?.("");
            }}
          />
        )
      }
      value={query}
      onChange={(event) => {
        const input = event.currentTarget.value;
        onSearchQueryChanged?.(input);
      }}
      {...props}
    />
  );
}
