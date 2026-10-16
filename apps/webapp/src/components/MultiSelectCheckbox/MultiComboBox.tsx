import {
  Input,
  Combobox,
  Group,
  useCombobox,
  Checkbox,
  Button,
  Divider,
} from '@mantine/core';

interface IProps {
  data: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  allItemsSelectedMessage?: string;
}

export function MultiSelectCheckbox({
  data,
  value,
  onChange,
  placeholder,
  emptyMessage,
  allItemsSelectedMessage,
}: IProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleValueSelect = (val: string) =>
    onChange(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val],
    );

  const options = data.map((item) => (
    <Combobox.Option
      value={item.value}
      key={item.value}
      active={value.includes(item.value)}
    >
      <Group gap="sm">
        <Checkbox
          checked={value.includes(item.value)}
          onChange={() => {}}
          aria-hidden
          tabIndex={-1}
          style={{ pointerEvents: 'none' }}
        />
        <span>{item.label}</span>
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
                  ? data.find((item) => item.value === value[0])?.label
                  : `${value.length} accounts selected`
              : emptyMessage
          }
          placeholder={placeholder}
        />
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Group>
          <Button
            variant="transparent"
            onClick={() => onChange(data.map((x) => x.value))}
          >
            Select all
          </Button>
          <Button variant="subtle" onClick={() => onChange([])}>
            Clear all
          </Button>
        </Group>
        <Divider />
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
