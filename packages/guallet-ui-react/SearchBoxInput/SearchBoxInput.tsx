import { TextInput } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconSearch, IconSquareRoundedXFilled } from "@tabler/icons-react";
import { useEffect } from "react";

interface SearchBoxInputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  query: string;
  description?: string;
  placeholder?: string;
  debounceWait?: number;
  onSearchQueryChanged?: (newSearchQuery: string) => void;
}

export function SearchBoxInput({
  label,
  query,
  description,
  placeholder,
  onSearchQueryChanged,
  debounceWait = 200,
  ...props
}: Readonly<SearchBoxInputProps>) {
  const [filterValue, setFilterValue] = useDebouncedState(query, debounceWait);

  useEffect(() => {
    onSearchQueryChanged?.(filterValue);
  }, [filterValue]);

  return (
    <TextInput
      placeholder={placeholder ?? "Search..."}
      label={label}
      description={description}
      leftSection={<IconSearch />}
      rightSection={
        filterValue !== "" && (
          <IconSquareRoundedXFilled
            onClick={() => {
              setFilterValue("");
            }}
          />
        )
      }
      defaultValue={query}
      onChange={(event) => {
        const input = event.currentTarget.value;
        setFilterValue(input);
      }}
      {...props}
    />
  );
}
