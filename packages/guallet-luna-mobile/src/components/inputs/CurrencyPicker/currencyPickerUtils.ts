/** The fields needed from a money Currency, without coupling Luna to the money package. */
export interface CurrencyPickerCurrency {
  code: string;
  name: string;
  symbol: string;
}

export interface CurrencySection {
  title: string;
  data: CurrencyPickerCurrency[];
}

function addPrioritySection(
  sections: CurrencySection[],
  remaining: Map<string, CurrencyPickerCurrency>,
  title: string,
  codes: string[],
) {
  const data: CurrencyPickerCurrency[] = [];
  for (const code of codes) {
    const normalized = code.trim().toUpperCase();
    const currency = remaining.get(normalized);
    if (currency) {
      data.push(currency);
      remaining.delete(normalized);
    }
  }
  if (data.length) sections.push({ title, data });
}

/** Keep a code in only one section, even when it is both default and preferred. */
export function getCurrencySections(
  currencies: CurrencyPickerCurrency[],
  query: string,
  defaultCurrencyCode?: string,
  preferredCurrencyCodes: string[] = [],
  showDefaultCurrency = true,
  showPreferredCurrencies = true,
): CurrencySection[] {
  const unique = new Map(
    currencies.map((currency) => [currency.code.toUpperCase(), currency]),
  );
  const search = query.trim().toLocaleLowerCase();
  const matching = [...unique.values()].filter((currency) =>
    [currency.name, currency.code, currency.symbol].some((field) =>
      field.toLocaleLowerCase().includes(search),
    ),
  );
  if (search)
    return matching.length ? [{ title: 'Results', data: matching }] : [];

  const remaining = new Map(
    matching.map((currency) => [currency.code.toUpperCase(), currency]),
  );
  const sections: CurrencySection[] = [];
  if (showDefaultCurrency && defaultCurrencyCode) {
    addPrioritySection(sections, remaining, 'Default currency', [
      defaultCurrencyCode,
    ]);
  }

  if (showPreferredCurrencies) {
    addPrioritySection(
      sections,
      remaining,
      'Preferred',
      preferredCurrencyCodes,
    );
  }

  if (remaining.size) {
    sections.push({
      title: 'All currencies',
      data: [...remaining.values()].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    });
  }
  return sections;
}
