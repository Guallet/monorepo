import { NotFoundException } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import type { AccountsService } from '../../accounts/accounts.service';
import type { CategoriesService } from '../../categories/categories.service';
import type { UsersService } from '../../users/users.service';
import { CsvImportEngine } from './csv-import.engine';

describe('CsvImportEngine account mappings', () => {
  it('looks up mapped accounts within the importing user scope', async () => {
    const getUserAccount = vi.fn().mockRejectedValue(new NotFoundException());
    const findOneById = vi.fn();
    const engine = new CsvImportEngine(
      {} as DataSource,
      { getUserAccount, findOneById } as unknown as AccountsService,
      {} as CategoriesService,
      {
        findUserData: vi.fn().mockResolvedValue(null),
      } as unknown as UsersService,
    );

    await expect(
      engine.execute('user-1', {
        format: 'csv',
        csvData: [],
        fieldMappings: {
          account: 'Account',
          date: 'Date',
          amount: 'Amount',
          description: 'Description',
          notes: '',
          category: '',
        },
        accountMappings: {
          Foreign: { id: 'account-2', name: 'Foreign', shouldCreate: false },
        },
        categoryMappings: {},
      }),
    ).rejects.toThrow(NotFoundException);
    expect(getUserAccount).toHaveBeenCalledWith('user-1', 'account-2');
    expect(findOneById).not.toHaveBeenCalled();
  });
});
