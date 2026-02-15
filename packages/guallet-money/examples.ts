/**
 * Examples demonstrating the @guallet/money package usage
 * Run this file with: npx tsx examples.ts
 */

import { Money, Currency } from './src/index';

console.log('=== @guallet/money Examples ===\n');

// ===== Creating Money =====
console.log('1. Creating Money:');
const price = Money.fromCurrencyCode({ amount: 99.99, currencyCode: 'GBP' });
console.log('Price:', price.format());

const zero = Money.zero(Currency.fromISOCode('EUR'));
console.log('Zero EUR:', zero.format());
console.log();

// ===== Arithmetic Operations =====
console.log('2. Arithmetic Operations:');
const base = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });
console.log('Base:', base.format());

const tax = base.multiply(0.2);
console.log('Tax (20%):', tax.format());

const total = base.add(tax);
console.log('Total:', total.format());

const discount = total.multiply(0.1);
console.log('Discount (10%):', discount.format());

const finalPrice = total.subtract(discount);
console.log('Final Price:', finalPrice.format());
console.log();

// ===== Comparisons =====
console.log('3. Comparisons:');
const money1 = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });
const money2 = Money.fromCurrencyCode({ amount: 50, currencyCode: 'GBP' });

console.log(`£100 > £50:`, money1.greaterThan(money2));
console.log(`£100 == £50:`, money1.equals(money2));
console.log(`£50 < £100:`, money2.lessThan(money1));
console.log();

// ===== Helper Methods =====
console.log('4. Helper Methods:');
const negative = Money.fromCurrencyCode({ amount: -42.5, currencyCode: 'EUR' });
console.log('Negative:', negative.format());
console.log('Absolute:', negative.abs().format());
console.log('Is negative?', negative.isNegative());
console.log('Is positive?', negative.isPositive());
console.log();

// ===== Rounding =====
console.log('5. Rounding:');
const precise = Money.fromCurrencyCode({ amount: 10.567, currencyCode: 'GBP' });
console.log('Original:', precise.format());
console.log('Rounded (currency default):', precise.round().format());
console.log('Rounded (0 decimals):', precise.round(0).format());
console.log('Rounded (1 decimal):', precise.round(1).format());
console.log();

// ===== Formatting Options =====
console.log('6. Formatting Options:');
const amount = Money.fromCurrencyCode({ amount: 1234.56, currencyCode: 'EUR' });
console.log('Default:', amount.format());
console.log('German locale:', amount.format('de-DE'));
console.log('No grouping:', amount.format({ useGrouping: false }));

const positive = Money.fromCurrencyCode({ amount: 50, currencyCode: 'GBP' });
console.log('With + sign:', positive.format({ showPositiveSign: true }));
console.log();

// ===== Currency Conversion =====
console.log('7. Currency Conversion:');
const eur = Money.fromCurrencyCode({ amount: 100, currencyCode: 'EUR' });
const gbp = Currency.fromISOCode('GBP');
const converted = eur.convertTo(gbp, 0.79); // 1 EUR = 0.79 GBP
console.log('EUR:', eur.format());
console.log('Converted to GBP:', converted.format());
console.log();

// ===== Currency Information =====
console.log('8. Currency Information:');
const currency = Currency.fromISOCode('JPY');
console.log('Code:', currency.code);
console.log('Name:', currency.name);
console.log('Symbol:', currency.symbol);
console.log('Decimal Places:', currency.decimalPlaces);
console.log('String:', currency.toString());
console.log();

// ===== Practical Example: Shopping Cart =====
console.log('9. Practical Example - Shopping Cart:');
interface CartItem {
  name: string;
  price: Money;
  quantity: number;
}

const cart: CartItem[] = [
  {
    name: 'Laptop',
    price: Money.fromCurrencyCode({ amount: 999.99, currencyCode: 'GBP' }),
    quantity: 1,
  },
  {
    name: 'Mouse',
    price: Money.fromCurrencyCode({ amount: 29.99, currencyCode: 'GBP' }),
    quantity: 2,
  },
  {
    name: 'Keyboard',
    price: Money.fromCurrencyCode({ amount: 79.99, currencyCode: 'GBP' }),
    quantity: 1,
  },
];

let subtotal = Money.zero(Currency.fromISOCode('GBP'));
cart.forEach((item) => {
  const itemTotal = item.price.multiply(item.quantity);
  console.log(`  ${item.name} x${item.quantity}: ${itemTotal.format()}`);
  subtotal = subtotal.add(itemTotal);
});

const taxRate = 0.08; // 8% tax
const taxAmount = subtotal.multiply(taxRate);
const total2 = subtotal.add(taxAmount);

console.log('  ---');
console.log('  Subtotal:', subtotal.format());
console.log('  Tax (8%):', taxAmount.format());
console.log('  Total:', total2.format());
console.log();

// ===== Error Handling =====
console.log('10. Error Handling Examples:');
try {
  Money.fromCurrencyCode({ amount: 100, currencyCode: 'INVALID' });
} catch (error) {
  console.log(
    'Invalid currency error:',
    (error as Error).message.substring(0, 50) + '...',
  );
}

try {
  const gbp2 = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });
  const eur2 = Money.fromCurrencyCode({ amount: 100, currencyCode: 'EUR' });
  gbp2.add(eur2);
} catch (error) {
  console.log('Currency mismatch error:', (error as Error).message);
}

try {
  Money.fromCurrencyCode({ amount: Number.NaN, currencyCode: 'GBP' });
} catch (error) {
  console.log('Invalid amount error:', (error as Error).message);
}

console.log('\n=== All examples completed successfully! ===');
