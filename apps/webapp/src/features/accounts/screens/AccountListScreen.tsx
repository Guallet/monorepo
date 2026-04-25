import { BaseScreen } from '@/components/Screens/BaseScreen';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccounts } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { AccountRow } from '../components/AccountRow';
import { AccountsHeader } from '../components/AccountsHeader';
import { AccountsListHeader } from '../components/AccountsListHeader';

// Display order for account type groups
const GROUP_ORDER: AccountTypeDto[] = [
  AccountTypeDto.CURRENT_ACCOUNT,
  AccountTypeDto.SAVINGS,
  AccountTypeDto.CREDIT_CARD,
  AccountTypeDto.INVESTMENT,
  AccountTypeDto.MORTGAGE,
  AccountTypeDto.LOAN,
  AccountTypeDto.PENSION,
  AccountTypeDto.UNKNOWN,
];

// ── Net-worth summary ────────────────────────────────────────

function formatMoney(amount: number, currency: string): string {
  return Money.fromCurrencyCode({ amount, currencyCode: currency }).format();
}

function isNegative(amount: number): boolean {
  return amount < 0;
}

function SummaryBlock({
  label,
  totals,
  positive,
}: Readonly<{
  label: string;
  totals: Record<string, number>;
  positive: boolean;
}>) {
  const entries = Object.entries(totals);
  return (
    <div style={{ minWidth: 120 }}>
      <Text
        size="xs"
        fw={600}
        tt="uppercase"
        c="dimmed"
        style={{ letterSpacing: '0.06em' }}
      >
        {label}
      </Text>
      {entries.length === 0 ? (
        <Text
          fz={18}
          fw={600}
          c="dimmed"
          style={{ fontVariantNumeric: 'tabular-nums', marginTop: 4 }}
        >
          —
        </Text>
      ) : (
        <Stack gap={2} mt={4}>
          {entries.map(([currency, amount], i) => (
            <Text
              key={currency}
              fz={i === 0 ? 18 : 13}
              fw={700}
              c={positive ? 'teal' : 'red'}
              style={{
                fontVariantNumeric: 'tabular-nums',
                opacity: i === 0 ? 1 : 0.7,
                letterSpacing: '-0.01em',
              }}
            >
              {positive ? '+' : '−'}
              {formatMoney(Math.abs(amount), currency)
                .replace('−', '')
                .replace('-', '')}
            </Text>
          ))}
        </Stack>
      )}
    </div>
  );
}

function NetWorthSummary({ accounts }: { accounts: AccountDto[] }) {
  const { totals, assets, liabilities, primary, currencies } = useMemo(() => {
    const totals: Record<string, number> = {};
    const assets: Record<string, number> = {};
    const liabilities: Record<string, number> = {};
    const counts: Record<string, number> = {};

    for (const account of accounts) {
      const { currency } = account;
      const amount = Number(account.balance.amount);
      totals[currency] = (totals[currency] ?? 0) + amount;
      counts[currency] = (counts[currency] ?? 0) + 1;
      if (amount > 0) assets[currency] = (assets[currency] ?? 0) + amount;
      else if (amount < 0)
        liabilities[currency] = (liabilities[currency] ?? 0) + Math.abs(amount);
    }

    const primary =
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'GBP';

    return {
      totals,
      assets,
      liabilities,
      primary,
      currencies: Object.keys(totals),
    };
  }, [accounts]);

  const primaryTotal = totals[primary] ?? 0;
  const secondaryCurrencies = currencies.filter((c) => c !== primary);

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
        <div style={{ minWidth: 240 }}>
          <Text
            size="xs"
            fw={600}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: '0.06em' }}
          >
            Net worth
          </Text>
          <Group align="baseline" gap="md" mt={8} wrap="wrap">
            <Text
              fz={36}
              fw={700}
              c={isNegative(primaryTotal) ? 'red' : undefined}
              style={{
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {formatMoney(primaryTotal, primary)}
            </Text>
            {secondaryCurrencies.map((c) => (
              <Text
                key={c}
                fz={16}
                fw={600}
                c="dimmed"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatMoney(totals[c], c)}
              </Text>
            ))}
          </Group>
          <Text size="xs" c="dimmed" mt={6}>
            Across {accounts.length}{' '}
            {accounts.length === 1 ? 'account' : 'accounts'} in{' '}
            {currencies.length}{' '}
            {currencies.length === 1 ? 'currency' : 'currencies'}
          </Text>
        </div>

        <Group gap="lg" align="flex-start">
          <SummaryBlock label="Assets" totals={assets} positive />
          <div
            style={{
              width: 1,
              alignSelf: 'stretch',
              background: 'var(--mantine-color-gray-2)',
            }}
          />
          <SummaryBlock
            label="Liabilities"
            totals={liabilities}
            positive={false}
          />
        </Group>
      </Group>
    </Card>
  );
}

// ── Empty state ──────────────────────────────────────────────

function EmptyIllustration() {
  return (
    <svg
      width="200"
      height="120"
      viewBox="0 0 200 120"
      fill="none"
      style={{ display: 'block', margin: '0 auto' }}
    >
      <rect
        x="30"
        y="20"
        width="140"
        height="60"
        rx="10"
        fill="white"
        stroke="var(--mantine-color-gray-3)"
        strokeWidth="1.5"
        transform="rotate(-6 100 50)"
      />
      <rect
        x="30"
        y="30"
        width="140"
        height="60"
        rx="10"
        fill="var(--mantine-color-blue-0)"
        stroke="var(--mantine-color-blue-2)"
        strokeWidth="1.5"
      />
      <g>
        <rect
          x="30"
          y="40"
          width="140"
          height="64"
          rx="12"
          fill="var(--mantine-color-blue-6)"
        />
        <circle cx="48" cy="58" r="8" fill="white" opacity="0.9" />
        <path
          d="M44 58 L52 58 M44 60 L52 60"
          stroke="var(--mantine-color-blue-6)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <rect
          x="64"
          y="54"
          width="60"
          height="6"
          rx="3"
          fill="white"
          opacity="0.4"
        />
        <rect
          x="64"
          y="66"
          width="40"
          height="6"
          rx="3"
          fill="white"
          opacity="0.25"
        />
        <rect
          x="40"
          y="84"
          width="80"
          height="6"
          rx="3"
          fill="white"
          opacity="0.15"
        />
        <rect
          x="128"
          y="84"
          width="20"
          height="6"
          rx="3"
          fill="var(--mantine-color-teal-4)"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

function EmptyTrait({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <Text size="sm" fw={700} mb={4}>
        {title}
      </Text>
      <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
        {body}
      </Text>
    </div>
  );
}

function AccountsEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ padding: '32px 0 64px', maxWidth: 720, margin: '0 auto' }}>
      <Card
        withBorder
        shadow="sm"
        radius="lg"
        p={0}
        style={{ overflow: 'hidden' }}
      >
        <div
          style={{
            padding: '56px 32px 40px',
            textAlign: 'center',
            background:
              'radial-gradient(120% 100% at 50% 0%, var(--mantine-color-blue-0) 0%, var(--mantine-color-white) 60%)',
            borderBottom: '1px solid var(--mantine-color-gray-2)',
          }}
        >
          <EmptyIllustration />
          <Text
            fz={24}
            fw={700}
            mt={28}
            mb={8}
            style={{ letterSpacing: '-0.01em' }}
          >
            No accounts yet
          </Text>
          <Text
            size="sm"
            c="dimmed"
            maw={420}
            mx="auto"
            style={{ lineHeight: 1.6 }}
          >
            Track all your bank accounts, credit cards and savings in one place.
            Connect through open banking, or add an account manually if your
            provider isn't supported.
          </Text>
          <Group justify="center" gap={10} mt={24} wrap="wrap">
            <Button leftSection={<IconPlus size={16} />} onClick={onAdd}>
              Connect a bank
            </Button>
            <Button variant="outline" onClick={onAdd}>
              Add manually
            </Button>
          </Group>
        </div>

        <div
          style={{
            padding: '20px 24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 16,
          }}
        >
          <EmptyTrait
            title="Read-only by design"
            body="Guallet never moves money. We only read balances and transactions."
          />
          <EmptyTrait
            title="Multi-currency"
            body="Hold accounts in different currencies — totals stay separate, never converted behind your back."
          />
          <EmptyTrait
            title="Self-host or cloud"
            body="Your financial data stays yours. Use our hosted version or run Guallet on your own server."
          />
        </div>
      </Card>
    </div>
  );
}

// ── Main screen ──────────────────────────────────────────────

export function AccountListScreen() {
  const navigate = useNavigate();
  const { accounts, isLoading } = useAccounts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => a.name.toLowerCase().includes(q));
  }, [accounts, searchQuery]);

  const groupedAccounts = useMemo<
    { type: AccountTypeDto; data: AccountDto[] }[]
  >(() => {
    const map: Record<string, AccountDto[]> = {};
    for (const account of filteredAccounts) {
      const key = account.type;
      if (!map[key]) map[key] = [];
      map[key].push(account);
    }
    return GROUP_ORDER.filter((type) => map[type]?.length > 0).map((type) => ({
      type,
      data: map[type],
    }));
  }, [filteredAccounts]);

  function goToAddAccount() {
    navigate({ to: '/accounts/new' });
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <AccountsHeader
        onAddNewAccount={goToAddAccount}
        onSearchQueryChanged={setSearchQuery}
      />
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          paddingTop: 16,
          paddingBottom: 32,
        }}
      >
        {!isLoading && (!accounts || accounts.length === 0) ? (
          <AccountsEmptyState onAdd={goToAddAccount} />
        ) : (
          <>
            {accounts && accounts.length > 0 && (
              <NetWorthSummary accounts={accounts} />
            )}

            {groupedAccounts.map(({ type, data }) => (
              <Card key={type} withBorder shadow="sm" radius="lg" p={0}>
                <AccountsListHeader accountType={type} accounts={data} />
                {data.map((account, i) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    isLast={i === data.length - 1}
                    onClick={() =>
                      navigate({
                        to: '/accounts/$id',
                        params: { id: account.id },
                      })
                    }
                  />
                ))}
              </Card>
            ))}

            {accounts && accounts.length > 0 && (
              <Card
                withBorder
                radius="lg"
                p="lg"
                style={{
                  background: 'transparent',
                  boxShadow: 'none',
                  borderStyle: 'dashed',
                  borderColor: 'var(--mantine-color-gray-4)',
                }}
              >
                <Group
                  justify="space-between"
                  align="center"
                  gap="md"
                  wrap="wrap"
                >
                  <div>
                    <Text size="sm" fw={600}>
                      Missing an account?
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      Connect via open banking, or add a manual account for
                      cash, crypto or anything else.
                    </Text>
                  </div>
                  <Group gap={8}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToAddAccount}
                    >
                      Add manually
                    </Button>
                    <Button
                      size="sm"
                      leftSection={<IconPlus size={14} />}
                      onClick={goToAddAccount}
                    >
                      Connect a bank
                    </Button>
                  </Group>
                </Group>
              </Card>
            )}
          </>
        )}
      </div>
    </BaseScreen>
  );
}
