# @guallet/money

A robust, type-safe library for handling money and currency operations in TypeScript/JavaScript applications. Follows ISO 4217 standards and provides immutable money objects with arithmetic operations.

## Features

- ✅ **Immutable**: All operations return new instances, ensuring data integrity
- ✅ **Type-safe**: Full TypeScript support with strict typing
- ✅ **ISO 4217 compliant**: Supports all standard currency codes
- ✅ **Arithmetic operations**: Add, subtract, multiply, divide with currency safety
- ✅ **Comparison methods**: Compare money values safely
- ✅ **Flexible formatting**: Localized currency formatting with customization
- ✅ **Cross-platform**: Works in Node.js, browsers, and React Native
- ✅ **Zero dependencies**: Lightweight and fast

## Installation

```bash
pnpm add @guallet/money
```

## Quick Start

```typescript
import { Money, Currency } from '@guallet/money';

// Create money from currency code
const price = Money.fromCurrencyCode({
  amount: 99.99,
  currencyCode: 'USD',
});

// Format with locale
console.log(price.format()); // "$99.99"
console.log(price.format('de-DE')); // "99,99 $"

// Arithmetic operations
const tax = price.multiply(0.2);
const total = price.add(tax);
console.log(total.format()); // "$119.99"

// Comparison
if (total.greaterThan(price)) {
  console.log('Total is higher than price');
}
```

## API Documentation

### Money Class

#### Creating Money

```typescript
// From currency code (most common)
const money1 = Money.fromCurrencyCode({
  amount: 100,
  currencyCode: 'GBP',
});

// From Currency instance
const currency = Currency.fromISOCode('EUR');
const money2 = Money.from(50, currency);

// Create zero money
const zero = Money.zero(currency);
```

#### Arithmetic Operations

All arithmetic operations return new Money instances and maintain immutability:

```typescript
const base = Money.fromCurrencyCode({ amount: 100, currencyCode: 'USD' });

// Addition (requires same currency)
const sum = base.add(Money.fromCurrencyCode({ amount: 50, currencyCode: 'USD' }));
// Result: $150.00

// Subtraction (requires same currency)
const diff = base.subtract(Money.fromCurrencyCode({ amount: 30, currencyCode: 'USD' }));
// Result: $70.00

// Multiplication
const doubled = base.multiply(2);
// Result: $200.00

// Division
const half = base.divide(2);
// Result: $50.00

// Absolute value
const negative = Money.fromCurrencyCode({ amount: -25, currencyCode: 'USD' });
const positive = negative.abs();
// Result: $25.00

// Negation
const negated = base.negate();
// Result: -$100.00

// Rounding
const precise = Money.fromCurrencyCode({ amount: 10.567, currencyCode: 'USD' });
const rounded = precise.round(); // Uses currency's decimal places
// Result: $10.57

const roundedCustom = precise.round(0);
// Result: $11.00
```

#### Comparison Methods

```typescript
const money1 = Money.fromCurrencyCode({ amount: 100, currencyCode: 'USD' });
const money2 = Money.fromCurrencyCode({ amount: 50, currencyCode: 'USD' });

money1.equals(money2); // false
money1.greaterThan(money2); // true
money1.greaterThanOrEqual(money2); // true
money1.lessThan(money2); // false
money1.lessThanOrEqual(money2); // false

// Convenience checks
money1.isZero(); // false
money1.isPositive(); // true
money1.isNegative(); // false
```

#### Formatting

```typescript
const money = Money.fromCurrencyCode({ amount: 1234.56, currencyCode: 'EUR' });

// Simple format with default locale
money.format(); // "€1,234.56"

// Format with specific locale
money.format('de-DE'); // "1.234,56 €"

// Format with options
money.format({
  locale: 'en-US',
  useGrouping: false, // No thousand separators
  showPositiveSign: true, // Show + for positive
});
// "+€1234.56"
```

#### Currency Conversion

```typescript
const usd = Money.fromCurrencyCode({ amount: 100, currencyCode: 'USD' });
const eur = Currency.fromISOCode('EUR');

// Convert with exchange rate (1 USD = 0.85 EUR)
const converted = usd.convertTo(eur, 0.85);
console.log(converted.format()); // "€85.00"
```

#### Serialization

```typescript
const money = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });

// To JSON
const json = money.toJSON();
// { amount: 100, currency: 'GBP' }

// To string
const str = money.toString();
// "£100.00"
```

### Currency Class

#### Creating Currency

```typescript
// From ISO code
const usd = Currency.fromISOCode('USD');
const eur = Currency.fromISOCode('EUR', 'de-DE'); // With custom locale

// Access properties
console.log(usd.code); // "USD"
console.log(usd.name); // "US Dollar"
console.log(usd.symbol); // "$"
console.log(usd.decimalPlaces); // 2
```

#### Currency Methods

```typescript
const usd = Currency.fromISOCode('USD');
const eur = Currency.fromISOCode('EUR');

// Compare currencies
usd.equals(eur); // false

// String representation
usd.toString(); // "USD (US Dollar)"
```

## Error Handling

The library throws descriptive errors for invalid operations:

```typescript
try {
  // Invalid currency code
  Money.fromCurrencyCode({ amount: 100, currencyCode: 'INVALID' });
} catch (error) {
  // Error: Invalid currency code: "INVALID". Must be a valid ISO 4217 code.
}

try {
  // Currency mismatch in operations
  const usd = Money.fromCurrencyCode({ amount: 100, currencyCode: 'USD' });
  const eur = Money.fromCurrencyCode({ amount: 100, currencyCode: 'EUR' });
  usd.add(eur);
} catch (error) {
  // Error: Currency mismatch: Cannot operate on USD and EUR
}

try {
  // Invalid amount
  Money.fromCurrencyCode({ amount: NaN, currencyCode: 'USD' });
} catch (error) {
  // TypeError: Invalid amount: NaN. Amount must be a valid number.
}
```

## Best Practices

### ✅ DO

```typescript
// Use fromCurrencyCode for most cases
const price = Money.fromCurrencyCode({ amount: 99.99, currencyCode: 'USD' });

// Store amounts as numbers, convert to Money when needed
interface Product {
  price: number;
  currency: string;
}

function displayPrice(product: Product) {
  return Money.fromCurrencyCode({
    amount: product.price,
    currencyCode: product.currency,
  }).format();
}

// Chain operations
const total = price
  .multiply(1.2) // Add 20% markup
  .round() // Round to currency precision
  .format(); // Display
```

### ❌ DON'T

```typescript
// Don't perform arithmetic on raw numbers
const price = 99.99;
const tax = price * 0.2; // ❌ Floating point errors

// Don't mix currencies without explicit conversion
const usd = Money.fromCurrencyCode({ amount: 100, currencyCode: 'USD' });
const eur = Money.fromCurrencyCode({ amount: 100, currencyCode: 'EUR' });
usd.add(eur); // ❌ Throws error

// Don't mutate Money instances (they're immutable anyway)
const money = Money.fromCurrencyCode({ amount: 100, currencyCode: 'USD' });
money.amount = 200; // ❌ Won't work (readonly)
```

## TypeScript Support

Full TypeScript support with strict typing:

```typescript
import { Money, Currency, MoneyFormatOptions } from '@guallet/money';

function calculateTax(price: Money, rate: number): Money {
  return price.multiply(rate);
}

const options: MoneyFormatOptions = {
  locale: 'en-US',
  useGrouping: true,
  showPositiveSign: false,
};
```

## Platform Compatibility

- ✅ Node.js 14+
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ React Native
- ✅ Server-side rendering (Next.js, etc.)

The library automatically detects the environment and uses appropriate locale defaults.

## License

MIT
