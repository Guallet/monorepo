import { useAccounts } from "@guallet/api-react";
import { WidgetCard } from "./WidgetCard";
import { Money } from "@guallet/money";
import { Loader, Stack, Text, Group, Box, Center, Badge, ScrollArea } from "@mantine/core";
import { IconBuildingBank, IconCreditCard } from "@tabler/icons-react";
import { AccountTypeDto } from "@guallet/api-client";
import { useTheme } from "@guallet/ui-react";
import { useRouter } from "@tanstack/react-router";

const MAX_ITEMS = 6;

export function CurrentAccountsWidget() {
  const { accounts, isLoading } = useAccounts();
  const { colors } = useTheme();
  const router = useRouter();

  const currentAccounts = accounts.filter(
    (account) => account.type === AccountTypeDto.CURRENT_ACCOUNT ||
                 account.type === AccountTypeDto.CREDIT_CARD
  );

  const hasMore = currentAccounts.length > MAX_ITEMS;
  const displayAccounts = currentAccounts.slice(0, MAX_ITEMS);

  return (
    <WidgetCard
      title="Current Accounts"
      icon={<IconBuildingBank size={20} />}
      footer={
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
          onClick={() => router.navigate({ to: '/accounts' })}
        >
          View all accounts →
        </Text>
      }
    >
      {isLoading ? (
        <Center h={150}>
          <Loader size="md" />
        </Center>
      ) : currentAccounts.length > 0 ? (
        <ScrollArea.Autosize mah={280}>
          <Stack gap="sm">
            {displayAccounts.map((account) => {
              const balance = Money.fromCurrencyCode({
                currencyCode: account.currency,
                amount: Number(account.balance.amount),
              });
              const isPositive = balance.amount >= 0;
              const isCreditCard = account.type === AccountTypeDto.CREDIT_CARD;
              const moneyColor = isPositive ? colors.support : colors.error;

              return (
                <Box
                  key={account.id}
                  p="sm"
                  style={{
                    borderRadius: '8px',
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.paleGrey}`,
                  }}
                >
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      {isCreditCard ? (
                        <IconCreditCard size={16} style={{ color: colors.primary }} />
                      ) : (
                        <IconBuildingBank size={16} style={{ color: colors.primary }} />
                      )}
                      <Text fw={600} size="sm">
                        {account.name}
                      </Text>
                    </Group>
                    <Badge
                      size="sm"
                      color={isCreditCard ? "blue" : "gray"}
                      variant="light"
                    >
                      {isCreditCard ? "Credit" : "Current"}
                    </Badge>
                  </Group>
                  <Text
                    size="md"
                    fw={700}
                    style={{ color: moneyColor }}
                  >
                    {balance.format()}
                  </Text>
                  {account.institutionId && (
                    <Text size="xs" c="dimmed" mt="xs">
                      {account.sourceName || "Connected"}
                    </Text>
                  )}
                </Box>
              );
            })}
            {hasMore && (
              <Text size="xs" c="dimmed" ta="center">
                +{currentAccounts.length - MAX_ITEMS} more account{currentAccounts.length - MAX_ITEMS !== 1 ? 's' : ''}
              </Text>
            )}
          </Stack>
        </ScrollArea.Autosize>
      ) : (
        <Center h={150}>
          <Stack gap="xs" align="center">
            <IconBuildingBank size={48} style={{ color: colors.paleGrey }} />
            <Text size="sm" c="dimmed" ta="center">
              No current accounts found.
            </Text>
          </Stack>
        </Center>
      )}
    </WidgetCard>
  );
}