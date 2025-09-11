import { useIsMobile } from "@/hooks/useIsMobile";
import {
  Group,
  Input,
  InputWrapperProps,
  Modal,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
  const isMobile = useIsMobile();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal
        opened={opened}
        fullScreen={isMobile}
        onClose={close}
        title="Select Icon"
        centered
        size="lg"
        {...(isMobile && {
          transitionProps: { transition: "fade", duration: 200 },
        })}
      >
        <IconPickerModal
          onIconSelected={(icon) => {
            onValueChanged?.(icon ?? null);
            close();
          }}
          onCancel={() => close()}
        />
      </Modal>
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
