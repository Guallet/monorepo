import { AppScreen } from "@/components/layout/AppScreen";
import { InboxTransactionDto, TransactionDto } from "@guallet/api-client";
import {
  useAccount,
  useInstitution,
  useTransactionInbox,
} from "@guallet/api-react";
import { Money } from "@guallet/money";
import {
  ActionIcon,
  Avatar,
  Column,
  Divider,
  Label,
  Row,
  Spacing,
} from "@guallet/ui-react-native";
import dayjs from "dayjs";
import { FlatList, View } from "react-native";

export default function TransactionsInboxScreen() {
  const { transactions, isLoading } = useTransactionInbox();
  return (
    <AppScreen
      isLoading={isLoading}
      headerOptions={{
        title: "Inbox",
        headerTitleAlign: "center",
        headerRight: () => (
          <>
            {transactions?.length >= 0 ? (
              <View
                style={{
                  backgroundColor: "red",
                  borderRadius: 50,
                  padding: Spacing.extraSmall,
                }}
              >
                <Label variant="bold">{transactions.length}</Label>
              </View>
            ) : null}
          </>
        ),
      }}
    >
      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          marginHorizontal: Spacing.medium,
          marginTop: Spacing.small,
          marginBottom: Spacing.medium,
        }}
        contentContainerStyle={{ gap: Spacing.small }}
        data={transactions}
        renderItem={({ item }) => {
          return <InboxTransaction transaction={item} />;
        }}
      />
    </AppScreen>
  );
}

interface InboxTransactionProps {
  transaction: InboxTransactionDto | TransactionDto;
}
function InboxTransaction({ transaction }: InboxTransactionProps) {
  const { account, isLoading: isAccountLoading } = useAccount(
    transaction.accountId
  );
  const { institution, isLoading: isInstitutionLoading } = useInstitution(
    account?.institutionId
  );

  const money = Money.fromCurrencyCode({
    amount: transaction.amount,
    currencyCode: transaction.currency,
  });

  return (
    <Column
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: Spacing.medium,
      }}
    >
      <Row>
        <Avatar imageUrl={institution?.image_src} size={24} alt="" />
        <Label>{account?.name}</Label>
      </Row>
      <Label variant="bold">{transaction.description}</Label>

      <Row>
        <Label variant="bold">{money.format()}</Label>
        <Label>{dayjs(transaction.date).format("DD/MM/YYYY")}</Label>
      </Row>

      <Divider />
      <Row
        style={{
          justifyContent: "space-between",
          marginTop: Spacing.small,
        }}
      >
        <Row style={{}}>
          <Avatar alt={transaction.categoryId ?? "category"} size={40} />
          <Label style={{ marginHorizontal: Spacing.small }}>
            {"category name"}
          </Label>
        </Row>
        <Row style={{ gap: Spacing.small }}>
          <ActionIcon name="edit" size={35} />
          <ActionIcon name="circle-check" size={35} />
        </Row>
      </Row>
    </Column>
  );
}
