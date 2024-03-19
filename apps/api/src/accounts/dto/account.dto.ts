import {
  CreditCardProperties,
  CurrentAccountProperties,
  SavingAccountProperties,
} from '../entities/account-properties.model';
import { Account } from '../entities/account.entity';
import { AccountType } from '../entities/accountType.model';

export class AccountDto {
  id: string;
  name: string;
  balance: { amount: number; currency: string };
  currency: string;
  type: AccountType;
  institutionId: string;
  source?: string;
  sourceName?: string;
  properties?:
    | CurrentAccountProperties
    | CreditCardProperties
    | SavingAccountProperties
    | null;

  static fromDomain(domain: Account): AccountDto {
    return {
      id: domain.id,
      name: domain.name,
      currency: domain.currency,
      balance: {
        amount: domain.balance,
        currency: domain.currency,
      },
      type: domain.type,
      institutionId: domain.institutionId,
      properties: domain.properties,
      source: domain.source,
      sourceName: domain.source_name,
    };
  }
}
