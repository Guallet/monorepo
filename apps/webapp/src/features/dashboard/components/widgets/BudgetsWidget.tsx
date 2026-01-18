import { useBudgets } from "@guallet/api-react";
import { WidgetCard } from "./WidgetCard";
import { Loader, Stack, Text, Progress, Group, Box, useMantineTheme, Center } from "@mantine/core";
import { IconTargetArrow } from "@tabler/icons-react";

export function BudgetsWidget() {
  const { budgets, isLoading } = useBudgets();
  const theme = useMantineTheme();

  return (
    <WidgetCard title="Budgets" icon={<IconTargetArrow size={20} />}>
      {isLoading ? (
        <Center h={100}>
          <Loader size="md" />
        </Center>
      ) : (
        <Stack gap="md">
          {budgets && budgets.length > 0 ? (
            budgets.map((budget) => {
              const spent = Number(budget.spent ?? 0);
              const total = Number(budget.amount ?? 0);
              const remaining = total - spent;
              const percent =
                total > 0 ? Math.min((spent / total) * 100, 100) : 0;
              const isOverBudget = percent > 100;
              const isNearLimit = percent > 90 && !isOverBudget;
              
              return (
                <Box 
                  key={budget.id}
                  p="sm"
                  style={{
                    borderRadius: theme.radius.md,
                    backgroundColor: isOverBudget 
                      ? theme.colors.red[0] 
                      : isNearLimit 
                      ? theme.colors.yellow[0] 
                      : theme.colors.gray[0],
                    border: `1px solid ${
                      isOverBudget 
                        ? theme.colors.red[2] 
                        : isNearLimit 
                        ? theme.colors.yellow[2] 
                        : theme.colors.gray[2]
                    }`,
                  }}
                >
                  <Group justify="space-between" mb="xs">
                    <Text fw={600} size="sm">{budget.name}</Text>
                    <Text size="sm" c={isOverBudget ? "red" : isNearLimit ? "yellow" : "dimmed"} fw={500}>
                      {spent.toFixed(0)} / {total.toFixed(0)}
                    </Text>
                  </Group>
                  <Progress 
                    value={percent} 
                    color={isOverBudget ? "red" : isNearLimit ? "yellow" : "teal"}
                    size="md"
                    radius="xl"
                    striped={isOverBudget}
                    animated={isOverBudget}
                  />
                  <Group justify="space-between" mt="xs">
                    <Text size="xs" c="dimmed">
                      Remaining
                    </Text>
                    <Text 
                      size="xs" 
                      fw={500}
                      c={remaining < 0 ? "red" : "teal"}
                    >
                      {remaining.toFixed(0)}
                    </Text>
                  </Group>
                </Box>
              );
            })
          ) : (
            <Center h={100}>
              <Text size="sm" c="dimmed">
                No budgets found.
              </Text>
            </Center>
          )}
        </Stack>
      )}
    </WidgetCard>
  );
}
