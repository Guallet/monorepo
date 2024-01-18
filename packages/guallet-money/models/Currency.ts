function getCurrencySymbol(code: string): string {
  return (0)
    .toLocaleString([], {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, "")
    .trim();

  // let currencyFormat = new Intl.NumberFormat(undefined, {
  //     style: "currency",
  //     currency: code,
  //   });

  // const symbol =
  //   currencyFormat.formatToParts(0).find((part) => part.type === "currency")
  //     ?.value ?? code;
}

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
    const symbol = getCurrencySymbol(code);

    return new Currency(code, symbol, code);
  }
}
