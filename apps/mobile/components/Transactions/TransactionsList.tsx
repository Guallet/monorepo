import { useTransactions } from "@/features/transactions/useTransactions";
import { TransactionRow } from "../Rows/TransactionRow";
import { SectionList, View } from "react-native";
import { Label, Spacing } from "@guallet/ui-react-native";
import { TransactionDto } from "@guallet/api-client";
import dayjs from "dayjs";
var relativeTime = require("dayjs/plugin/relativeTime");
// TODO: This should be in a date time formatter helper
dayjs.extend(relativeTime);

export type GroupedTransactions = {
  date: Date;
  // SectionList data requires the data array to be called "data". Otherwise it won't work
  data: TransactionDto[];
}[];

interface TransactionsListProps {
  onTransactionSelected: (transaction: TransactionDto) => void;
}
export function TransactionsList({
  onTransactionSelected,
}: TransactionsListProps) {
  const { transactions, metadata, isLoading } = useTransactions();

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
      renderItem={({ item }) => (
        <TransactionRow
          transaction={item}
          onClick={() => {
            onTransactionSelected(item);
          }}
        />
      )}
      renderSectionHeader={({ section: { date } }) => (
        <View
          style={{
            height: 50,
            paddingTop: Spacing.medium,
            paddingHorizontal: Spacing.medium,
            backgroundColor: "grey",
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
    />
  );
}

// export function TransactionsList() {
//   const { transactions, metadata, isLoading } = useTransactions();

//   return (
//     <View style={{ height: "100%", width: Dimensions.get("screen").width }}>
//       <FlashList
//         data={transactions}
//         estimatedItemSize={
//           transactions.length === 0 ? 100 : transactions.length
//         }
//         renderItem={({ item }) => (
//           <TransactionRow
//             transaction={item}
//             onClick={(transaction) => {
//               console.log("Transaction clicked", transaction);
//             }}
//           />
//         )}
//       />
//     </View>
//   );
// }
