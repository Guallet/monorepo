import { Account, AccountType } from '../entities/account.entity';

export class AccountConnectionDto {
  last_refreshed: Date;
  status: string;
}

export class AccountDto {
  id: string;
  account_type: AccountType;
  name: string;
  balance: number;
  currency: string;
  connection_details?: AccountConnectionDto;

  financial_institution?: {
    id: string;
    name: string;
    logo: string;
  };

  constructor(account: Account) {
    this.id = account.id;
    this.account_type = account.type;
    this.name = account.name;
    this.balance = account.balance;
    this.currency = account.currency;

    if (account.nordigenAccount != null) {
      this.connection_details = {
        last_refreshed: account.nordigenAccount.last_refreshed,
        status: account.nordigenAccount.status,
      };
    }

    if (account.institution != null) {
      this.financial_institution = {
        id: account.institution.id,
        name: account.institution.name,
        logo: account.institution.image_src,
      };
    }
  }
}
