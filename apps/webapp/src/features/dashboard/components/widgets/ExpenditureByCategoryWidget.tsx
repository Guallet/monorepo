import { WidgetCard } from "./WidgetCard";
import { useTransactionsWithFilter, useCategories } from "@guallet/api-react";
import { Loader, Stack, Text, Group, Box, useMantineTheme, Center, Progress } from "@mantine/core";
import { IconCategory } from "@tabler/icons-react";

interface ExpenditureByCategoryWidgetProps {
  startDate: string | null;
  endDate: string | null;
}

export function ExpenditureByCategoryWidget({ 
  startDate, 
  endDate 
}: Readonly<ExpenditureByCategoryWidgetProps>) {
  const { transactions, isLoading: transactionsLoading } = useTransactionsWithFilter({
    page: 1,
    pageSize: 1000,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  });

  const { categories, isLoading: categoriesLoading } = useCategories();
  const theme = useMantineTheme();

  const isLoading = transactionsLoading || categoriesLoading;

  // Calculate expenditure by category (only negative transactions)
  const categorySpending = transactions
    .filter(t => t.amount < 0 && t.categoryId)
    .reduce((acc, t) => {
      const categoryId = t.categoryId!;
      acc[categoryId] = (acc[categoryId] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  // Get top 5 categories
  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        id: categoryId,
        name: category?.name || "Unknown",
        amount,
        color: category?.colour || theme.colors.blue[6],
      };
    });

  const totalSpending = topCategories.reduce((sum, cat) => sum + cat.amount, 0);

  const categoryColors = [
    theme.colors.blue[6],
    theme.colors.teal[6],
    theme.colors.grape[6],
    theme.colors.orange[6],
    theme.colors.pink[6],
  ];

  return (
    <WidgetCard 
      title="Expenditure by Category" 
      icon={<IconCategory size={20} />}
    >
      {isLoading ? (
        <Center h={200}>
          <Loader size="md" />
        </Center>
      ) : topCategories.length > 0 ? (
        <Stack gap="md">
          {topCategories.map((category, index) => {
            const percentage = totalSpending > 0 
              ? (category.amount / totalSpending) * 100 
              : 0;
            const color = categoryColors[index % categoryColors.length];

            return (
              <Box key={category.id}>
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <Box
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: color,
                      }}
                    />
                    <Text fw={600} size="sm">
                      {category.name}
                    </Text>
                  </Group>
                  <Text size="sm" fw={500} c="dimmed">
                    {category.amount.toFixed(0)}
                  </Text>
                </Group>
                <Progress 
                  value={percentage} 
                  color={color}
                  size="md"
                  radius="xl"
                />
                <Text size="xs" c="dimmed" mt="xs">
                  {percentage.toFixed(1)}% of top 5 spending
                </Text>
              </Box>
            );
          })}
          <Box
            p="sm"
            mt="xs"
            style={{
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.gray[0],
              border: `1px solid ${theme.colors.gray[2]}`,
            }}
          >
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Total (Top 5)
              </Text>
              <Text size="lg" fw={700} c="red">
                {totalSpending.toFixed(0)}
              </Text>
            </Group>
          </Box>
        </Stack>
      ) : (
        <Center h={200}>
          <Stack gap="xs" align="center">
            <IconCategory size={48} color={theme.colors.gray[4]} />
            <Text size="sm" c="dimmed" ta="center">
              No categorized transactions found.
            </Text>
          </Stack>
        </Center>
      )}
    </WidgetCard>
  );
}
