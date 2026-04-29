import { useSubscriptions } from "@guallet/api-react";
import { WidgetCard } from "./WidgetCard";
import { Money } from "@guallet/money";
import { Loader, Stack, Text, Group, Box, Center, ScrollArea } from "@mantine/core";
import { IconReceipt, IconRepeat } from "@tabler/icons-react";
import { RecurringPaymentType, RecurrenceCadence } from "@guallet/api-client";
import { useTheme } from "@guallet/ui-react";
import { useRouter } from "@tanstack/react-router";

const MAX_ITEMS = 3;

const CADENCE_LABELS: Record<RecurrenceCadence, string> = {
  [RecurrenceCadence.WEEKLY]: "weekly",
  [RecurrenceCadence.BIWEEKLY]: "biweekly",
  [RecurrenceCadence.MONTHLY]: "monthly",
  [RecurrenceCadence.QUARTERLY]: "quarterly",
  [RecurrenceCadence.YEARLY]: "yearly",
};

function toMonthlyAmount(amount: number, cadence: RecurrenceCadence): number {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY: return amount * 4.33;
    case RecurrenceCadence.BIWEEKLY: return amount * 2.17;
    case RecurrenceCadence.MONTHLY: return amount;
    case RecurrenceCadence.QUARTERLY: return amount / 3;
    case RecurrenceCadence.YEARLY: return amount / 12;
  }
}

export function RecurringPaymentsWidget() {
  const { subscriptions, isLoading } = useSubscriptions();
  const { colors } = useTheme();
  const router = useRouter();

  const recurringPayments = subscriptions
    .filter(
      (s) =>
        s.type === RecurringPaymentType.SUBSCRIPTION ||
        s.type === RecurringPaymentType.REGULAR_PAYMENT
    )
    .sort((a, b) => {
      const aMonthly = toMonthlyAmount(a.amount, a.cadence);
      const bMonthly = toMonthlyAmount(b.amount, b.cadence);
      return bMonthly - aMonthly;
    });

  const totalMonthly = recurringPayments.reduce(
    (sum, s) => sum + toMonthlyAmount(s.amount, s.cadence),
    0
  );

  const hasMore = recurringPayments.length > MAX_ITEMS;
  const displayItems = recurringPayments.slice(0, MAX_ITEMS);

  return (
    <WidgetCard
      title="Recurring Payments"
      icon={<IconRepeat size={20} />}
      footer={
        recurringPayments.length > 0 && (
          <Text
            component="a"
            size="sm"
            fw={500}
            style={{
              color: colors.primary,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'block',
              textAlign: 'center',
            }}
            onClick={() => router.navigate({ to: '/subscriptions' })}
          >
            View all subscriptions →
          </Text>
        )
      }
    >
      {isLoading ? (
        <Center h={100}>
          <Loader size="md" />
        </Center>
      ) : recurringPayments.length > 0 ? (
        <Stack gap="sm">
          <Box
            p="sm"
            style={{
              borderRadius: '8px',
              backgroundColor: `${colors.error}12`,
              border: `1px solid ${colors.error}40`,
              textAlign: 'center',
            }}
          >
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Monthly outgoing
            </Text>
            <Text size="xl" fw={700} style={{ color: colors.error }}>
              {Money.fromCurrencyCode({
                amount: totalMonthly,
                currencyCode: recurringPayments[0]?.currency || 'GBP',
              }).format()}
            </Text>
          </Box>

          <ScrollArea.Autosize mah={180}>
            <Stack gap="xs">
              {displayItems.map((item) => {
                const monthly = toMonthlyAmount(item.amount, item.cadence);
                return (
                  <Box
                    key={item.id}
                    p="sm"
                    style={{
                      borderRadius: '8px',
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.paleGrey}`,
                    }}
                  >
                    <Group justify="space-between">
                      <Stack gap={0}>
                        <Text fw={600} size="sm">
                          {item.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {CADENCE_LABELS[item.cadence]}
                        </Text>
                      </Stack>
                      <Stack gap={0} align="flex-end">
                        <Text fw={700} size="sm" style={{ color: colors.error }}>
                          {Money.fromCurrencyCode({
                            amount: monthly,
                            currencyCode: item.currency,
                          }).format()}
                        </Text>
                        <Text size="xs" c="dimmed">
                          /month
                        </Text>
                      </Stack>
                    </Group>
                  </Box>
                );
              })}
              {hasMore && (
                <Text size="xs" c="dimmed" ta="center">
                  +{recurringPayments.length - MAX_ITEMS} more
                </Text>
              )}
            </Stack>
          </ScrollArea.Autosize>
        </Stack>
      ) : (
        <Center h={100}>
          <Stack gap="xs" align="center">
            <IconReceipt size={48} style={{ color: colors.paleGrey }} />
            <Text size="sm" c="dimmed" ta="center">
              No recurring payments found.
            </Text>
          </Stack>
        </Center>
      )}
    </WidgetCard>
  );
}