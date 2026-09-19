import { ActionIcon, Button, Group, Stack } from '@mantine/core';
import { GualletIcon } from '../GualletIcon/GualletIcon';
import { selectableGualletIconNames } from '../GualletIcon/gualletIconRegistry';

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
        {selectableGualletIconNames.map((iconName) => (
          <ActionIcon
            key={iconName}
            variant="outline"
            aria-label={iconName}
            size={50}
            onClick={() => onIconSelected(iconName)}
          >
            <GualletIcon iconName={iconName} />
          </ActionIcon>
        ))}
      </Group>
      <Button onClick={onCancel}>Cancel</Button>
    </Stack>
  );
}
