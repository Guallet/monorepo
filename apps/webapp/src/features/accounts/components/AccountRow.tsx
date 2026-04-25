import { AccountDto } from '@guallet/api-client';
import { useInstitution } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { AccountAvatar } from './AccountAvatar';

interface Props {
  account: AccountDto;
  isLast?: boolean;
  onClick?: () => void;
}

export function AccountRow({
  account,
  isLast = true,
  onClick,
}: Readonly<Props>) {
  const [hovered, setHovered] = useState(false);
  const { institution } = useInstitution(account.institutionId || null);
  const money = Money.fromCurrencyCode({
    amount: account.balance.amount,
    currencyCode: account.currency,
  });

  return (
    <UnstyledButton
      w="100%"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--mantine-color-gray-2)',
        background: hovered ? 'var(--mantine-color-gray-0)' : 'transparent',
        transition: 'background 150ms ease',
      }}
    >
      <AccountAvatar accountId={account.id} />
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text
          size="sm"
          fw={600}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {account.name}
        </Text>
        <Group gap={4} wrap="nowrap">
          <Text size="xs" c="dimmed">
            {institution ? institution.name : <em>Manual account</em>}
          </Text>
          <Text size="xs" c="dimmed" aria-hidden>
            ·
          </Text>
          <Text size="xs" c="dimmed">
            {account.currency}
          </Text>
        </Group>
      </Stack>
      <Text
        fw={700}
        fz={17}
        c={money.isNegative() ? 'red' : undefined}
        style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
      >
        {money.format()}
      </Text>
      <IconChevronRight
        size={16}
        style={{
          color: 'var(--mantine-color-dimmed)',
          flexShrink: 0,
          opacity: hovered ? 1 : 0.4,
          transition: 'opacity 150ms',
        }}
      />
    </UnstyledButton>
  );
}
