import {
  AccountTypeDto,
  CreditCardProperties,
  CurrentAccountProperties,
  LoanAccountProperties,
  MortgageAccountProperties,
  SavingAccountProperties,
} from '@guallet/api-client';
import { z } from 'zod';

export const accountFormBaseSchema = z.object({
  name: z.string().trim().min(1, { message: 'Account name is required' }),
  currency: z.string().nullable().default(null),
  balance: z.number().default(0),
  createInitialTransaction: z.boolean().default(true),
  account_type: z.enum(AccountTypeDto),
  currentAccountNumber: z.string().trim().optional(),
  currentSortCode: z.string().trim().optional(),
  currentOverdraftLimit: z.number().nullable().optional(),
  creditCardAccountNumber: z.string().trim().optional(),
  creditCardInterestRate: z.number().nullable().optional(),
  creditCardCreditLimit: z.number().nullable().optional(),
  creditCardCycleDay: z.number().nullable().optional(),
  savingsInterestRate: z.number().nullable().optional(),
  mortgagePropertyValue: z.number().nullable().optional(),
  mortgageAmount: z.number().nullable().optional(),
  mortgageInterestRate: z.number().nullable().optional(),
  mortgageTermLength: z.number().nullable().optional(),
  loanAmount: z.number().nullable().optional(),
  loanInterestRate: z.number().nullable().optional(),
  loanTermLength: z.number().nullable().optional(),
});

export const accountFormDataSchema = accountFormBaseSchema.superRefine(
  (values, ctx) => {
    const required = (
      value: string | number | null | undefined,
      path: string,
      message: string,
    ) => {
      const empty = value === null || value === undefined || value === '';
      if (empty)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    };

    switch (values.account_type) {
      case AccountTypeDto.CURRENT_ACCOUNT:
        required(
          values.currentAccountNumber,
          'currentAccountNumber',
          'Account number is required',
        );
        required(
          values.currentSortCode,
          'currentSortCode',
          'Sort code is required',
        );
        break;
      case AccountTypeDto.CREDIT_CARD:
        required(
          values.creditCardAccountNumber,
          'creditCardAccountNumber',
          'Account number is required',
        );
        required(
          values.creditCardInterestRate,
          'creditCardInterestRate',
          'Interest rate is required',
        );
        required(
          values.creditCardCreditLimit,
          'creditCardCreditLimit',
          'Credit limit is required',
        );
        required(
          values.creditCardCycleDay,
          'creditCardCycleDay',
          'Cycle day is required',
        );
        break;
      case AccountTypeDto.SAVINGS:
        required(
          values.savingsInterestRate,
          'savingsInterestRate',
          'Interest rate is required',
        );
        break;
      case AccountTypeDto.MORTGAGE:
        required(
          values.mortgagePropertyValue,
          'mortgagePropertyValue',
          'Property value is required',
        );
        required(
          values.mortgageAmount,
          'mortgageAmount',
          'Mortgage amount is required',
        );
        required(
          values.mortgageInterestRate,
          'mortgageInterestRate',
          'Interest rate is required',
        );
        required(
          values.mortgageTermLength,
          'mortgageTermLength',
          'Term length is required',
        );
        break;
      case AccountTypeDto.LOAN:
        required(values.loanAmount, 'loanAmount', 'Loan amount is required');
        required(
          values.loanInterestRate,
          'loanInterestRate',
          'Interest rate is required',
        );
        required(
          values.loanTermLength,
          'loanTermLength',
          'Term length is required',
        );
        break;
    }
  },
);

export type AddAccountFormData = z.infer<typeof accountFormDataSchema>;

const SPECIFIC_FIELDS_BY_TYPE: Partial<
  Record<AccountTypeDto, Array<keyof AddAccountFormData>>
> = {
  [AccountTypeDto.CURRENT_ACCOUNT]: [
    'currentAccountNumber',
    'currentSortCode',
    'currentOverdraftLimit',
  ],
  [AccountTypeDto.CREDIT_CARD]: [
    'creditCardAccountNumber',
    'creditCardInterestRate',
    'creditCardCreditLimit',
    'creditCardCycleDay',
  ],
  [AccountTypeDto.SAVINGS]: ['savingsInterestRate'],
  [AccountTypeDto.MORTGAGE]: [
    'mortgagePropertyValue',
    'mortgageAmount',
    'mortgageInterestRate',
    'mortgageTermLength',
  ],
  [AccountTypeDto.LOAN]: ['loanAmount', 'loanInterestRate', 'loanTermLength'],
};

export function getSpecificStepFields(
  accountType: AccountTypeDto,
): Array<keyof AddAccountFormData> {
  return SPECIFIC_FIELDS_BY_TYPE[accountType] ?? [];
}

export function hasSpecificStep(accountType: AccountTypeDto): boolean {
  return getSpecificStepFields(accountType).length > 0;
}

type AccountProperties =
  | CurrentAccountProperties
  | CreditCardProperties
  | SavingAccountProperties
  | MortgageAccountProperties
  | LoanAccountProperties;

export function getAccountProperties(
  values: AddAccountFormData,
): AccountProperties | null {
  switch (values.account_type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return {
        details: {
          accountNumber: values.currentAccountNumber ?? '',
          sortCode: values.currentSortCode ?? '',
        },
        overdraft: values.currentOverdraftLimit ?? null,
      };
    case AccountTypeDto.CREDIT_CARD:
      return {
        accountNumber: values.creditCardAccountNumber ?? '',
        interestRate: values.creditCardInterestRate ?? null,
        creditLimit: values.creditCardCreditLimit ?? null,
        cycleDay: values.creditCardCycleDay ?? null,
      };
    case AccountTypeDto.SAVINGS:
      return {
        interestRate: values.savingsInterestRate ?? null,
      };
    case AccountTypeDto.MORTGAGE:
      return {
        propertyValue: values.mortgagePropertyValue ?? null,
        mortgageAmount: values.mortgageAmount ?? null,
        interestRate: values.mortgageInterestRate ?? null,
        termLength: values.mortgageTermLength ?? null,
      };
    case AccountTypeDto.LOAN:
      return {
        loanAmount: values.loanAmount ?? null,
        interestRate: values.loanInterestRate ?? null,
        termLength: values.loanTermLength ?? null,
      };
    default:
      return null;
  }
}

export function getSummaryEntries(
  values: AddAccountFormData,
): Array<[string, string]> {
  const entries: Array<[string, string]> = [
    ['Account name', values.name],
    ['Account type', values.account_type],
    ['Currency', values.currency ?? '-'],
    ['Initial balance', values.balance.toString()],
    [
      'Create initial transaction',
      values.createInitialTransaction ? 'Yes' : 'No',
    ],
  ];

  switch (values.account_type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      entries.push(
        ['Account number', values.currentAccountNumber ?? '-'],
        ['Sort code', values.currentSortCode ?? '-'],
        ['Overdraft limit', values.currentOverdraftLimit?.toString() ?? '-'],
      );
      break;
    case AccountTypeDto.CREDIT_CARD:
      entries.push(
        ['Account number', values.creditCardAccountNumber ?? '-'],
        ['Interest rate', values.creditCardInterestRate?.toString() ?? '-'],
        ['Credit limit', values.creditCardCreditLimit?.toString() ?? '-'],
        ['Cycle day', values.creditCardCycleDay?.toString() ?? '-'],
      );
      break;
    case AccountTypeDto.SAVINGS:
      entries.push([
        'Interest rate',
        values.savingsInterestRate?.toString() ?? '-',
      ]);
      break;
    case AccountTypeDto.MORTGAGE:
      entries.push(
        ['Property value', values.mortgagePropertyValue?.toString() ?? '-'],
        ['Mortgage amount', values.mortgageAmount?.toString() ?? '-'],
        ['Interest rate', values.mortgageInterestRate?.toString() ?? '-'],
        ['Term length', values.mortgageTermLength?.toString() ?? '-'],
      );
      break;
    case AccountTypeDto.LOAN:
      entries.push(
        ['Loan amount', values.loanAmount?.toString() ?? '-'],
        ['Interest rate', values.loanInterestRate?.toString() ?? '-'],
        ['Term length', values.loanTermLength?.toString() ?? '-'],
      );
      break;
    default:
      break;
  }

  return entries;
}
