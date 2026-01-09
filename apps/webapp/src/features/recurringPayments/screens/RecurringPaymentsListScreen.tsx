import { BaseScreen } from "@/components/Screens/BaseScreen";
import {
  RecurringPaymentDto,
  RecurringPaymentType,
} from "@guallet/api-client/src/recurringPayments";
import {
  useRecurringPayments,
  useRecurringPaymentMutations,
} from "@guallet/api-react";
import {
  Stack,
  Button,
  Text,
  Group,
  Modal,
  Tabs,
  Paper,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RecurringPaymentRow } from "../components/RecurringPaymentRow";
import {
  IconPlus,
  IconRepeat,
  IconCreditCard,
  IconCash,
  IconWallet,
} from "@tabler/icons-react";

export function RecurringPaymentsListScreen() {
  const navigate = useNavigate();
  const { recurringPayments, isLoading } = useRecurringPayments();
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [paymentToDelete, setPaymentToDelete] =
    useState<RecurringPaymentDto | null>(null);

  const handleDelete = async (payment: RecurringPaymentDto) => {
    setPaymentToDelete(payment);
    openDeleteModal();
  };

  const { deleteRecurringPaymentMutation } = useRecurringPaymentMutations();

  const confirmDelete = async () => {
    if (!paymentToDelete) return;

    deleteRecurringPaymentMutation.mutate(
      {
        id: paymentToDelete.id,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: `Recurring payment "${paymentToDelete.name}" has been deleted`,
            color: "green",
          });
        },
        onError: (error) => {
          console.error("Failed to delete recurring payment:", error);
          notifications.show({
            title: "Error",
            message: "Failed to delete recurring payment",
            color: "red",
          });
        },
      }
    );

    closeDeleteModal();
    setPaymentToDelete(null);
  };

  const handleEdit = (payment: RecurringPaymentDto) => {
    // Navigate to edit page (to be implemented)
    navigate({ to: `/recurring-payments/${payment.id}/edit` });
  };

  const handlePaymentClick = (payment: RecurringPaymentDto) => {
    // Navigate to detail view (to be implemented)
    navigate({ to: `/recurring-payments/${payment.id}` });
  };

  // Group payments by type
  const subscriptions = recurringPayments.filter(
    (p) => p.type === RecurringPaymentType.SUBSCRIPTION
  );
  const regularPayments = recurringPayments.filter(
    (p) => p.type === RecurringPaymentType.REGULAR_PAYMENT
  );
  const regularIncome = recurringPayments.filter(
    (p) => p.type === RecurringPaymentType.REGULAR_INCOME
  );

  const renderEmptyState = (message: string) => (
    <Paper p="xl" withBorder>
      <Stack align="center" gap="md">
        <IconRepeat size={48} opacity={0.5} />
        <Text size="md" c="dimmed" ta="center">
          {message}
        </Text>
      </Stack>
    </Paper>
  );

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group>
            <IconRepeat size={24} />
            <Text size="xl" fw={700}>
              Recurring Payments
            </Text>
          </Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate({ to: "/recurring-payments/new" })}
          >
            New Recurring Payment
          </Button>
        </Group>

        {recurringPayments.length === 0 ? (
          <Stack align="center" gap="lg" py="xl">
            <IconRepeat size={48} opacity={0.5} />
            <Text size="lg" c="dimmed" ta="center">
              No recurring payments yet
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Add recurring payments and subscriptions to keep track of your
              regular expenses and income.
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate({ to: "/recurring-payments/new" })}
            >
              Create Your First Recurring Payment
            </Button>
          </Stack>
        ) : (
          <Tabs defaultValue="subscriptions">
            <Tabs.List>
              <Tabs.Tab
                value="subscriptions"
                leftSection={<IconCreditCard size={16} />}
              >
                Subscriptions ({subscriptions.length})
              </Tabs.Tab>
              <Tabs.Tab
                value="payments"
                leftSection={<IconCash size={16} />}
              >
                Regular Payments ({regularPayments.length})
              </Tabs.Tab>
              <Tabs.Tab
                value="income"
                leftSection={<IconWallet size={16} />}
              >
                Regular Income ({regularIncome.length})
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="subscriptions" pt="md">
              {subscriptions.length === 0 ? (
                renderEmptyState("No subscriptions yet")
              ) : (
                <Stack gap="md">
                  {subscriptions.map((payment) => (
                    <RecurringPaymentRow
                      key={payment.id}
                      payment={payment}
                      onClick={() => handlePaymentClick(payment)}
                      onEdit={() => handleEdit(payment)}
                      onDelete={() => handleDelete(payment)}
                    />
                  ))}
                </Stack>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="payments" pt="md">
              {regularPayments.length === 0 ? (
                renderEmptyState("No regular payments yet")
              ) : (
                <Stack gap="md">
                  {regularPayments.map((payment) => (
                    <RecurringPaymentRow
                      key={payment.id}
                      payment={payment}
                      onClick={() => handlePaymentClick(payment)}
                      onEdit={() => handleEdit(payment)}
                      onDelete={() => handleDelete(payment)}
                    />
                  ))}
                </Stack>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="income" pt="md">
              {regularIncome.length === 0 ? (
                renderEmptyState("No regular income yet")
              ) : (
                <Stack gap="md">
                  {regularIncome.map((payment) => (
                    <RecurringPaymentRow
                      key={payment.id}
                      payment={payment}
                      onClick={() => handlePaymentClick(payment)}
                      onEdit={() => handleEdit(payment)}
                      onDelete={() => handleDelete(payment)}
                    />
                  ))}
                </Stack>
              )}
            </Tabs.Panel>
          </Tabs>
        )}
      </Stack>

      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Recurring Payment"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete the recurring payment "
            {paymentToDelete?.name}"? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </BaseScreen>
  );
}
