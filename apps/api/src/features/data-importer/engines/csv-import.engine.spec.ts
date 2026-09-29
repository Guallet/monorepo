import { NotFoundException } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import type { AccountsService } from '../../accounts/accounts.service';
import type { CategoriesService } from '../../categories/categories.service';
import type { UsersService } from '../../users/users.service';
import { CsvImportEngine } from './csv-import.engine';

describe('CsvImportEngine', () => {
  it('stops creating accounts after a mapping fails', async () => {
    const create = vi
      .fn()
      .mockRejectedValue(new Error('Account creation failed'));
    const engine = new CsvImportEngine(
      {} as DataSource,
      { create } as unknown as AccountsService,
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
          First: { name: 'First', shouldCreate: true },
          Second: { name: 'Second', shouldCreate: true },
        },
        categoryMappings: {},
      }),
    ).rejects.toThrow('Account creation failed');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('looks up account currency once and saves batches in order', async () => {
    const events: string[] = [];
    const save = vi.fn().mockImplementation(async (entities: unknown[]) => {
      events.push(`save:${entities.length}`);
      return entities;
    });
    const queryRunner = {
      connect: vi.fn(),
      startTransaction: vi.fn(),
      commitTransaction: vi.fn().mockImplementation(() => {
        events.push('commit');
      }),
      rollbackTransaction: vi.fn(),
      release: vi.fn(),
      manager: { getRepository: vi.fn().mockReturnValue({ save }) },
    };
    const findOneById = vi.fn().mockResolvedValue({ currency: 'EUR' });
    const engine = new CsvImportEngine(
      {
        createQueryRunner: vi.fn().mockReturnValue(queryRunner),
      } as unknown as DataSource,
      {
        findOneById,
        getUserAccount: vi.fn().mockResolvedValue({ id: 'account-1' }),
      } as unknown as AccountsService,
      {} as CategoriesService,
      {
        findUserData: vi.fn().mockResolvedValue(null),
      } as unknown as UsersService,
    );
    const onProgress = vi.fn().mockImplementation(async (percent: number) => {
      events.push(`progress:${percent}`);
    });

    const result = await engine.execute(
      'user-1',
      {
        format: 'csv',
        csvData: Array.from({ length: 151 }, (_, index) => ({
          Account: 'Everyday',
          Date: '2024-01-01',
          Amount: String(index + 1),
          Description: `Transaction ${index + 1}`,
        })),
        fieldMappings: {
          account: 'Account',
          date: 'Date',
          amount: 'Amount',
          description: 'Description',
          notes: '',
          category: '',
        },
        accountMappings: {
          Everyday: { id: 'account-1', name: 'Everyday', shouldCreate: false },
        },
        categoryMappings: {},
      },
      onProgress,
    );

    expect(result).toEqual({ processed: 151, failed: 0 });
    expect(findOneById).toHaveBeenCalledExactlyOnceWith('account-1');
    expect(events).toEqual([
      'save:150',
      'progress:99',
      'save:1',
      'progress:100',
      'commit',
    ]);
    expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalledOnce();
  });

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
