import { useCategories, useTransactionsWithFilter } from '@guallet/api-react';
import { IconCategory } from '@tabler/icons-react';
import { WidgetCard } from './WidgetCard';

interface ExpenditureByCategoryWidgetProps {
  startDate: string | null;
  endDate: string | null;
}

export function ExpenditureByCategoryWidget({
  startDate,
  endDate,
}: Readonly<ExpenditureByCategoryWidgetProps>) {
  const { transactions, isLoading: transactionsLoading } =
    useTransactionsWithFilter({
      page: 1,
      pageSize: 1000,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

  const { categories, isLoading: categoriesLoading } = useCategories();

  const isLoading = transactionsLoading || categoriesLoading;

  // Calculate expenditure by category (only negative transactions)
  const categorySpending = transactions
    .filter((t) => t.amount < 0 && t.categoryId)
    .reduce(
      (acc, t) => {
        const categoryId = t.categoryId!;
        acc[categoryId] = (acc[categoryId] || 0) + Math.abs(t.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

  // Get top 5 categories
  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        id: categoryId,
        name: category?.name || 'Unknown',
        amount,
        color: category?.colour,
      };
    });

  const totalSpending = topCategories.reduce((sum, cat) => sum + cat.amount, 0);

  const categoryColors = [
    '#2563eb',
    '#0d9488',
    '#7c3aed',
    '#ea580c',
    '#db2777',
  ];

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  } else if (topCategories.length > 0) {
    content = (
      <div className="space-y-4">
        {topCategories.map((category, index) => {
          const percentage =
            totalSpending > 0 ? (category.amount / totalSpending) * 100 : 0;
          const color =
            category.color || categoryColors[index % categoryColors.length];

          return (
            <div key={category.id}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <p className="truncate text-sm font-semibold">
                    {category.name}
                  </p>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {category.amount.toFixed(0)}
                </p>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                />
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {percentage.toFixed(1)}% of top 5 spending
              </p>
            </div>
          );
        })}
        <div className="mt-2 rounded-lg border bg-muted/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Total (Top 5)</p>
            <p className="text-lg font-bold text-red-600">
              {totalSpending.toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="flex h-[200px] items-center justify-center">
        <div className="space-y-2 text-center">
          <IconCategory className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No categorized transactions found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WidgetCard
      title="Expenditure by Category"
      icon={<IconCategory size={20} />}
    >
      {content}
    </WidgetCard>
  );
}
