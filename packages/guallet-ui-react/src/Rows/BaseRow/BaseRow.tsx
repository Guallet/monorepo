import { Group, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import classes from "./BaseRow.module.css";

interface BaseRowProps
  extends Omit<React.ComponentProps<typeof Group>, "onClick"> {
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  rightSection?: React.ReactNode;
}

export function BaseRow({
  label,
  value,
  onClick,
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
      <Text>{label}</Text>

      <Group justify="end" wrap="nowrap">
        {value}
        {rightSectionContent}
      </Group>
    </Group>
  );
}
