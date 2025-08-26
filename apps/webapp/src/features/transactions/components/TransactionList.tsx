import { TransactionDto } from "@guallet/api-client";
import { Stack } from "@mantine/core";
import { TransactionRow } from "./TransactionRow";
import { AppSection } from "@/components/Cards/AppSection";
import { useLocale } from "@/i18n/useLocale";

interface TransactionListProps {
  transactions: TransactionDto[];
  onTransactionClicked?: (transaction: TransactionDto) => void;
}

export function TransactionList({
  transactions,
  onTransactionClicked,
}: Readonly<TransactionListProps>) {
  const { locale } = useLocale();

  // Group the transactions by date
  const groupedTransactions = transactions.reduce(
    (acc, transaction) => {
      const date = new Date(transaction.date).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    },
    {} as Record<string, TransactionDto[]>
  );

  return (
    <Stack>
      {Object.entries(groupedTransactions)
        .sort(
          ([dateA], [dateB]) =>
            new Date(dateB).getTime() - new Date(dateA).getTime()
        )
        .map(([date, transactions]) => {
          return (
            <AppSection
              key={date}
              title={new Date(date).toLocaleDateString(locale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              p={0}
            >
              <Stack gap={0}>
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    avatarType={"account"}
                    onClick={(transaction: TransactionDto) => {
                      onTransactionClicked?.(transaction);
                    }}
                  />
                ))}
              </Stack>
            </AppSection>
          );
        })}
    </Stack>
  );
}
