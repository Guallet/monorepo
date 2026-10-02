import {
  AccountDto,
  AccountTypeDto,
  type CreateAccountRequest,
} from '@guallet/api-client';

type PropertyKey =
  | 'accountNumber'
  | 'sortCode'
  | 'overdraft'
  | 'interestRate'
  | 'creditLimit'
  | 'cycleDay'
  | 'propertyValue'
  | 'mortgageAmount'
  | 'termLength'
  | 'loanAmount';
export type PropertyValues = Record<PropertyKey, string>;
type PropertyField = { key: PropertyKey; label: string; numeric?: boolean };

export const PROPERTY_FIELDS: Partial<Record<AccountTypeDto, PropertyField[]>> =
  {
    [AccountTypeDto.CURRENT_ACCOUNT]: [
      { key: 'accountNumber', label: 'Account number' },
      { key: 'sortCode', label: 'Sort code' },
      { key: 'overdraft', label: 'Overdraft limit', numeric: true },
    ],
    [AccountTypeDto.CREDIT_CARD]: [
      { key: 'accountNumber', label: 'Account number' },
      { key: 'interestRate', label: 'Interest rate (%)', numeric: true },
      { key: 'creditLimit', label: 'Credit limit', numeric: true },
      { key: 'cycleDay', label: 'Billing cycle day', numeric: true },
    ],
    [AccountTypeDto.SAVINGS]: [
      { key: 'interestRate', label: 'Interest rate (%)', numeric: true },
    ],
    [AccountTypeDto.MORTGAGE]: [
      { key: 'propertyValue', label: 'Property value', numeric: true },
      { key: 'mortgageAmount', label: 'Mortgage amount', numeric: true },
      { key: 'interestRate', label: 'Interest rate (%)', numeric: true },
      { key: 'termLength', label: 'Term length (years)', numeric: true },
    ],
    [AccountTypeDto.LOAN]: [
      { key: 'loanAmount', label: 'Loan amount', numeric: true },
      { key: 'interestRate', label: 'Interest rate (%)', numeric: true },
      { key: 'termLength', label: 'Term length (years)', numeric: true },
    ],
  };

export function getPropertyValues(account?: AccountDto | null): PropertyValues {
  const values = Object.fromEntries(
    [
      ...new Set(
        Object.values(PROPERTY_FIELDS)
          .flatMap((fields) => fields ?? [])
          .map((field) => field.key),
      ),
    ].map((key) => [key, '']),
  ) as PropertyValues;
  if (!account?.properties) return values;
  const properties = account.properties;
  for (const field of PROPERTY_FIELDS[account.type] ?? []) {
    let value: string | number | null | undefined;
    if (
      account.type === AccountTypeDto.CURRENT_ACCOUNT &&
      field.key === 'accountNumber'
    ) {
      value =
        'details' in properties ? properties.details.accountNumber : undefined;
    } else if (
      account.type === AccountTypeDto.CURRENT_ACCOUNT &&
      field.key === 'sortCode'
    ) {
      value = 'details' in properties ? properties.details.sortCode : undefined;
    } else {
      value = (properties as unknown as Record<string, string | number | null>)[
        field.key
      ];
    }
    values[field.key] = value == null ? '' : String(value);
  }
  return values;
}

export function parseAccountProperties(
  type: AccountTypeDto,
  values: PropertyValues,
): { properties: CreateAccountRequest['properties']; error?: string } {
  const fields = PROPERTY_FIELDS[type] ?? [];
  if (!fields.length || fields.every((field) => !values[field.key]?.trim()))
    return { properties: null };
  const parsed: Record<string, string | number | null> = {};
  for (const field of fields) {
    const input = values[field.key]?.trim() ?? '';
    if (!field.numeric) {
      parsed[field.key] = input;
      continue;
    }
    if (!input) {
      if (type !== AccountTypeDto.CURRENT_ACCOUNT) {
        return {
          properties: null,
          error: `Enter ${field.label.toLowerCase()} to save these account details.`,
        };
      }
      parsed[field.key] = null;
      continue;
    }
    const number = Number(input.replace(',', '.'));
    if (
      !Number.isFinite(number) ||
      number < 0 ||
      (field.key === 'cycleDay' &&
        (!Number.isInteger(number) || number < 1 || number > 31))
    ) {
      return {
        properties: null,
        error: `Enter a valid ${field.label.toLowerCase()}.`,
      };
    }
    parsed[field.key] = number;
  }
  if (type === AccountTypeDto.CURRENT_ACCOUNT) {
    return {
      properties: {
        details: {
          accountNumber: String(parsed.accountNumber),
          sortCode: String(parsed.sortCode),
        },
        overdraft: parsed.overdraft as number | null,
      },
    };
  }
  return {
    properties: parsed as unknown as CreateAccountRequest['properties'],
  };
}

export function getVisibleAccountProperties(
  account: AccountDto,
): Array<{ label: string; value: string }> {
  const values = getPropertyValues(account);
  return (PROPERTY_FIELDS[account.type] ?? []).flatMap((field) => {
    const value = values[field.key];
    if (!value) return [];
    if (field.key === 'accountNumber')
      return [{ label: field.label, value: `•••• ${value.slice(-4)}` }];
    if (field.key === 'sortCode')
      return [{ label: field.label, value: `••-${value.slice(-2)}` }];
    if (field.key === 'interestRate')
      return [{ label: 'Interest rate', value: `${value}%` }];
    if (field.key === 'termLength')
      return [{ label: 'Term length', value: `${value} years` }];
    if (field.key === 'cycleDay') return [{ label: field.label, value }];
    return [
      {
        label: field.label,
        value: field.numeric ? `${account.currency} ${value}` : value,
      },
    ];
  });
}
