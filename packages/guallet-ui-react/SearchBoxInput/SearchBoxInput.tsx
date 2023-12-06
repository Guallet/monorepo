import { TextInput } from "@mantine/core";
import { IconSearch, IconSquareRoundedXFilled } from "@tabler/icons-react";
import { useState } from "react";

interface IProps {
  label?: string;
  description?: string;
  placeholder?: string;
  onSearchQueryChanged?: (newSearchQuery: string) => void;
}

export function SearchBoxInput({
  label,
  description,
  placeholder,
  onSearchQueryChanged,
}: IProps) {
  const [query, setSearchQuery] = useState("");

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
              setSearchQuery("");
              onSearchQueryChanged?.("");
            }}
          />
        )
      }
      value={query}
      onChange={(event) => {
        const query = event.currentTarget.value;
        setSearchQuery(query);
        onSearchQueryChanged?.(query);
      }}
    />
  );
}
