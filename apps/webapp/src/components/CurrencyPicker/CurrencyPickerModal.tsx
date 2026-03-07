import { useUserSettings } from '@guallet/api-react';
import { Currency, ISO4217Currencies } from '@guallet/money';
import { SearchBoxInput, useIsMobile } from '@guallet/ui-react';
import { IconCheck } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { cn } from '@/lib/utils';

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
  let symbolSizeClass = 'text-sm';
  if (currency.symbol.length > 3) {
    symbolSizeClass = 'text-[10px]';
  } else if (currency.symbol.length > 2) {
    symbolSizeClass = 'text-xs';
  }

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors hover:bg-accent',
        isSelected ? 'bg-primary/10' : 'bg-background',
      )}
      onClick={onSelect}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex size-8 items-center justify-center rounded-full border bg-muted',
            isSelected
              ? 'border-primary/30 bg-primary/10'
              : 'border-transparent',
          )}
        >
          <span
            className={cn(
              'font-medium leading-none text-foreground',
              symbolSizeClass,
            )}
          >
            {currency.symbol}
          </span>
        </div>
        <span
          className={cn(
            'truncate text-sm text-foreground',
            isSelected ? 'font-semibold' : 'font-normal',
          )}
        >
          {currency.name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm',
            isSelected
              ? 'font-semibold text-primary'
              : 'font-medium text-muted-foreground',
          )}
        >
          {currency.code}
        </span>
        {isSelected ? <IconCheck size={16} className="text-primary" /> : null}
      </div>
    </button>
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

  let initialSelectedCurrencies: Currency[] = [];
  if (selectionMode === 'multiple') {
    initialSelectedCurrencies = initialCurrencies ?? [];
  } else if (initialCurrency) {
    initialSelectedCurrencies = [initialCurrency];
  }

  const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>(
    initialSelectedCurrencies,
  );

  const { prioritizedCurrencies, otherCurrencies } = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let filtered = currencyCodes;

    if (normalizedQuery !== '') {
      filtered = currencyCodes.filter((currency) =>
        JSON.stringify(currency).toLowerCase().includes(normalizedQuery),
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
    <div
      className="flex flex-col gap-3"
      style={{ height: isMobile ? 'calc(100dvh - 80px)' : '500px' }}
    >
      <SearchBoxInput
        query={query}
        onSearchQueryChanged={setQuery}
        placeholder={t('components.currencyPickerModal.search.placeholder')}
      />

      <div className="flex-1 overflow-y-auto rounded-md border p-1">
        {prioritizedCurrencies.length === 0 && otherCurrencies.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">
            {t('components.currencyPickerModal.emptyState.noCurrencies')}
          </p>
        ) : null}

        <div className="flex flex-col gap-1">
          {prioritizedCurrencies.length > 0 ? (
            <>
              <p className="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                {t('components.currencyPickerModal.sections.suggested')}
              </p>
              {prioritizedCurrencies.map((currency) => (
                <CurrencyItem
                  key={currency.code}
                  currency={currency}
                  isSelected={isCurrencySelected(currency)}
                  onSelect={() => onCurrencyPress(currency)}
                />
              ))}
              {otherCurrencies.length > 0 ? (
                <Separator className="my-1" />
              ) : null}
            </>
          ) : null}

          {otherCurrencies.map((currency) => (
            <CurrencyItem
              key={currency.code}
              currency={currency}
              isSelected={isCurrencySelected(currency)}
              onSelect={() => onCurrencyPress(currency)}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          {t('components.currencyPickerModal.buttons.cancel')}
        </Button>

        {selectionMode === 'multiple' ? (
          <Button
            onClick={() => {
              onCurrenciesSelected?.(selectedCurrencies);
            }}
            disabled={selectedCurrencies.length === 0}
          >
            {t('components.currencyPickerModal.buttons.confirm')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
