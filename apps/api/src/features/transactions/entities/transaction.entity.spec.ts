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
