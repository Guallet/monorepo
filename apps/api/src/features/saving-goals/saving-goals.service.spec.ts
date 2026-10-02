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
});
