import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { SavingGoalsService } from './saving-goals.service';
import { SavingGoal } from './entities/saving-goal.entity';
import { Account } from '../accounts/entities/account.entity';

describe('SavingGoalsService', () => {
  const goalRepository = {
    create: vi.fn((goal: Partial<SavingGoal>) => goal),
    save: vi.fn(async (goal: SavingGoal) => goal),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(async (goal: SavingGoal) => goal),
  };
  const accountRepository = { find: vi.fn() };
  const service = new SavingGoalsService(
    goalRepository as unknown as Repository<SavingGoal>,
    accountRepository as unknown as Repository<Account>,
  );

  beforeEach(() => vi.clearAllMocks());

  it('lists only the current user’s goals', async () => {
    const goals = [{ id: 'g', userId: 'user-1' }];
    goalRepository.find.mockResolvedValue(goals);
    expect(await service.findAllUserSavingGoals({ userId: 'user-1' })).toEqual(
      goals,
    );
    expect(goalRepository.find).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });

  it('loads a goal using both its id and the current user id', async () => {
    const goal = { id: 'g', userId: 'user-1' };
    goalRepository.findOne.mockResolvedValue(goal);
    expect(
      await service.findByIdForUser({ id: 'g', userId: 'user-1' }),
    ).toEqual(goal);
    expect(goalRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'g', userId: 'user-1' },
    });
  });

  it('rejects missing goals when loading or updating', async () => {
    goalRepository.findOne.mockResolvedValue(null);
    await expect(
      service.findByIdForUser({ id: 'missing', userId: 'user-1' }),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.update({
        userId: 'user-1',
        savingGoalId: 'missing',
        request: { name: 'New' },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('removes only a goal owned by the current user', async () => {
    const goal = { id: 'g', userId: 'user-1' } as SavingGoal;
    goalRepository.findOne.mockResolvedValue(goal);
    await service.remove({ id: 'g', userId: 'user-1' });
    expect(goalRepository.remove).toHaveBeenCalledWith(goal);
    expect(goalRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'g', userId: 'user-1' },
    });
  });

  it('sums only user-owned linked account balances for progress', async () => {
    const goal = {
      id: 'g',
      userId: 'user-1',
      target_amount: 1000,
      accounts: ['a', 'b'],
    } as SavingGoal;
    accountRepository.find.mockResolvedValue([
      { id: 'a', user_id: 'user-1', currency: 'GBP', balance: '200.25' },
      { id: 'b', user_id: 'user-1', currency: 'GBP', balance: '299.75' },
    ]);
    const dto = await service.toDto(goal, 'user-1');
    expect(dto.currentAmount).toBe(500);
    expect(dto.progressPercentage).toBe(50);
    expect(dto.currency).toBe('GBP');
    expect(accountRepository.find).toHaveBeenCalledWith({
      where: { user_id: 'user-1', id: expect.anything() },
    });
  });

  it('rejects a goal linked to accounts outside the current user', async () => {
    accountRepository.find.mockResolvedValue([]);
    await expect(
      service.create({
        userId: 'user-1',
        request: {
          name: 'Trip',
          targetAmount: 100,
          accounts: ['other-account'],
        },
      }),
    ).rejects.toThrow(BadRequestException);
    expect(goalRepository.save).not.toHaveBeenCalled();
  });

  it('rejects mixed account currencies', async () => {
    accountRepository.find.mockResolvedValue([
      { id: 'a', currency: 'GBP' },
      { id: 'b', currency: 'EUR' },
    ]);
    await expect(
      service.create({
        userId: 'user-1',
        request: { name: 'Trip', targetAmount: 100, accounts: ['a', 'b'] },
      }),
    ).rejects.toThrow('Linked accounts must use the same currency');
  });

  it('maps update DTO fields to persisted entity fields and clears a deadline', async () => {
    const goal = {
      id: 'g',
      userId: 'user-1',
      name: 'Old',
      target_amount: 100,
      target_date: new Date('2030-01-01'),
      accounts: ['a'],
    } as SavingGoal;
    goalRepository.findOne.mockResolvedValue(goal);
    accountRepository.find.mockResolvedValue([{ id: 'a', currency: 'GBP' }]);
    await service.update({
      userId: 'user-1',
      savingGoalId: 'g',
      request: { name: 'New', targetAmount: 250, targetDate: null },
    });
    expect(goalRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New',
        target_amount: 250,
        target_date: null,
      }),
    );
  });
  it.each([
    ['JPY', 1.5],
    ['GBP', 1.234],
  ])(
    'rejects excess %s precision on create and update',
    async (currency, amount) => {
      accountRepository.find.mockResolvedValue([{ id: 'a', currency }]);
      goalRepository.findOne.mockResolvedValue({
        id: 'g',
        accounts: ['a'],
        target_amount: 100,
      });
      await expect(
        service.create({
          userId: 'user-1',
          request: { name: 'Trip', targetAmount: amount, accounts: ['a'] },
        }),
      ).rejects.toThrow('decimal places');
      await expect(
        service.update({
          userId: 'user-1',
          savingGoalId: 'g',
          request: { targetAmount: amount },
        }),
      ).rejects.toThrow('decimal places');
      expect(goalRepository.save).not.toHaveBeenCalled();
    },
  );

  it('revalidates the existing target when changing linked currency', async () => {
    accountRepository.find.mockResolvedValue([{ id: 'b', currency: 'JPY' }]);
    goalRepository.findOne.mockResolvedValue({
      id: 'g',
      accounts: ['a'],
      target_amount: 1.5,
    });
    await expect(
      service.update({
        userId: 'user-1',
        savingGoalId: 'g',
        request: { accounts: ['b'] },
      }),
    ).rejects.toThrow('decimal places');
    expect(goalRepository.save).not.toHaveBeenCalled();
  });

  it('accepts three-decimal currencies and legacy currency codes', async () => {
    accountRepository.find.mockResolvedValue([{ id: 'a', currency: 'BHD' }]);
    await expect(
      service.create({
        userId: 'user-1',
        request: { name: 'Trip', targetAmount: 1.234, accounts: ['a'] },
      }),
    ).resolves.toMatchObject({ target_amount: 1.234 });
    accountRepository.find.mockResolvedValue([{ id: 'a', currency: 'ZZZ' }]);
    await expect(
      service.create({
        userId: 'user-1',
        request: { name: 'Trip', targetAmount: 100, accounts: ['a'] },
      }),
    ).resolves.toMatchObject({ target_amount: 100 });
  });

  it('rejects mixed currencies after a linked account edit instead of dropping balances', async () => {
    accountRepository.find.mockResolvedValue([
      { id: 'a', currency: 'GBP', balance: 1 },
      { id: 'b', currency: 'EUR', balance: 1 },
    ]);
    await expect(
      service.toDto(
        { accounts: ['a', 'b'], target_amount: 10 } as SavingGoal,
        'user-1',
      ),
    ).rejects.toThrow('same currency');
  });

  it('batches account reads and rounds totals and remaining amounts', async () => {
    accountRepository.find.mockResolvedValue([
      { id: 'a', currency: 'GBP', balance: 0.1 },
      { id: 'b', currency: 'GBP', balance: 0.7 },
    ]);
    const goals = [
      { accounts: ['a', 'b'], target_amount: 0.8 },
      { accounts: ['b'], target_amount: 0.8 },
    ] as SavingGoal[];
    const dtos = await service.toDtos(goals, 'user-1');
    expect(accountRepository.find).toHaveBeenCalledTimes(1);
    expect(accountRepository.find).toHaveBeenCalledWith({
      where: { user_id: 'user-1', id: expect.anything() },
    });
    expect(dtos[0]).toMatchObject({
      currentAmount: 0.8,
      isCompleted: true,
      remainingAmount: 0,
    });
    expect(dtos[1].remainingAmount).toBe(0.1);
  });

  it('skips account queries for an empty goal list', async () => {
    expect(await service.toDtos([], 'user-1')).toEqual([]);
    expect(accountRepository.find).not.toHaveBeenCalled();
  });
});
