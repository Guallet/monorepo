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
    switch (values.account_type) {
      case AccountTypeDto.CURRENT_ACCOUNT: {
        if (!values.currentAccountNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['currentAccountNumber'],
            message: 'Account number is required',
          });
        }
        if (!values.currentSortCode) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['currentSortCode'],
            message: 'Sort code is required',
          });
        }
        break;
      }
      case AccountTypeDto.CREDIT_CARD: {
        if (!values.creditCardAccountNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['creditCardAccountNumber'],
            message: 'Account number is required',
          });
        }
        if (values.creditCardInterestRate == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['creditCardInterestRate'],
            message: 'Interest rate is required',
          });
        }
        if (values.creditCardCreditLimit == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['creditCardCreditLimit'],
            message: 'Credit limit is required',
          });
        }
        if (values.creditCardCycleDay == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['creditCardCycleDay'],
            message: 'Cycle day is required',
          });
        }
        break;
      }
      case AccountTypeDto.SAVINGS: {
        if (values.savingsInterestRate == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['savingsInterestRate'],
            message: 'Interest rate is required',
          });
        }
        break;
      }
      case AccountTypeDto.MORTGAGE: {
        if (values.mortgagePropertyValue == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['mortgagePropertyValue'],
            message: 'Property value is required',
          });
        }
        if (values.mortgageAmount == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['mortgageAmount'],
            message: 'Mortgage amount is required',
          });
        }
        if (values.mortgageInterestRate == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['mortgageInterestRate'],
            message: 'Interest rate is required',
          });
        }
        if (values.mortgageTermLength == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['mortgageTermLength'],
            message: 'Term length is required',
          });
        }
        break;
      }
      case AccountTypeDto.LOAN: {
        if (values.loanAmount == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['loanAmount'],
            message: 'Loan amount is required',
          });
        }
        if (values.loanInterestRate == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['loanInterestRate'],
            message: 'Interest rate is required',
          });
        }
        if (values.loanTermLength == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['loanTermLength'],
            message: 'Term length is required',
          });
        }
        break;
      }
      default:
        break;
    }
  },
);

export type AddAccountFormData = z.infer<typeof accountFormDataSchema>;

const STEP_ONE_FIELDS: Array<keyof AddAccountFormData> = [
  'name',
  'currency',
  'balance',
  'createInitialTransaction',
  'account_type',
];

const STEP_TWO_FIELDS_BY_TYPE: Partial<
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

export function getCommonStepFields(): Array<keyof AddAccountFormData> {
  return STEP_ONE_FIELDS;
}

export function getCommonStepSchema() {
  return accountFormBaseSchema.pick({
    name: true,
    currency: true,
    balance: true,
    createInitialTransaction: true,
    account_type: true,
  });
}

export function getSpecificStepFields(
  accountType: AccountTypeDto,
): Array<keyof AddAccountFormData> {
  return STEP_TWO_FIELDS_BY_TYPE[accountType] ?? [];
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

function requireString(value: string | undefined, field: string): string {
  if (!value) {
    throw new Error(`Missing required field: ${field}`);
  }
  return value;
}

function requireNumber(value: number | null | undefined, field: string): number {
  if (value == null) {
    throw new Error(`Missing required field: ${field}`);
  }
  return value;
}

export function getAccountProperties(
  values: AddAccountFormData,
): AccountProperties | null {
  switch (values.account_type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return {
        details: {
          accountNumber: requireString(
            values.currentAccountNumber,
            'currentAccountNumber',
          ),
          sortCode: requireString(values.currentSortCode, 'currentSortCode'),
        },
        overdraft: values.currentOverdraftLimit ?? null,
      };
    case AccountTypeDto.CREDIT_CARD:
      return {
        accountNumber: requireString(
          values.creditCardAccountNumber,
          'creditCardAccountNumber',
        ),
        interestRate: requireNumber(
          values.creditCardInterestRate,
          'creditCardInterestRate',
        ),
        creditLimit: requireNumber(
          values.creditCardCreditLimit,
          'creditCardCreditLimit',
        ),
        cycleDay: requireNumber(values.creditCardCycleDay, 'creditCardCycleDay'),
      };
    case AccountTypeDto.SAVINGS:
      return {
        interestRate: requireNumber(
          values.savingsInterestRate,
          'savingsInterestRate',
        ),
      };
    case AccountTypeDto.MORTGAGE:
      return {
        propertyValue: requireNumber(
          values.mortgagePropertyValue,
          'mortgagePropertyValue',
        ),
        mortgageAmount: requireNumber(values.mortgageAmount, 'mortgageAmount'),
        interestRate: requireNumber(
          values.mortgageInterestRate,
          'mortgageInterestRate',
        ),
        termLength: requireNumber(values.mortgageTermLength, 'mortgageTermLength'),
      };
    case AccountTypeDto.LOAN:
      return {
        loanAmount: requireNumber(values.loanAmount, 'loanAmount'),
        interestRate: requireNumber(values.loanInterestRate, 'loanInterestRate'),
        termLength: requireNumber(values.loanTermLength, 'loanTermLength'),
      };
    default:
      return null;
  }
}

export function getSummaryEntries(values: AddAccountFormData): Array<[string, string]> {
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
