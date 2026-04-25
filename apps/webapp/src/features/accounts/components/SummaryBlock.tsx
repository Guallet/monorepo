import { Money } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import { Box, Stack, Text } from '@mantine/core';

function formatMoney(amount: number, currency: string): string {
  return Money.fromCurrencyCode({ amount, currencyCode: currency }).format();
}

interface SummaryBlockProps {
  label: string;
  totals: Record<string, number>;
  positive: boolean;
}

export function SummaryBlock({
  label,
  totals,
  positive,
}: Readonly<SummaryBlockProps>) {
  const { spacing } = useTheme();
  const entries = Object.entries(totals);

  return (
    <Box miw={120}>
      <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>
        {label}
      </Text>
      {entries.length === 0 ? (
        <Text
          fz={18}
          fw={600}
          c="dimmed"
          mt={spacing.xs}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          —
        </Text>
      ) : (
        <Stack gap={2} mt={spacing.xs}>
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
              {formatMoney(Math.abs(amount), currency).replace('−', '').replace('-', '')}
            </Text>
          ))}
        </Stack>
      )}
    </Box>
  );
}
