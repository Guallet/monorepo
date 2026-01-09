import {
  RecurringPaymentDto,
  RecurringPaymentType,
  RecurrenceCadence,
} from "@guallet/api-client/src/recurringPayments";
import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  ActionIcon,
  Avatar,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconCalendar,
  IconRepeat,
  IconCash,
} from "@tabler/icons-react";
import { Money } from "@guallet/money";

interface RecurringPaymentRowProps {
  payment: RecurringPaymentDto;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getCadenceLabel(cadence: RecurrenceCadence): string {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return "Weekly";
    case RecurrenceCadence.BIWEEKLY:
      return "Bi-weekly";
    case RecurrenceCadence.MONTHLY:
      return "Monthly";
    case RecurrenceCadence.QUARTERLY:
      return "Quarterly";
    case RecurrenceCadence.YEARLY:
      return "Yearly";
  }
}

function getTypeColor(type: RecurringPaymentType): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return "blue";
    case RecurringPaymentType.REGULAR_PAYMENT:
      return "red";
    case RecurringPaymentType.REGULAR_INCOME:
      return "green";
  }
}

function getTypeLabel(type: RecurringPaymentType): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return "Subscription";
    case RecurringPaymentType.REGULAR_PAYMENT:
      return "Regular Payment";
    case RecurringPaymentType.REGULAR_INCOME:
      return "Regular Income";
  }
}

export function RecurringPaymentRow({
  payment,
  onClick,
  onEdit,
  onDelete,
}: Readonly<RecurringPaymentRowProps>) {
  const nextDate = new Date(payment.nextDate);
  const isUpcoming =
    nextDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Within 7 days

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click when clicking action buttons
    if ((e.target as HTMLElement).closest("[data-action-button]")) {
      return;
    }
    onClick();
  };

  // Determine which icon/image to show
  const renderIcon = () => {
    if (
      payment.type === RecurringPaymentType.SUBSCRIPTION &&
      payment.imageUrl
    ) {
      return <Avatar src={payment.imageUrl} size="md" radius="md" />;
    } else if (payment.category?.icon) {
      // For regular payments/income, show category avatar
      return (
        <Avatar
          size="md"
          radius="md"
          style={{
            backgroundColor: payment.category.colour || "#228be6",
          }}
        >
          {payment.category.icon}
        </Avatar>
      );
    } else {
      return <IconCash size={32} />;
    }
  };

  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      p="lg"
      style={{ cursor: "pointer" }}
      onClick={handleCardClick}
    >
      <Group justify="space-between" mb="xs">
        <Group>
          {renderIcon()}
          <Stack gap={0}>
            <Text fw={500} size="lg">
              {payment.name}
            </Text>
            <Text size="xs" c="dimmed">
              {payment.category?.name || "No category"}
            </Text>
          </Stack>
        </Group>
        <Group gap="xs">
          <Badge color={getTypeColor(payment.type)} size="sm">
            {getTypeLabel(payment.type)}
          </Badge>
          {isUpcoming && (
            <Badge color="orange" size="sm">
              Due Soon
            </Badge>
          )}
          {onEdit && (
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              data-action-button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <IconEdit size={16} />
            </ActionIcon>
          )}
          {onDelete && (
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              data-action-button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>

      <Group justify="space-between" mt="md">
        <Group gap="xs">
          <IconRepeat size={16} />
          <Text size="sm" c="dimmed">
            {getCadenceLabel(payment.cadence)}
          </Text>
        </Group>
        <Text size="lg" fw={600}>
          {Money.fromCurrencyCode({
            amount: payment.amount,
            currencyCode: payment.currency,
          }).format()}
        </Text>
      </Group>

      <Group gap="xs" mt="sm">
        <IconCalendar size={16} />
        <Text size="sm" c="dimmed">
          Next payment: {nextDate.toLocaleDateString()}
        </Text>
      </Group>

      {payment.metadata?.confidenceScore && (
        <Text size="xs" c="dimmed" mt="xs">
          Confidence: {(payment.metadata.confidenceScore * 100).toFixed(0)}%
        </Text>
      )}
    </Card>
  );
}
