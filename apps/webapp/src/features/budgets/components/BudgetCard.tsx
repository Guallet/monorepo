import { GualletIcon } from "@/components/GualletIcon/GualletIcon";
import { useBudget } from "@guallet/api-react";
import { Money } from "@guallet/money";
import { Progress, Group, Text, Card, Loader } from "@mantine/core";

interface BudgetCardProps {
  budgetId: string;
}

export function BudgetCard({ budgetId }: Readonly<BudgetCardProps>) {
  const { budget } = useBudget(budgetId);

  if (!budget) {
    return <Loader />;
  }

  const percent = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  let progressColor: string = "green";
  if (percent >= 100) {
    progressColor = "red";
  } else if (percent >= 80) {
    progressColor = "yellow";
  }

  const spentMoney = Money.fromCurrencyCode({
    amount: budget.spent,
    currencyCode: budget.currency,
  });

  const amountMoney = Money.fromCurrencyCode({
    amount: budget.amount,
    currencyCode: budget.currency,
  });

  return (
    <Card withBorder shadow="sm" radius="md">
      <Group align="center" mb={8}>
        <Group
          align="center"
          gap={8}
          style={{
            flexGrow: 1,
          }}
        >
          {budget.icon && budget.colour && (
            <GualletIcon iconName={budget.icon} iconColor={budget.colour} />
          )}
          <Text fw={600}>{budget.name}</Text>
        </Group>
        <Text size="sm" c="dimmed">
          {spentMoney.format()} / {amountMoney.format()}
        </Text>
      </Group>

      <Group align="end">
        <Progress
          style={{ flex: 1 }}
          value={Math.min(percent, 100)}
          size="md"
          radius="xl"
          mb={8}
          color={progressColor}
        />
        <Text>{percent.toFixed(0)}%</Text>
      </Group>
    </Card>
  );
}
