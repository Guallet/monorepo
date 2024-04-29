import { CURRENCIES } from "./iso_4217";

function getCurrencySymbol(code: string, locale: string | undefined): string {
  // TODO: Restore this code when it's possible to get the locale from the device
  // This code below doesn't work on React Native (at least on Android). Investigate how to fix it
  // const locale = navigator.language ?? undefined;
  // return (0)
  //   .toLocaleString([locale], {
  //     style: "currency",
  //     currency: code,
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0,
  //     currencySign: "standard",
  //     currencyDisplay: "narrowSymbol",
  //     useGrouping: true,
  //   })
  //   .replace(/\d/g, "")
  //   .trim();

  // RN Android compatible code
  try {
    return (0)
      .toLocaleString(locale, {
        style: "currency",
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        currencySign: "standard",
        currencyDisplay: "narrowSymbol",
        useGrouping: true,
      })
      .replace(/\d/g, "")
      .trim();
  } catch (e) {
    console.error(`Error getting currency symbol: ${code}`, {
      error: e,
      code: code,
    });
    return code;
  }
}

export class Currency {
  name: string;
  symbol: string;
  code: string;
  decimalPlaces: number;

  constructor(
    name: string,
    symbol: string,
    code: string,
    decimalPlaces: number
  ) {
    this.name = name;
    this.symbol = symbol;
    this.code = code;
    this.decimalPlaces = decimalPlaces;
  }

  static fromISOCode(
    code: string,
    locale: string | undefined = navigator.language
  ): Currency {
    const symbol = getCurrencySymbol(code, locale);
    const c = CURRENCIES[code];
    if (c) {
      return new Currency(c.name, symbol, code, Number(c.decimalPlaces));
    } else {
      throw new Error(
        `Currency ${code} not found. Is this a valid ISO 4217 code?. See https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml for valid data`
      );
    }
  }
}
