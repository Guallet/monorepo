import { TextInput } from "@mantine/core";
import { IconSearch, IconSquareRoundedXFilled } from "@tabler/icons-react";

interface IProps  extends React.ComponentProps<typeof TextInput>{
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
}: IProps) {
  return (
    <TextInput
      placeholder={placeholder ?? "Search..."}
      label={label}
      description={description}
      radius="xl"
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
