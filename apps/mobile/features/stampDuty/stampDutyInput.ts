export interface ParsedStampDutyPrice {
  price: number | null;
  error: string | null;
}

const MAX_PROPERTY_PRICE = 1_000_000_000_000;

export function formatStampDutyPriceText(text: string): string {
  if (!/^[\d,]*$/.test(text)) return text;
  const digits = text.replaceAll(',', '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function parseStampDutyPrice(text: string): ParsedStampDutyPrice {
  const value = text.trim();
  if (value === '') {
    return { price: null, error: 'Enter a property price.' };
  }

  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(value)) {
    return {
      price: null,
      error: 'Enter a whole-pound amount, such as £350,000.',
    };
  }

  const price = Number(value.replaceAll(',', ''));
  if (
    !Number.isSafeInteger(price) ||
    price <= 0 ||
    price > MAX_PROPERTY_PRICE
  ) {
    return {
      price: null,
      error: 'Enter a price greater than zero and up to one trillion pounds.',
    };
  }

  return { price, error: null };
}
