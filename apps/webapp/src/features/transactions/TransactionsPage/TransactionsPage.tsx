import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import { TransactionQueryResultDto } from "../models/Transaction";
import { Stack, Text, Table, Pagination } from "@mantine/core";
import { loadTransactions } from "../api/transactions.api";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page"));
  const pageSize = Number(url.searchParams.get("pageSize"));

  const sanitizedPage = page === 0 ? 1 : page;
  const sanitizedPageSize = pageSize === 0 ? 50 : pageSize;

  return await loadTransactions(sanitizedPage, sanitizedPageSize);
};

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  if (date.toDateString() === today.toDateString()) {
    return "today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "yesterday";
  } else if (date > twoWeeksAgo) {
    const daysAgo = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 3600 * 24)
    );
    return `${daysAgo} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function TransactionsPage() {
  const data = useLoaderData() as TransactionQueryResultDto;
  console.log("Page data", data);
  const navigate = useNavigate();
  const totalPages = Math.ceil(data.meta.total / data.meta.pageSize);

  if (data.transactions.length == 0) {
    return (
      <Stack>
        <Text>You don't have any transactions yet</Text>
      </Stack>
    );
  }

  const rows = data.transactions.map((transaction) => (
    <Table.Tr key={transaction.id}>
      <Table.Td>{formatDate(new Date(transaction.date))}</Table.Td>
      <Table.Td>{transaction.accountId}</Table.Td>
      <Table.Td>{transaction.description}</Table.Td>
      {/* <Table.Td>{transaction.notes}</Table.Td> */}
      <Table.Td>{transaction.amount}</Table.Td>
      <Table.Td>{transaction.categoryId}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Text>Transactions list</Text>
      <Table
        striped
        highlightOnHover
        withColumnBorders
        stickyHeader
        stickyHeaderOffset={60}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Account</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Category</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      <Pagination
        total={totalPages}
        siblings={1}
        value={data.meta.page}
        onChange={(page) => {
          navigate("/transactions?page=" + page.toString(), { replace: true });
        }}
      />
      ;
    </Stack>
  );
}
