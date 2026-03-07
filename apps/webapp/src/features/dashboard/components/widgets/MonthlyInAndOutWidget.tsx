import { WidgetCard } from "./WidgetCard";
import { useTransactionsWithFilter } from "@guallet/api-react";
import { IconChartBar } from "@tabler/icons-react";
import { BarChart } from "@mantine/charts";

interface MonthlyInAndOutWidgetProps {
  startDate: string | null;
  endDate: string | null;
}

export function MonthlyInAndOutWidget({ 
  startDate, 
  endDate 
}: Readonly<MonthlyInAndOutWidgetProps>) {
  const { transactions, isLoading } = useTransactionsWithFilter({
    page: 1,
    pageSize: 1000,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  });

  // Group transactions by month
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthLabel, income: 0, spending: 0, date: date };
    }
    
    if (transaction.amount > 0) {
      acc[monthKey].income += transaction.amount;
    } else {
      acc[monthKey].spending += Math.abs(transaction.amount);
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; spending: number; date: Date }>);

  // Convert to array and sort by date
  const data = Object.values(monthlyData)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-6) // Last 6 months
    .map(({ month, income, spending }) => ({
      month,
      income: Math.round(income),
      spending: Math.round(spending),
    }));

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  } else if (data.length > 0) {
    content = (
      <div className="mt-2 rounded-xl bg-muted p-4">
        <BarChart
          h={280}
          data={data}
          dataKey="month"
          series={[
            { name: 'income', label: 'Income', color: 'teal.6' },
            { name: 'spending', label: 'Spending', color: 'red.6' },
          ]}
          tickLine="y"
          gridAxis="xy"
          withLegend
          legendProps={{
            verticalAlign: 'top',
            height: 40,
          }}
          tooltipAnimationDuration={200}
          barProps={{ radius: [4, 4, 0, 0] }}
        />
      </div>
    );
  } else {
    content = (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No transaction data available.
      </div>
    );
  }

  return (
    <WidgetCard 
      title="Income vs. Spending" 
      icon={<IconChartBar size={20} />}
    >
      {content}
    </WidgetCard>
  );
}
