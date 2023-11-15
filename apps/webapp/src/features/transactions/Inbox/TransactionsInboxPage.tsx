import { useState } from "react";
import {
  Card,
  Text,
  Button,
  List,
  useMantineTheme,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Modal,
} from "@mantine/core";
import { Transaction } from "../models/Transaction";
import {
  LoaderFunction,
  useLoaderData,
  useRevalidator,
} from "react-router-dom";
import { loadAccounts } from "../../accounts/api/accounts.api";
import { loadCategories } from "../../categories/api/categories.api";
import { Account } from "../../accounts/models/Account";
import { Category } from "../../categories/models/Category";
import {
  getTransactionsInbox,
  updateTransactionCategory,
} from "../api/transactions.api";
import { IconDeviceFloppy, IconEdit } from "@tabler/icons-react";
import { SelectCategoryModal } from "../TransactionsPage/SelectCategoryModal";
import { useMediaQuery } from "@mantine/hooks";

type LoaderData = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
};

export const loader: LoaderFunction = async () => {
  const accounts = await loadAccounts();
  const categories = await loadCategories();

  const result = await getTransactionsInbox();
  const rehydratedTransactions = result.transactions.map((transaction) => {
    return {
      ...transaction,
      account: accounts.find((account) => account.id === transaction.accountId),
      category: categories.find(
        (category) => category.id === transaction.categoryId
      ),
    };
  });

  return {
    categories,
    accounts,
    transactions: rehydratedTransactions,
  } as LoaderData;
};

export function TransactionsInboxPage() {
  const { transactions, categories, accounts } = useLoaderData() as LoaderData;
  console.log("Page data", {
    transactions,
    categories,
    accounts,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  //   const theme = useMantineTheme();
  const revalidator = useRevalidator();

  return (
    <Stack>
      <Group>
        <Text>Transactions Inbox</Text>
        <Badge>{transactions.length}</Badge>
      </Group>
      <List>
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            categories={categories}
            transaction={transaction}
            onSaved={() => {
              revalidator.revalidate();
            }}
          />
        ))}
      </List>
      {selectedTransaction && (
        <Card>
          <Text>{selectedTransaction.description}</Text>
          <Text>{selectedTransaction.amount}</Text>
          <Button onClick={() => setSelectedTransaction(null)}>Close</Button>
        </Card>
      )}
    </Stack>
  );
}

interface TransactionCardProps {
  transaction: Transaction;
  categories: Category[];
  onSaved: () => void;
}

export function TransactionCard({
  transaction,
  categories,
  onSaved,
}: TransactionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    transaction.category
  );
  const isMobile = useMediaQuery("(max-width: 50em)");

  const handleSaveCategory = async (categoryId: string) => {
    setIsLoading(true);
    await updateTransactionCategory({
      transactionId: transaction.id,
      categoryId: categoryId,
    });
    onSaved();
    setIsLoading(false);
  };

  return (
    <>
      <Modal
        opened={isModalOpen}
        fullScreen={isMobile}
        onClose={function (): void {
          setIsModalOpen(false);
        }}
      >
        <SelectCategoryModal
          categories={categories}
          onSelectCategory={(category: Category) => {
            setSelectedCategory(category);
            setIsModalOpen(false);
          }}
        />
      </Modal>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text>{transaction.account?.name}</Text>
        <Text>{transaction.description}</Text>
        <Text>{transaction.amount}</Text>
        <Text>{transaction.date.toString()}</Text>

        <Group>
          <Text>{selectedCategory?.name}</Text>

          <ActionIcon
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <IconEdit />
          </ActionIcon>
          <ActionIcon
            loading={isLoading}
            onClick={() => {
              if (selectedCategory) {
                handleSaveCategory(selectedCategory?.id);
              } else {
                console.error("No category selected");
              }
            }}
          >
            <IconDeviceFloppy />
          </ActionIcon>
        </Group>
      </Card>
    </>
  );
}
