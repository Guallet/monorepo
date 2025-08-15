import { useBudgets } from "@guallet/api-react";
import { WidgetCard } from "./WidgetCard";
import { Loader, Stack, Text, Progress, Group } from "@mantine/core";

export function BudgetsWidget() {
  const { budgets, isLoading } = useBudgets();

  return (
    <WidgetCard title="Budgets">
      {isLoading ? (
        <Loader />
      ) : (
        <Stack>
          {budgets && budgets.length > 0 ? (
            budgets.map((budget) => {
              const spent = Number(budget.spent ?? 0);
              const total = Number(budget.amount ?? 0);
              const remaining = total - spent;
              const percent =
                total > 0 ? Math.min((spent / total) * 100, 100) : 0;
              return (
                <div key={budget.id}>
                  <Group justify="space-between" mb={4}>
                    <Text fw={500}>{budget.name}</Text>
                    <Text size="sm" c={percent > 90 ? "red" : "dimmed"}>
                      {spent} / {total}
                    </Text>
                  </Group>
                  <Progress
                    value={percent}
                    color={percent > 90 ? "red" : "teal"}
                  />
                  <Text size="xs" c="dimmed" mt={2}>
                    Remaining: {remaining}
                  </Text>
                </div>
              );
            })
          ) : (
            <Text size="sm" c="dimmed">
              No budgets found.
            </Text>
          )}
        </Stack>
      )}
    </WidgetCard>
  );
}
