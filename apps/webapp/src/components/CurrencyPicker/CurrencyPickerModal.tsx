import { Currency, ISO4217Currencies } from '@guallet/money';
import { useUserSettings } from '@guallet/api-react';
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
import { useTranslation } from 'react-i18next';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import classes from './CurrencyPicker.module.css';

const currencyCodes = Object.values(ISO4217Currencies)
  .sort((a, b) => a.code.localeCompare(b.code))
  .map((currency) => {
    return Currency.fromISOCode(currency.code);
  });

interface CurrencyPickerModalProps {
  selectionMode?: 'single' | 'multiple';
  initialCurrency?: Currency | null;
  initialCurrencies?: Currency[];
  onCurrencySelected?: (currency: Currency) => void;
  onCurrenciesSelected?: (currencies: Currency[]) => void;
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
  selectionMode = 'single',
  initialCurrency,
  initialCurrencies,
  onCurrencySelected,
  onCurrenciesSelected,
  onCancel,
}: Readonly<CurrencyPickerModalProps>) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { settings } = useUserSettings();
  const defaultCurrencyCode = useDefaultCurrency();
  const [query, setQuery] = useState('');
  const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>(
    selectionMode === 'multiple'
      ? (initialCurrencies ?? [])
      : initialCurrency
        ? [initialCurrency]
        : [],
  );

  const { prioritizedCurrencies, otherCurrencies } = useMemo(() => {
    let filtered = currencyCodes;
    if (query !== '' && query !== null && query !== undefined) {
      filtered = currencyCodes.filter((currency) =>
        JSON.stringify(currency).toLowerCase().includes(query.toLowerCase()),
      );
    }

    const preferredCurrencyCodes =
      settings?.currencies.preferred_currencies ?? [];
    const prioritizedCurrencyCodes = [
      defaultCurrencyCode,
      ...preferredCurrencyCodes,
    ]
      .filter((currencyCode) => currencyCode !== undefined)
      .filter(
        (currencyCode, index, array) => array.indexOf(currencyCode) === index,
      );

    const prioritized = prioritizedCurrencyCodes
      .map((currencyCode) =>
        filtered.find((currency) => currency.code === currencyCode),
      )
      .filter((currency): currency is Currency => currency !== undefined);

    const prioritizedCurrencyCodeSet = new Set(
      prioritized.map((currency) => currency.code),
    );
    const others = filtered.filter(
      (currency) => !prioritizedCurrencyCodeSet.has(currency.code),
    );

    return { prioritizedCurrencies: prioritized, otherCurrencies: others };
  }, [query, defaultCurrencyCode, settings?.currencies.preferred_currencies]);

  const isCurrencySelected = (currency: Currency) =>
    selectedCurrencies.some((selected) => selected.code === currency.code);

  const onCurrencyPress = (currency: Currency) => {
    if (selectionMode === 'single') {
      onCurrencySelected?.(currency);
      onCancel();
      return;
    }

    setSelectedCurrencies((currentSelected) => {
      const isSelected = currentSelected.some(
        (selected) => selected.code === currency.code,
      );

      if (isSelected) {
        return currentSelected.filter(
          (selected) => selected.code !== currency.code,
        );
      }

      return [...currentSelected, currency];
    });
  };

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
        placeholder={t('components.currencyPickerModal.search.placeholder')}
      />
      <ScrollArea type="scroll" scrollbars="y" style={{ flex: 1 }}>
        {prioritizedCurrencies.length === 0 && otherCurrencies.length === 0 && (
          <Text>
            {t('components.currencyPickerModal.emptyState.noCurrencies')}
          </Text>
        )}
        <Flex direction="column" gap={4}>
          {prioritizedCurrencies.length > 0 && (
            <>
              <Text size="xs" c="dimmed" px="xs">
                {t('components.currencyPickerModal.sections.suggested')}
              </Text>
              {prioritizedCurrencies.map((currency) => (
                <CurrencyItem
                  key={currency.code}
                  currency={currency}
                  isSelected={isCurrencySelected(currency)}
                  onSelect={() => onCurrencyPress(currency)}
                />
              ))}
              {otherCurrencies.length > 0 && <Divider my="xs" />}
            </>
          )}
          {otherCurrencies.map((currency) => (
            <CurrencyItem
              key={currency.code}
              currency={currency}
              isSelected={isCurrencySelected(currency)}
              onSelect={() => onCurrencyPress(currency)}
            />
          ))}
        </Flex>
      </ScrollArea>
      <Group justify="end" mt="md">
        <Button variant="outline" onClick={() => onCancel()}>
          {t('components.currencyPickerModal.buttons.cancel')}
        </Button>
        {selectionMode === 'multiple' && (
          <Button
            onClick={() => {
              onCurrenciesSelected?.(selectedCurrencies);
            }}
            disabled={selectedCurrencies.length === 0}
          >
            {t('components.currencyPickerModal.buttons.confirm')}
          </Button>
        )}
      </Group>
    </Flex>
  );
}
