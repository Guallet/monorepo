import { ResponsiveModal } from "@guallet/ui-react";
import {
  Group,
  Input,
  InputWrapperProps,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from '@/hooks/useDisclosure';
import { IconPickerModal } from "./IconPickerModal";
import { IconSelect } from "@tabler/icons-react";
import { GualletIcon } from "../GualletIcon/GualletIcon";

interface IconPickerProps extends InputWrapperProps {
  value: string | null;
  onValueChanged: (value: string | null) => void;
  name?: string;
}

export function IconPicker({
  value,
  onValueChanged,
  name,
  ...props
}: Readonly<IconPickerProps>) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="Select Icon"
        size="lg"
      >
        <IconPickerModal
          onIconSelected={(icon) => {
            onValueChanged?.(icon ?? null);
            close();
          }}
          onCancel={() => close()}
        />
      </ResponsiveModal>
      <Input.Wrapper {...props}>
        <Input
          name={name}
          component="button"
          pointer
          onClick={open}
          rightSection={
            <ThemeIcon variant="white">
              <IconSelect />
            </ThemeIcon>
          }
        >
          {value && value?.length > 0 ? (
            <Group>
              <ThemeIcon variant="white">
                <GualletIcon iconName={value} />
              </ThemeIcon>
              <Text>{value}</Text>
            </Group>
          ) : (
            <Input.Placeholder>Select icon</Input.Placeholder>
          )}
        </Input>
      </Input.Wrapper>
    </>
  );
}
