export class MoneyError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'MoneyError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidCurrencyError extends MoneyError {
  constructor(message?: string) {
    super(message);
    this.name = 'InvalidCurrencyError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidAmountError extends TypeError {
  constructor(message?: string) {
    super(message);
    this.name = 'InvalidAmountError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CurrencyMismatchError extends MoneyError {
  constructor(message?: string) {
    super(message);
    this.name = 'CurrencyMismatchError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DivideByZeroError extends MoneyError {
  constructor(message?: string) {
    super(message);
    this.name = 'DivideByZeroError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidExchangeRateError extends TypeError {
  constructor(message?: string) {
    super(message);
    this.name = 'InvalidExchangeRateError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
