import { TransactionRow } from "../Rows/TransactionRow";
import { SectionList, View } from "react-native";
import { Label, Spacing } from "@guallet/ui-react-native";
import { TransactionDto } from "@guallet/api-client";
import dayjs from "dayjs";
let relativeTime = require("dayjs/plugin/relativeTime");
// TODO: This should be in a date time formatter helper
dayjs.extend(relativeTime);

export type GroupedTransactions = {
  date: Date;
  // SectionList data requires the data array to be called "data". Otherwise it won't work
  data: TransactionDto[];
}[];

interface TransactionsListProps {
  transactions: TransactionDto[];
  onEndReached: () => void;
  onTransactionSelected: (transaction: TransactionDto) => void;
}
export function TransactionsList({
  transactions,
  onEndReached,
  onTransactionSelected,
}: TransactionsListProps) {
  const groupedTransactions = transactions.reduce(
    (result: GroupedTransactions, current: TransactionDto) => {
      let dateGroup = result.find((x) => x.date === current.date);
      if (!dateGroup) {
        dateGroup = { date: current.date, data: [] };
        result.push(dateGroup);
      }
      dateGroup.data.push(current);
      return result;
    },
    []
  );

  return (
    <SectionList
      sections={groupedTransactions}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={true}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      // onEndReachedThreshold={0.3}
      onEndReached={() => {
        onEndReached();
      }}
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Label>No transactions</Label>
        </View>
      }
      renderItem={({ item }) => (
        <TransactionRow
          transaction={item}
          onClick={() => {
            onTransactionSelected(item);
          }}
          style={{
            backgroundColor: "white",
          }}
        />
      )}
      renderSectionHeader={({ section: { date } }) => (
        <View
          style={{
            height: 50,
            paddingTop: Spacing.medium,
            paddingHorizontal: Spacing.medium,
            backgroundColor: "white",
            flexDirection: "column",
            borderTopStartRadius: Spacing.small,
            borderTopEndRadius: Spacing.small,
            borderBottomWidth: 1,
          }}
        >
          <Label
            style={{
              fontWeight: "bold",
            }}
          >
            {dayjs().subtract(7, "day").isBefore(dayjs(date))
              ? dayjs(date).fromNow()
              : dayjs(date).format("D MMMM, YYYY")}
          </Label>
        </View>
      )}
      renderSectionFooter={() => (
        <View
          style={{
            height: Spacing.extraSmall,
            backgroundColor: "white",
            borderBottomStartRadius: Spacing.small,
            borderBottomEndRadius: Spacing.small,
            marginBottom: Spacing.small,
          }}
        />
      )}
    />
  );
}
