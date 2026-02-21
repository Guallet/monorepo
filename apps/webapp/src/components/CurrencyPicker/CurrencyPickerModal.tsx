import { Currency, ISO4217Currencies } from '@guallet/money';
import { SearchBoxInput, useIsMobile } from '@guallet/ui-react';
import {
  ScrollArea,
  Group,
  UnstyledButton,
  Button,
  Text,
  Flex,
  Center,
  Divider,
} from '@mantine/core';
import { useMemo, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import classes from './CurrencyPicker.module.css';

const currencyCodes = Object.values(ISO4217Currencies)
  .sort((a, b) => a.code.localeCompare(b.code))
  .map((currency) => {
    return Currency.fromISOCode(currency.code);
  });

interface CurrencyPickerModalProps {
  initialCurrency?: Currency | null;
  onCurrencySelected: (currency: Currency) => void;
  onCancel: () => void;
}

function CurrencyItem({
  currency,
  isSelected,
  onSelect,
}: {
  currency: Currency;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <UnstyledButton
      className={classes.currencyItem}
      data-selected={isSelected || undefined}
      onClick={onSelect}
    >
      <Group wrap="nowrap" justify="space-between" w="100%">
        <Group wrap="nowrap" gap="md">
          <Center
            className={classes.currencyIcon}
            data-selected={isSelected || undefined}
          >
            <Text
              className={classes.currencySymbol}
              c={isSelected ? 'blue' : 'dark'}
              style={{
                fontSize:
                  currency.symbol.length > 3
                    ? '10px'
                    : currency.symbol.length > 2
                      ? '12px'
                      : '14px',
              }}
            >
              {currency.symbol}
            </Text>
          </Center>
          <Text fw={isSelected ? 600 : 400} size="sm">
            {currency.name}
          </Text>
        </Group>
        <Group wrap="nowrap" gap="xs">
          <Text
            c={isSelected ? 'blue' : 'dimmed'}
            size="sm"
            fw={isSelected ? 600 : 500}
          >
            {currency.code}
          </Text>
          {isSelected && (
            <IconCheck size={16} color="var(--mantine-color-blue-filled)" />
          )}
        </Group>
      </Group>
    </UnstyledButton>
  );
}

export function CurrencyPickerModal({
  initialCurrency,
  onCurrencySelected,
  onCancel,
}: Readonly<CurrencyPickerModalProps>) {
  const isMobile = useIsMobile();
  const defaultCurrencyCode = useDefaultCurrency();
  const [query, setQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    initialCurrency || null,
  );

  const { defaultCurrency, otherCurrencies } = useMemo(() => {
    let filtered = currencyCodes;
    if (query !== '' && query !== null && query !== undefined) {
      filtered = currencyCodes.filter((currency) =>
        JSON.stringify(currency).toLowerCase().includes(query.toLowerCase()),
      );
    }

    const defaultCurr = filtered.find((c) => c.code === defaultCurrencyCode);
    const others = filtered.filter((c) => c.code !== defaultCurrencyCode);

    return { defaultCurrency: defaultCurr, otherCurrencies: others };
  }, [query, defaultCurrencyCode]);

  return (
    <Flex
      align="stretch"
      justify="center"
      direction="column"
      gap="sm"
      style={{
        height: isMobile ? 'calc(100dvh - 80px)' : '500px',
      }}
    >
      <SearchBoxInput
        query={query}
        onSearchQueryChanged={(newQuery) => {
          setQuery(newQuery);
        }}
        placeholder="Search currencies"
      />
      <ScrollArea type="scroll" scrollbars="y" style={{ flex: 1 }}>
        {!defaultCurrency && otherCurrencies.length === 0 && (
          <Text>No currencies found</Text>
        )}
        <Flex direction="column" gap={4}>
          {defaultCurrency && (
            <>
              <CurrencyItem
                currency={defaultCurrency}
                isSelected={selectedCurrency?.code === defaultCurrency.code}
                onSelect={() => setSelectedCurrency(defaultCurrency)}
              />
              {otherCurrencies.length > 0 && <Divider my="xs" />}
            </>
          )}
          {otherCurrencies.map((currency) => (
            <CurrencyItem
              key={currency.code}
              currency={currency}
              isSelected={selectedCurrency?.code === currency.code}
              onSelect={() => setSelectedCurrency(currency)}
            />
          ))}
        </Flex>
      </ScrollArea>
      <Group justify="end" mt="md">
        <Button variant="transparent" color="dark" onClick={() => onCancel()}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (selectedCurrency) {
              onCurrencySelected(selectedCurrency);
            }
          }}
          disabled={!selectedCurrency}
        >
          Confirm
        </Button>
      </Group>
    </Flex>
  );
}
