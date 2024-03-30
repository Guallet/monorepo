import { ActivityIndicator, View } from "react-native";
import { WidgetCard } from "./WidgetCard";
import { Label, Spacing } from "@guallet/ui-react-native";
import { useTransactionInbox } from "@/features/transactions/useTransactions";
import { TransactionRow } from "@/components/Rows/TransactionRow";

interface TransactionsInboxWidgetProps
  extends React.ComponentProps<typeof WidgetCard> {}

export function TransactionsInboxWidget({
  onClick,
}: TransactionsInboxWidgetProps) {
  const { transactions, isLoading } = useTransactionInbox();

  return (
    <WidgetCard title="Transaction Inbox" onClick={onClick}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View>
          <Label
            style={{
              marginBottom: Spacing.extraSmall,
            }}
          >
            You have
            <Label style={{ color: "blue", fontWeight: "bold" }}>
              {` ${transactions.length} `}
            </Label>
            transactions to categorize
          </Label>
          {transactions.slice(0, 3).map((item) => {
            return <TransactionRow key={item.id} transaction={item} />;
          })}
        </View>
      )}
    </WidgetCard>
  );
}
