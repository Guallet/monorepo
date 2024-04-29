import { Group, Paper, Text } from "@mantine/core";
import classes from "./Cards.module.css";
import {
  IconCoin,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";

export function TotalBalanceCard() {
  const diff = 34;
  const DiffIcon = diff > 0 ? IconArrowUpRight : IconArrowDownRight;
  return (
    <Paper withBorder p="md" radius="md" key="totalBalance">
      <Group justify="space-between">
        <Text size="xs" c="dimmed" className={classes.title}>
          Total Balance
        </Text>
        <IconCoin className={classes.icon} size="1.4rem" stroke={1.5} />
      </Group>

      <Group align="flex-end" gap="xs" mt={25}>
        <Text className={classes.value}>$1000</Text>
        <Text
          c={diff > 0 ? "teal" : "red"}
          fz="sm"
          fw={500}
          className={classes.diff}
        >
          <span>{diff}%</span>
          <DiffIcon size="1rem" stroke={1.5} />
        </Text>
      </Group>

      <Text fz="xs" c="dimmed" mt={7}>
        Compared to previous month
      </Text>
    </Paper>
  );
}
