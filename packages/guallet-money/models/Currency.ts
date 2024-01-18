export class Currency {
  name: string;
  symbol: string;
  code: string;

  constructor(name: string, symbol: string, code: string) {
    this.name = name;
    this.symbol = symbol;
    this.code = code;
  }

  static fromCode(code: string): Currency {
    let currencyFormat = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    });

    const symbol =
      currencyFormat.formatToParts(0).find((part) => part.type === "currency")
        ?.value ?? code;

    return new Currency(code, symbol, code);
  }
}
