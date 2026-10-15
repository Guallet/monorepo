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
  currencyCode: 'GBP',
});

// Format with locale
console.log(price.format()); // "£99.99"
console.log(price.format('de-DE')); // "99,99 £"

// Arithmetic operations
const tax = price.multiply(0.2);
const total = price.add(tax);
console.log(total.format()); // "£119.99"

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
const base = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });

// Addition (requires same currency)
const sum = base.add(
  Money.fromCurrencyCode({ amount: 50, currencyCode: 'GBP' }),
);
// Result: £150.00

// Subtraction (requires same currency)
const diff = base.subtract(
  Money.fromCurrencyCode({ amount: 30, currencyCode: 'GBP' }),
);
// Result: £70.00

// Multiplication
const doubled = base.multiply(2);
// Result: £200.00

// Division
const half = base.divide(2);
// Result: £50.00

// Absolute value
const negative = Money.fromCurrencyCode({ amount: -25, currencyCode: 'GBP' });
const positive = negative.abs();
// Result: £25.00

// Negation
const negated = base.negate();
// Result: -£100.00

// Rounding (with modes)
// The `round` method accepts an optional `decimalPlaces` and a `mode` (default `HALF_UP`).
// Supported modes: `HALF_UP` (default), `HALF_EVEN` (bankers rounding), `DOWN`, `UP`, `TOWARDS_ZERO`.
const precise = Money.fromCurrencyCode({ amount: 10.567, currencyCode: 'GBP' });
const rounded = precise.round(); // Uses currency's decimal places (HALF_UP)
// Result: £10.57

// Custom decimal places
const roundedCustom = precise.round(0);
// Result: $11.00

// Rounding mode examples (ties):
const m = Money.fromCurrencyCode({ amount: 1.005, currencyCode: 'GBP' });
// Default HALF_UP (ties away from zero)
m.round(2, 'HALF_UP'); // 1.01
// HALF_EVEN (bankers rounding) rounds ties to the nearest even
m.round(2, 'HALF_EVEN'); // 1.00

// Note: For strict financial correctness consider storing amounts in minor units (e.g., cents)
// or using a Decimal library for high-precision accounting logic.
```

#### Comparison Methods

```typescript
const money1 = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });
const money2 = Money.fromCurrencyCode({ amount: 50, currencyCode: 'GBP' });

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
  locale: 'en-GB',
  useGrouping: false, // No thousand separators
  showPositiveSign: true, // Show + for positive
});
// "+€1234.56"
```

#### Currency Conversion

```typescript
const gbp = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });
const eur = Currency.fromISOCode('EUR');

// Convert with exchange rate (1 GBP = 0.85 EUR)
const converted = gbp.convertTo(eur, 0.85);
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
const gbp = Currency.fromISOCode('GBP');
const eur = Currency.fromISOCode('EUR', 'de-DE'); // With custom locale

// Access properties
console.log(gbp.code); // "GBP"
console.log(gbp.name); // "British Pound Sterling"
console.log(gbp.symbol); // "£"
console.log(gbp.decimalPlaces); // 2
```

#### Currency Methods

```typescript
const gbp2 = Currency.fromISOCode('GBP');
const eur = Currency.fromISOCode('EUR');

// Compare currencies
gbp2.equals(eur); // false

// String representation
gbp2.toString(); // "GBP (British Pound Sterling)"
```

## Error Handling

The library throws descriptive, domain-specific errors so you can handle cases precisely by type.

```typescript
import {
  InvalidCurrencyError,
  InvalidAmountError,
  CurrencyMismatchError,
  DivideByZeroError,
  InvalidExchangeRateError,
} from '@guallet/money';

// Invalid currency code
try {
  Money.fromCurrencyCode({ amount: 100, currencyCode: 'INVALID' });
} catch (error) {
  if (error instanceof InvalidCurrencyError) {
    // handle invalid currency
  }
}

// Currency mismatch in operations
try {
  const gbp = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });
  const eur = Money.fromCurrencyCode({ amount: 100, currencyCode: 'EUR' });
  gbp.add(eur);
} catch (error) {
  if (error instanceof CurrencyMismatchError) {
    // handle mismatched currencies
  }
}

// Invalid amount / divide by zero / invalid exchange rate
try {
  Money.fromCurrencyCode({ amount: NaN, currencyCode: 'GBP' });
} catch (error) {
  if (error instanceof InvalidAmountError) {
    // handle invalid amount
  }
}

try {
  Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' }).divide(0);
} catch (error) {
  if (error instanceof DivideByZeroError) {
    // handle division by zero
  }
}

try {
  Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' }).convertTo(
    eur,
    0,
  );
} catch (error) {
  if (error instanceof InvalidExchangeRateError) {
    // handle invalid exchange rate
  }
}
```

## Public API

The package exposes explicit named exports (no barrel re-exports):

```ts
import {
  Currency,
  Money,
  MoneyFormatOptions,
  RoundingMode,
  ISO4217Currencies,
  ISO4217CurrenciesArray,
  // Errors
  InvalidCurrencyError,
  InvalidAmountError,
  CurrencyMismatchError,
  DivideByZeroError,
  InvalidExchangeRateError,
} from '@guallet/money';
```

---

## Best Practices

### ✅ DO

```typescript
// Use fromCurrencyCode for most cases
const price = Money.fromCurrencyCode({ amount: 99.99, currencyCode: 'GBP' });

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
const gbp = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });
const eur = Money.fromCurrencyCode({ amount: 100, currencyCode: 'EUR' });
gbp.add(eur); // ❌ Throws error

// Don't mutate Money instances (they're immutable anyway)
const money = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });
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

Apache-2.0
