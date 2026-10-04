import { AccountDto } from '../features/accounts/dto/account.dto';
import { Account } from '../features/accounts/entities/account.entity';
import { TransactionDto } from '../features/transactions/dto/transaction.dto';
import { Transaction } from '../features/transactions/entities/transaction.entity';
import { UserSettingsDto } from '../features/users/dto/user-settings.dto';
import { User } from '../features/users/entities/user.entity';

function serialized(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

describe('Nullable response compatibility', () => {
  it('preserves null account institution and properties in JSON', () => {
    const account = new Account();
    Object.assign(account, { institutionId: null, properties: null });

    const response = serialized(AccountDto.fromDomain(account));

    expect(response).toHaveProperty('institutionId', null);
    expect(response).toHaveProperty('properties', null);
  });

  it('preserves a null transaction category in JSON', () => {
    const transaction = new Transaction();
    transaction.categoryId = null;

    const response = serialized(TransactionDto.fromDomain(transaction));

    expect(response).toHaveProperty('categoryId', null);
  });

  it('preserves a null user date format in JSON', () => {
    const user = new User();
    Object.assign(user, { date_format: null });

    const response = serialized(UserSettingsDto.fromDomain(user));

    expect(response).toHaveProperty('date_format', null);
  });
});
