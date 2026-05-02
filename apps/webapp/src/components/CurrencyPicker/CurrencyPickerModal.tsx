import { Currency, ISO4217Currencies } from '@guallet/money';
import { useUserSettings } from '@guallet/api-react';
import { SearchBoxInput, useIsMobile, useTheme } from '@guallet/ui-react';
import {
  ScrollArea,
  Group,
  UnstyledButton,
  Button,
  Text,
  Flex,
  Center,
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
}: Readonly<{
  currency: Currency;
  isSelected: boolean;
  onSelect: () => void;
}>) {
  const { colors, typography } = useTheme();

  return (
    <UnstyledButton
      className={classes.currencyItem}
      data-selected={isSelected || undefined}
      onClick={onSelect}
    >
      <Group wrap="nowrap" justify="space-between" w="100%">
        <Group wrap="nowrap" gap="sm">
          <Center
            className={classes.currencyIcon}
            data-selected={isSelected || undefined}
          >
            <Text
              className={classes.currencySymbol}
              c={isSelected ? colors.primary : colors.black}
              style={{
                fontSize:
                  currency.symbol.length > 3
                    ? '10px'
                    : currency.symbol.length > 2
                      ? `${typography.sizes.xs}px`
                      : `${typography.sizes.sm}px`,
              }}
            >
              {currency.symbol}
            </Text>
          </Center>
          <Text
            fw={
              isSelected
                ? typography.weights.semibold
                : typography.weights.regular
            }
            size="sm"
            c={isSelected ? colors.primary : colors.black}
            style={{ flex: 1 }}
          >
            {currency.name}
          </Text>
        </Group>
        <Group wrap="nowrap" gap="xs">
          <Text
            c={isSelected ? colors.primary : colors.midGrey}
            size="sm"
            fw={
              isSelected
                ? typography.weights.semibold
                : typography.weights.medium
            }
          >
            {currency.code}
          </Text>
          {isSelected && (
            <IconCheck size={typography.sizes.md} color={colors.primary} />
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
        placeholder={t(
          'components.currencyPickerModal.search.placeholder',
          'Search currencies…',
        )}
      />
      <ScrollArea type="scroll" scrollbars="y" style={{ flex: 1 }}>
        {prioritizedCurrencies.length === 0 && otherCurrencies.length === 0 && (
          <Text c="dimmed" size="sm" ta="center" py="xl">
            {t(
              'components.currencyPickerModal.emptyState.noCurrencies',
              'No currencies found',
            )}
          </Text>
        )}
        <Flex direction="column" gap={2}>
          {prioritizedCurrencies.length > 0 && (
            <>
              <Text className={classes.sectionLabel}>
                {t(
                  'components.currencyPickerModal.sections.suggested',
                  'Suggested',
                )}
              </Text>
              {prioritizedCurrencies.map((currency) => (
                <CurrencyItem
                  key={currency.code}
                  currency={currency}
                  isSelected={isCurrencySelected(currency)}
                  onSelect={() => onCurrencyPress(currency)}
                />
              ))}
            </>
          )}
          {otherCurrencies.length > 0 && (
            <>
              <Text className={classes.sectionLabel}>
                {t(
                  'components.currencyPickerModal.sections.all',
                  'All currencies',
                )}
              </Text>
              {otherCurrencies.map((currency) => (
                <CurrencyItem
                  key={currency.code}
                  currency={currency}
                  isSelected={isCurrencySelected(currency)}
                  onSelect={() => onCurrencyPress(currency)}
                />
              ))}
            </>
          )}
        </Flex>
      </ScrollArea>
      <Group grow gap="sm" mt="xs">
        <Button variant="default" onClick={() => onCancel()}>
          {t('components.currencyPickerModal.buttons.cancel', 'Cancel')}
        </Button>
        {selectionMode === 'multiple' && (
          <Button
            leftSection={<IconCheck size={16} />}
            onClick={() => {
              onCurrenciesSelected?.(selectedCurrencies);
            }}
            disabled={selectedCurrencies.length === 0}
          >
            {t('components.currencyPickerModal.buttons.confirm', 'Confirm')}
          </Button>
        )}
      </Group>
    </Flex>
  );
}
