import { registerEnumType } from '@nestjs/graphql';

export enum AccountType {
  CURRENT_ACCOUNT = 'current-account',
  CREDIT_CARD = 'credit-card',
  SAVINGS = 'savings-account',
  INVESTMENT = 'investment',
  MORTGAGE = 'mortgage',
  LOAN = 'loan',
  PENSION = 'pension',
  UNKNOWN = 'Unknown',
}

// Export the enum to GraphQL schema
registerEnumType(AccountType, {
  name: 'AccountType',
});
