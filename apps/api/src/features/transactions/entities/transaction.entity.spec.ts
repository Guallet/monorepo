import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Account } from 'src/features/accounts/entities/account.entity';
import { Budget } from 'src/features/budgets/entities/budget.entity';
import { Category } from 'src/features/categories/entities/category.entity';
import { Institution } from 'src/features/institutions/entities/institution.entity';
import { Transaction } from './transaction.entity';

class MetadataDataSource extends DataSource {
  async validateMetadata() {
    await this.buildMetadatas();
  }
}

describe('Transaction PostgreSQL metadata', () => {
  it('validates nullable text and foreign keys without a database connection', async () => {
    const dataSource = new MetadataDataSource({
      type: 'postgres',
      entities: [Transaction, Account, Category, Institution, Budget],
    });

    await expect(dataSource.validateMetadata()).resolves.toBeUndefined();

    const notes = dataSource
      .getMetadata(Transaction)
      .findColumnWithPropertyName('notes');
    expect(notes?.type).toBe('text');
    expect(notes?.isNullable).toBe(true);
  });
});

describe('Transaction.fromNordigenDto', () => {
  const transaction = (dates: { bookingDateTime?: string; bookingDate?: string }) =>
    Transaction.fromNordigenDto('account-id', {
      transactionId: 'external-id',
      transactionAmount: { amount: '12.34', currency: 'EUR' },
      proprietaryBankTransactionCode: '',
      remittanceInformationUnstructured: '',
      ...dates,
    });

  it('uses the booking timestamp when present', () => {
    expect(
      transaction({
        bookingDateTime: '2025-04-03T10:15:30+02:00',
        bookingDate: '2025-04-02',
      }).date.toISOString(),
    ).toBe('2025-04-03T08:15:30.000Z');
  });

  it('uses date-only bookings at midnight UTC', () => {
    expect(transaction({ bookingDate: '2025-04-03' }).date.toISOString()).toBe(
      '2025-04-03T00:00:00.000Z',
    );
  });

  it.each([
    {},
    { bookingDate: '2025-02-30' },
    { bookingDateTime: 'not-a-date' },
  ])('rejects missing or invalid booking dates: %o', (dates) => {
    expect(() => transaction(dates)).toThrow(
      'Nordigen transaction external-id has no valid bookingDateTime or bookingDate',
    );
  });
});
