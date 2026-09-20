import { ActionIcon, Button, Group, Stack } from '@mantine/core';
import {
  CategoryIcon,
  selectableCategoryIconNames,
} from '@guallet/luna-ui/icons';

interface IconPickerModalProps {
  onIconSelected: (icon: string | undefined) => void;
  onCancel: () => void;
}

export function IconPickerModal({
  onIconSelected,
  onCancel,
}: Readonly<IconPickerModalProps>) {
  return (
    <Stack>
      <Group wrap="wrap">
        {selectableCategoryIconNames.map((iconName) => (
          <ActionIcon
            key={iconName}
            variant="outline"
            aria-label={iconName}
            size={50}
            onClick={() => onIconSelected(iconName)}
          >
            <CategoryIcon name={iconName} />
          </ActionIcon>
        ))}
      </Group>
      <Button onClick={onCancel}>Cancel</Button>
    </Stack>
  );
}
