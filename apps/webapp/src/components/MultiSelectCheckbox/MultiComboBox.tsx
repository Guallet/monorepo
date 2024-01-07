import { useState } from "react";
import {
  Input,
  Combobox,
  Group,
  useCombobox,
  Checkbox,
  Button,
  Divider,
} from "@mantine/core";

interface IProps {
  data: string[];
  placeholder?: string;
  emptyMessage?: string;
  allItemsSelectedMessage?: string;
}

export function MultiSelectCheckbox({
  data,
  placeholder,
  emptyMessage,
  allItemsSelectedMessage,
}: IProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [value, setValue] = useState<string[]>([]);

  const handleValueSelect = (val: string) =>
    setValue((current) =>
      current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val]
    );

  const options = data.map((item) => (
    <Combobox.Option value={item} key={item} active={value.includes(item)}>
      <Group gap="sm">
        <Checkbox
          checked={value.includes(item)}
          onChange={() => {}}
          aria-hidden
          tabIndex={-1}
          style={{ pointerEvents: "none" }}
        />
        <span>{item}</span>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
    >
      <Combobox.DropdownTarget>
        <Input
          onClick={() => combobox.toggleDropdown()}
          value={
            value.length > 0
              ? value.length === data.length
                ? allItemsSelectedMessage
                : value.length === 1
                ? value[0] // The item value
                : `${value.length} accounts selected`
              : emptyMessage
          }
          placeholder={placeholder}
        />
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Group>
          <Button variant="transparent">Select all</Button>
          <Button variant="subtle">Clear all</Button>
        </Group>
        <Divider />
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
