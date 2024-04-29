import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import {
  Card,
  Text,
  Button,
  List,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Modal,
} from "@mantine/core";

import { IconDeviceFloppy, IconEdit } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { loadAccounts } from "@/features/accounts/api/accounts.api";
import { loadCategories } from "@/features/categories/api/categories.api";
import { Category } from "@/features/categories/models/Category";
import { RulesEngine } from "@/features/categories/rules/RulesEngine";
import { SelectCategoryModal } from "@/features/transactions/TransactionsPage/SelectCategoryModal";
import {
  getTransactionsInbox,
  updateTransactionCategory,
} from "@/features/transactions/api/transactions.api";
import { Transaction } from "@/features/transactions/models/Transaction";

export const Route = createFileRoute("/_app/transactions/inbox")({
  loader: loader,
  component: TransactionsInboxPage,
});

async function loader() {
  const accounts = await loadAccounts();
  const categories = await loadCategories();

  const transactions = await getTransactionsInbox();
  const rehydratedTransactions = transactions.map((transaction) => {
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
    transactions: rehydratedTransactions as Transaction[],
  };
}

function TransactionsInboxPage() {
  const { transactions, categories } = Route.useLoaderData();

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const rulesEngine = new RulesEngine(categories);

  return (
    <Stack>
      <Group>
        <Text>Transactions Inbox</Text>
        <Badge>{transactions.length}</Badge>
      </Group>
      <List>
        {transactions
          .map((transaction) => {
            return {
              ...transaction,
              category: rulesEngine.getCategoryForTransaction(transaction),
            };
          })
          .sort((a, b) => {
            if (a.category && b.category) {
              return a.category.name.localeCompare(b.category.name);
            } else if (a.category) {
              return -1;
            } else if (b.category) {
              return 1;
            } else {
              return 0;
            }
          })
          .map((transaction) => (
            <TransactionCard
              key={transaction.id}
              categories={categories}
              transaction={transaction}
              onSaved={() => {
                Route.router?.invalidate();
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
