import { useAccounts } from "@guallet/api-react";
import { WidgetCard } from "./WidgetCard";
import { Money } from "@guallet/money";
import { Loader, Stack, Text, Group, Box, useMantineTheme, Center, Badge } from "@mantine/core";
import { IconBuildingBank, IconCreditCard } from "@tabler/icons-react";
import { AccountTypeDto } from "@guallet/api-client";

export function CurrentAccountsWidget() {
  const { accounts, isLoading } = useAccounts();
  const theme = useMantineTheme();

  // Filter for current accounts and credit cards
  const currentAccounts = accounts.filter(
    (account) => account.type === AccountTypeDto.CURRENT_ACCOUNT || 
                 account.type === AccountTypeDto.CREDIT_CARD
  );

  return (
    <WidgetCard 
      title="Current Accounts" 
      icon={<IconBuildingBank size={20} />}
    >
      {isLoading ? (
        <Center h={150}>
          <Loader size="md" />
        </Center>
      ) : currentAccounts.length > 0 ? (
        <Stack gap="sm">
          {currentAccounts.map((account) => {
            const balance = Money.fromCurrencyCode({
              currencyCode: account.currency,
              amount: Number(account.balance.amount),
            });
            const isPositive = balance.amount >= 0;
            const isCreditCard = account.type === AccountTypeDto.CREDIT_CARD;

            return (
              <Box
                key={account.id}
                p="md"
                style={{
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.colors.gray[0],
                  border: `1px solid ${theme.colors.gray[3]}`,
                  transition: 'all 0.2s ease',
                }}
              >
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    {isCreditCard ? (
                      <IconCreditCard size={18} color={theme.colors.blue[6]} />
                    ) : (
                      <IconBuildingBank size={18} color={theme.colors.blue[6]} />
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
                  size="lg" 
                  fw={700}
                  c={isPositive ? "teal" : "red"}
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
        </Stack>
      ) : (
        <Center h={150}>
          <Stack gap="xs" align="center">
            <IconBuildingBank size={48} color={theme.colors.gray[4]} />
            <Text size="sm" c="dimmed" ta="center">
              No current accounts found.
            </Text>
          </Stack>
        </Center>
      )}
    </WidgetCard>
  );
}
