import { Group, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import classes from "./BaseRow.module.css";

interface BaseRowProps
  extends Omit<React.ComponentProps<typeof Group>, "onClick"> {
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
}

export function BaseRow({
  label,
  value,
  onClick,
  leftSection,
  rightSection,
}: Readonly<BaseRowProps>) {
  const rightSectionContent =
    rightSection || (onClick !== null ? <IconChevronRight /> : null);
  return (
    <Group
      p="md"
      justify="space-between"
      wrap="nowrap"
      {...(onClick && {
        onClick: () => onClick(),
        style: { cursor: "pointer" },
        className: classes.baseRow,
      })}
    >
      <Group>
        {leftSection}
        <Text>{label}</Text>
      </Group>

      <Group justify="end" wrap="nowrap">
        {value}
        {rightSectionContent}
      </Group>
    </Group>
  );
}
