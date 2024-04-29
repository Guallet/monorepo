import { json } from "./../data/data";

type IsoCurrency = {
  country: string;
  name: string;
  code: string;
  decimalPlaces: string | number;
};

// Thanks to https://github.com/Virtual-Finland-Development/codesets/blob/3de13cc1bec4641d6cf2f025c564c46f54ae4230/src/resources/library/ISO4217Currencies.ts
// for this code
const transformed = json.$data[0].$data.reduce(
  (acc: Record<string, IsoCurrency>, blob) => {
    const blobData = blob.$data;
    const name = blobData.find((item) => item.$name === "CcyNm")?.$data ?? "";
    const code = blobData.find((item) => item.$name === "Ccy")?.$data ?? "";
    const country =
      blobData.find((item) => item.$name === "CtryNm")?.$data ?? "";
    const decimalPlaces =
      blobData.find((item) => item.$name === "CcyMnrUnts")?.$data ?? "";

    if (typeof acc[code] === "undefined") {
      // Pick the first one in the dataset, prevent duplicate ids
      acc[code] = {
        name: `${name}`,
        code: `${code}`,
        country: `${country}`,
        decimalPlaces: decimalPlaces,
      };
    }
    return acc;
  },
  {} as Record<string, IsoCurrency>
);

export const CURRENCIES = transformed;
export const CURRENCIES_ARRAY = Object.values(transformed);
