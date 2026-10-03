import { AccountDto } from '../features/accounts/dto/account.dto';
import { Account } from '../features/accounts/entities/account.entity';
import { TransactionDto } from '../features/transactions/dto/transaction.dto';
import { Transaction } from '../features/transactions/entities/transaction.entity';
import { UserSettingsDto } from '../features/users/dto/user-settings.dto';
import { User } from '../features/users/entities/user.entity';

function serialized(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

describe('Optional response fields', () => {
  it('omits null account institution and properties from JSON', () => {
    const account = new Account();
    Object.assign(account, { institutionId: null, properties: null });

    const response = serialized(AccountDto.fromDomain(account));

    expect(response).not.toHaveProperty('institutionId');
    expect(response).not.toHaveProperty('properties');
  });

  it('omits a null transaction category from JSON', () => {
    const transaction = new Transaction();
    transaction.categoryId = null;

    const response = serialized(TransactionDto.fromDomain(transaction));

    expect(response).not.toHaveProperty('categoryId');
  });

  it('omits a null user date format from JSON', () => {
    const user = new User();
    Object.assign(user, { date_format: null });

    const response = serialized(UserSettingsDto.fromDomain(user));

    expect(response).not.toHaveProperty('date_format');
  });
});
