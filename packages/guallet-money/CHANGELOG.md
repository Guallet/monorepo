# Changelog

All notable changes to the @guallet/money package will be documented in this file.

## [0.2.0] - 2026-02-08

### Added

#### Money Class
- **Arithmetic operations**: `add()`, `subtract()`, `multiply()`, `divide()`
- **Comparison methods**: `equals()`, `greaterThan()`, `greaterThanOrEqual()`, `lessThan()`, `lessThanOrEqual()`
- **Helper methods**: `abs()`, `negate()`, `round()`, `isZero()`, `isPositive()`, `isNegative()`
- **Currency conversion**: `convertTo()` method with exchange rate support
- **Alternative constructor**: `Money.from()` for creating from Currency instance
- **Factory method**: `Money.zero()` for creating zero-value money
- **Serialization**: `toJSON()` and `toString()` methods
- **Format options**: Enhanced `format()` with `MoneyFormatOptions` interface
  - Custom locale
  - Grouping control
  - Positive sign display

#### Currency Class
- **Comparison method**: `equals()` for currency comparison
- **String representation**: `toString()` method

#### Type Safety & Validation
- Made all properties `readonly` for immutability
- Private constructors to enforce factory pattern usage
- Input validation with descriptive error messages
- Type-safe error handling (TypeError for type validation)

#### Platform Compatibility
- Removed `navigator.language` dependency
- Added environment detection for locale defaults
- Full Node.js, browser, and React Native support

#### Documentation
- Comprehensive README with API documentation
- Code examples demonstrating all features
- Best practices guide
- TypeScript examples
- Error handling guide

### Changed

- **Breaking**: Constructors are now private - use factory methods instead
- **Breaking**: Properties are now readonly (immutability enforced)
- Improved error messages with more context
- Better locale handling with fallbacks
- Enhanced type safety throughout

### Fixed

- Cross-platform compatibility (works in Node.js and React Native)
- Better error handling with appropriate error types
- Consistent behavior across different environments

### Migration Guide (0.1.0 → 0.2.0)

#### Before (0.1.0)
```typescript
const money = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });
money.format(); // Basic formatting only
// No arithmetic or comparison operations available
```

#### After (0.2.0)
```typescript
const money = Money.fromCurrencyCode({ amount: 100, currencyCode: 'GBP' });

// Enhanced formatting
money.format({ locale: 'en-US', showPositiveSign: true });

// Arithmetic operations
const doubled = money.multiply(2);
const sum = money.add(otherMoney);

// Comparisons
if (money.greaterThan(zero)) {
  // ...
}

// Helper methods
const absolute = money.abs();
const rounded = money.round();
```

## [0.1.0] - Initial Release

### Added
- Basic Money class with amount and currency
- Basic Currency class with ISO 4217 support
- Simple formatting with `format()` method
- `fromCurrencyCode()` factory method
